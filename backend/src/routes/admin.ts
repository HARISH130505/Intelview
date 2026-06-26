import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { reportService } from '../services/ReportService';

const router = Router();

router.get('/stats', requireAdmin, asyncHandler(async (_req: any, res: any) => {
  const [users, companies, reports, questions, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.interviewReport.count(),
    prisma.question.count(),
    prisma.interviewReport.count({ where: { status: 'PENDING' } }),
  ]);

  const recentReports = await prisma.interviewReport.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { company: { select: { name: true } } },
  });

  res.json({ success: true, stats: { users, companies, reports, questions, pendingReports }, recentReports });
}));

router.get('/reports/pending', requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { page } = req.query;
  const result = await reportService.getPendingReports(page ? parseInt(page) : 1);
  res.json({ success: true, ...result });
}));

router.put('/reports/:id/approve', requireAdmin, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.approveReport(req.params.id);
  res.json({ success: true, report });
}));

router.put('/reports/:id/reject', requireAdmin, asyncHandler(async (req: any, res: any) => {
  const report = await reportService.rejectReport(req.params.id);
  res.json({ success: true, report });
}));

router.get('/users', requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { page = 1 } = req.query;
  const skip = (parseInt(page as string) - 1) * 20;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { reports: true, mockSessions: true } } },
    }),
    prisma.user.count(),
  ]);
  res.json({ success: true, users, total });
}));

router.post('/companies', requireAdmin, asyncHandler(async (req: any, res: any) => {
  const company = await prisma.company.create({ data: req.body });
  res.status(201).json({ success: true, company });
}));

router.put('/companies/:id', requireAdmin, asyncHandler(async (req: any, res: any) => {
  const company = await prisma.company.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, company });
}));

export default router;
