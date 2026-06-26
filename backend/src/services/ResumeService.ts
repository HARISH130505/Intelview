import { prisma } from '../utils/prisma';
import { aiService } from './AIService';
import cloudinary from '../utils/cloudinary';
import pdfParse from 'pdf-parse';
import fs from 'fs';

export class ResumeService {
  async uploadAndAnalyze(params: {
    userId: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    jdText?: string;
    jdTitle?: string;
    jdCompany?: string;
  }) {
    // Upload file to Cloudinary
    let fileUrl = '';
    try {
      const result = await cloudinary.uploader.upload(params.filePath, {
        folder: 'intelview/resumes',
        resource_type: 'raw',
        public_id: `resume-${params.userId}-${Date.now()}`,
      });
      fileUrl = result.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, using local path:', err);
      fileUrl = params.filePath; // Fallback
    }

    // Clean up temp file
    try { fs.unlinkSync(params.filePath); } catch {}

    // Store upload record
    const upload = await prisma.resumeUpload.create({
      data: {
        userId: params.userId,
        fileUrl,
        fileName: params.fileName,
        fileSize: params.fileSize,
      },
    });

    // Read PDF text (if it's a local path we can still parse it or use fileUrl)
    let resumeText = '';
    try {
      const buffer = fs.existsSync(params.filePath) 
        ? fs.readFileSync(params.filePath)
        : Buffer.from('');
      if (buffer.length > 0) {
        const parsed = await pdfParse(buffer);
        resumeText = parsed.text;
      }
    } catch (err) {
      resumeText = params.fileName; // Minimal fallback
    }

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

  async getUserResumeHistory(userId: string) {
    return prisma.resumeUpload.findMany({
      where: { userId },
      include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getAnalysisById(id: string) {
    return prisma.resumeAnalysis.findUnique({
      where: { id },
      include: { resume: { select: { fileName: true, fileUrl: true } } },
    });
  }
}

export const resumeService = new ResumeService();
