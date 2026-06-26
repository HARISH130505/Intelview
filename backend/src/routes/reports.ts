import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { reportService } from '../services/ReportService';

const router = Router();

router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { page, limit, company, role, difficulty } = req.query;
  const result = await reportService.getAllReports({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    company: company as string,
    role: role as string,
    difficulty: difficulty as string,
  });
  res.json({ success: true, ...result });
}));

router.get('/pending', requireAuth, asyncHandler(async (req: any, res: any) => {
  const { page } = req.query;
  const result = await reportService.getPendingReports(page ? parseInt(page) : 1);
  res.json({ success: true, ...result });
}));

router.get('/:id', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.getReportById(req.params.id);
  if (!report) {
    res.status(404).json({ success: false, message: 'Report not found' });
    return;
  }
  res.json({ success: true, report });
}));

router.post('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const data = { ...req.body, userId: req.userId };
  const report = await reportService.submitReport(data);
  res.status(201).json({ success: true, report, message: 'Report submitted for review' });
}));

router.post('/:id/helpful', asyncHandler(async (req: any, res: any) => {
  const report = await reportService.markHelpful(req.params.id);
  res.json({ success: true, report });
}));

router.put('/:id/approve', requireAuth, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.approveReport(req.params.id);
  res.json({ success: true, report });
}));

router.put('/:id/reject', requireAuth, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.rejectReport(req.params.id);
  res.json({ success: true, report });
}));

export default router;
