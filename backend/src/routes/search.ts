import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { q, type, limit = 20 } = req.query;
  if (!q || (q as string).length < 2) {
    res.status(400).json({ success: false, message: 'Query too short' });
    return;
  }

  const query = q as string;
  const searchType = type as string | undefined;
  const lim = parseInt(limit as string);

  const results: any = {};

  if (!searchType || searchType === 'companies') {
    results.companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: Math.min(lim, 5),
      select: { id: true, name: true, slug: true, logo: true, tier: true },
    });
  }

  if (!searchType || searchType === 'questions') {
    results.questions = await prisma.question.findMany({
      where: {
        OR: [
          { text: { contains: query, mode: 'insensitive' } },
          { topics: { some: { topic: { name: { contains: query, mode: 'insensitive' } } } } },
        ],
      },
      take: Math.min(lim, 10),
      include: {
        topics: { include: { topic: true } },
        companyQuestions: {
          include: { company: { select: { name: true, slug: true } } },
          take: 2,
        },
      },
    });
  }

  if (!searchType || searchType === 'reports') {
    results.reports = await prisma.interviewReport.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { role: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: Math.min(lim, 5),
      include: { company: { select: { name: true, slug: true } } },
    });
  }

  if (!searchType || searchType === 'topics') {
    results.topics = await prisma.topic.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: Math.min(lim, 5),
    });
  }

  // Save search history
  if (req.userId) {
    await prisma.searchHistory.create({
      data: {
        userId: req.userId,
        query,
        filters: { type: searchType },
        resultCount: Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0),
      },
    }).catch(() => {}); // Don't fail if search history fails
  }

  res.json({ success: true, query, results });
}));

export default router;
