import { prisma } from '../utils/prisma';
import { aiService } from './AIService';
import cloudinary from '../utils/cloudinary';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { resolveUserId } from '../utils/userResolver';

export class ResumeService {
  async uploadAndAnalyze(params: {
    userId?: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    jdText?: string;
    jdTitle?: string;
    jdCompany?: string;
  }) {
    const internalUserId = await resolveUserId(params.userId);

    // 1. Read PDF text FIRST before unlinking
    // NOTE: Only PDF parsing is implemented. DOC/DOCX files are not supported
    // because they are binary formats requiring a separate parsing library.
    // The multer file filter already rejects non-PDF/DOC/DOCX files, but at
    // the service level we reject DOC/DOCX explicitly so the AI never receives
    // a filename string as the resume text.
    const ext = params.fileName.toLowerCase().split('.').pop() || '';
    if (ext === 'doc' || ext === 'docx') {
      // Clean up uploaded temp file before throwing
      try { if (fs.existsSync(params.filePath)) fs.unlinkSync(params.filePath); } catch {}
      throw Object.assign(
        new Error('DOC and DOCX files cannot be parsed on the server. Please convert your resume to PDF and try again.'),
        { statusCode: 400 }
      );
    }

    let resumeText = '';
    try {
      if (fs.existsSync(params.filePath)) {
        const buffer = fs.readFileSync(params.filePath);
        if (buffer.length > 0) {
          const parsed = await pdfParse(buffer);
          resumeText = (parsed.text || '').trim();
        }
      }
      if (!resumeText) {
        try { if (fs.existsSync(params.filePath)) fs.unlinkSync(params.filePath); } catch {}
        throw Object.assign(
          new Error('The uploaded PDF contains no extractable text. Scanned or image-only PDFs are not supported. Please upload a text-based PDF.'),
          { statusCode: 400, isOperational: true }
        );
      }
    } catch (err: any) {
      // PDF parsing failed — clean up and surface the error instead of silently
      // falling back to the filename (which caused the AI to return a fake score)
      try { if (fs.existsSync(params.filePath)) fs.unlinkSync(params.filePath); } catch {}
      console.error('PDF parsing error:', err);
      if (err.statusCode) throw err;
      throw Object.assign(
        new Error('Could not extract text from the uploaded PDF. The file may be image-based, password-protected, or corrupted. Please try a text-based PDF.'),
        { statusCode: 400, isOperational: true }
      );
    }

    // 2. Upload file to Cloudinary (optional fallback)
    let fileUrl = '';
    try {
      const result = await cloudinary.uploader.upload(params.filePath, {
        folder: 'intelview/resumes',
        resource_type: 'raw',
        public_id: `resume-${internalUserId}-${Date.now()}`,
      });
      fileUrl = result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, using local path:', err);
      fileUrl = params.fileName; // Fallback
    }

    // 3. Clean up temp file
    try {
      if (fs.existsSync(params.filePath)) {
        fs.unlinkSync(params.filePath);
      }
    } catch {}

    // 4. Store upload record
    const upload = await prisma.resumeUpload.create({
      data: {
        userId: internalUserId,
        fileUrl,
        fileName: params.fileName,
        fileSize: params.fileSize,
      },
    });

    // AI Analysis
    let analysis;
    if (params.jdText && resumeText) {
      analysis = await aiService.compareResumeToJD(resumeText, params.jdText);
    } else if (resumeText) {
      const partial = await aiService.analyzeResume(resumeText);
      analysis = {
        atsScore: (partial as any).overallScore || 60,
        matchedSkills: (partial as any).skills || [],
        missingSkills: [],
        matchedKeywords: [],
        suggestions: (partial as any).suggestions || [],
        skillsBreakdown: { technical: 70, experience: 60, education: 80, keywords: 50 },
        summary: (partial as any).experience || 'Resume analyzed successfully.',
      };
    } else {
      analysis = {
        atsScore: 0,
        matchedSkills: [],
        missingSkills: [],
        matchedKeywords: [],
        suggestions: [{ category: 'Error', priority: 'high' as const, suggestion: 'Could not parse PDF', impact: 'Try a different file' }],
        skillsBreakdown: { technical: 0, experience: 0, education: 0, keywords: 0 },
        summary: 'Unable to analyze resume.',
      };
    }

    // Store analysis
    const storedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: upload.id,
        jdText: params.jdText,
        jdTitle: params.jdTitle,
        jdCompany: params.jdCompany,
        atsScore: analysis.atsScore,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        matchedKeywords: analysis.matchedKeywords,
        suggestions: analysis.suggestions as any,
        skillsBreakdown: analysis.skillsBreakdown as any,
      },
    });

    return { upload, analysis: storedAnalysis, summary: analysis.summary };
  }

  async getUserResumeHistory(userId?: string) {
    const internalUserId = await resolveUserId(userId);
    return prisma.resumeUpload.findMany({
      where: { userId: internalUserId },
      include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getAnalysisById(id: string) {
    return prisma.resumeAnalysis.findUnique({
      where: { id },
      include: { resume: { select: { fileName: true, fileUrl: true, userId: true } } },
    });
  }
}

export const resumeService = new ResumeService();
