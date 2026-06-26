import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/trending', asyncHandler(async (_req: any, res: any) => {
  const [topQuestions, topCompanies, topTopics] = await Promise.all([
    prisma.question.findMany({
      orderBy: { frequency: 'desc' },
      take: 10,
      include: {
        topics: { include: { topic: true } },
        companyQuestions: {
          include: { company: { select: { name: true, slug: true } } },
          take: 3,
          orderBy: { frequency: 'desc' },
        },
      },
    }),
    prisma.company.findMany({
      where: { isActive: true },
      take: 8,
      include: { _count: { select: { reports: { where: { status: 'APPROVED' } } } } },
      orderBy: { name: 'asc' },
    }),
    prisma.topic.findMany({
      take: 12,
      include: { _count: { select: { questionTopics: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  res.json({ success: true, data: { topQuestions, topCompanies, topTopics } });
}));

router.get('/topics', asyncHandler(async (_req: any, res: any) => {
  const topics = await prisma.topic.findMany({
    include: {
      _count: { select: { questionTopics: true } },
    },
    orderBy: { name: 'asc' },
  });

  const grouped = topics.reduce((acc: any, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {});

  res.json({ success: true, topics, grouped });
}));

router.get('/overview', asyncHandler(async (_req: any, res: any) => {
  const [totalCompanies, totalQuestions, totalReports, totalUsers] = await Promise.all([
    prisma.company.count({ where: { isActive: true } }),
    prisma.question.count(),
    prisma.interviewReport.count({ where: { status: 'APPROVED' } }),
    prisma.user.count(),
  ]);

  res.json({
    success: true,
    stats: { totalCompanies, totalQuestions, totalReports, totalUsers },
  });
}));

export default router;
