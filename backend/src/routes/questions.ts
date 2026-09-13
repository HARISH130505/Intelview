import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { questionService } from '../services/QuestionService';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { page, limit, difficulty, type, topic, company, role, search, source, verified } = req.query;
  const result = await questionService.getAllQuestions({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 50,
    difficulty: difficulty as string,
    type: type as string,
    topic: topic as string,
    company: company as string,
    role: role as string,
    search: search as string,
    source: source as string,
    verified: verified === 'true' ? true : undefined,
  });
  res.json({ success: true, ...result });
}));

// GET /api/questions/filters — returns unique companies and topics for filter dropdowns
router.get('/filters', asyncHandler(async (_req: any, res: any) => {
  const [companies, topics] = await Promise.all([
    // All companies that have at least one linked question
    prisma.company.findMany({
      where: { companyQuestions: { some: {} } },
      select: { name: true, slug: true, tier: true },
      orderBy: { name: 'asc' },
    }),
    // All topics that have at least one linked question
    prisma.topic.findMany({
      where: { questionTopics: { some: {} } },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
  ]);
  res.json({ success: true, companies, topics });
}));

router.get('/trending', asyncHandler(async (req: any, res: any) => {
  const { limit } = req.query;
  const questions = await questionService.getTrendingQuestions(limit ? parseInt(limit) : 10);
  res.json({ success: true, questions });
}));

router.get('/:id', asyncHandler(async (req: any, res: any) => {
  const question = await questionService.getQuestionById(req.params.id);
  if (!question) {
    res.status(404).json({ success: false, message: 'Question not found' });
    return;
  }
  await questionService.incrementViewCount(req.params.id);
  res.json({ success: true, question });
}));

export default router;
