import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { reportService } from '../services/ReportService';
import { aiService } from '../services/AIService';

const router = Router();

// GET /api/reports - list reports with filters
router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { page, limit, company, role, difficulty, status } = req.query;
  const result = await reportService.getAllReports({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    company: company as string,
    role: role as string,
    difficulty: difficulty as string,
    status: status as string,
  });
  res.json({ success: true, ...result });
}));

// POST /api/reports/extract - extract rounds & questions from raw text with AI before submitting
router.post('/extract', asyncHandler(async (req: any, res: any) => {
  const { rawText } = req.body;
  if (!rawText || rawText.trim().length < 15) {
    res.status(400).json({ success: false, message: 'Please provide at least a few sentences describing the interview experience.' });
    return;
  }
  const extracted = await aiService.extractInterview(rawText);
  res.json({ success: true, extracted });
}));

// GET /api/reports/pending - admin pending reports
router.get('/pending', requireAuth, asyncHandler(async (req: any, res: any) => {
  const { page } = req.query;
  const result = await reportService.getPendingReports(page ? parseInt(page) : 1);
  res.json({ success: true, ...result });
}));

// GET /api/reports/:id - get single report detail
router.get('/:id', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.getReportById(req.params.id);
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }
  res.json({ success: true, report });
}));

// POST /api/reports - submit an interview experience
router.post('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const data = { ...req.body, userId: req.userId };
  const report = await reportService.submitReport(data);
  res.status(201).json({ success: true, report, message: 'Report submitted successfully' });
}));

// POST /api/reports/:id/helpful - mark a report as helpful
router.post('/:id/helpful', asyncHandler(async (req: any, res: any) => {
  const report = await reportService.markHelpful(req.params.id);
  res.json({ success: true, report });
}));

// Admin routes
router.put('/:id/approve', requireAuth, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.approveReport(req.params.id);
  res.json({ success: true, report });
}));

router.put('/:id/reject', requireAuth, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.rejectReport(req.params.id);
  res.json({ success: true, report });
}));

export default router;
