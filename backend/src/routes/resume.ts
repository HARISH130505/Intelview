import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { resumeService } from '../services/ResumeService';
import { uploadRateLimiter } from '../middleware/rateLimit';
import { resolveUserId } from '../utils/userResolver';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: any, file: any, cb: any) => {
    // Only PDF is supported — DOC/DOCX require a separate binary parser not installed.
    // The service double-checks this, but reject early here for a cleaner error.
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') cb(null, true);
    else cb(Object.assign(new Error('Only PDF files are supported. Please convert your resume to PDF.'), { statusCode: 400 }));
  },
});

router.post('/upload', optionalAuth, uploadRateLimiter, upload.single('resume'), asyncHandler(async (req: any, res: any) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  const { jdText, jdTitle, jdCompany } = req.body;

  const result = await resumeService.uploadAndAnalyze({
    userId: req.userId!,
    filePath: req.file.path,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    jdText,
    jdTitle,
    jdCompany,
  });

  res.json({ success: true, ...result });
}));

router.get('/history', requireAuth, asyncHandler(async (req: any, res: any) => {
  const history = await resumeService.getUserResumeHistory(req.userId!);
  res.json({ success: true, history });
}));

router.get('/analysis/:id', requireAuth, asyncHandler(async (req: any, res: any) => {
  const analysis = await resumeService.getAnalysisById(req.params.id);
  if (!analysis) {
    res.status(404).json({ success: false, message: 'Analysis not found' });
    return;
  }

  // IDOR check: resolve the Clerk userId to internal user ID and compare
  // against the resume upload's owner to prevent cross-user data access.
  const internalUserId = await resolveUserId(req.userId);
  if (analysis.resume?.userId && analysis.resume.userId !== internalUserId) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  res.json({ success: true, analysis });
}));

export default router;
