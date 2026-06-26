import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { questionService } from '../services/QuestionService';

const router = Router();

router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { page, limit, difficulty, type, topic, company, search } = req.query;
  const result = await questionService.getAllQuestions({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
    difficulty: difficulty as string,
    type: type as string,
    topic: topic as string,
    company: company as string,
    search: search as string,
  });
  res.json({ success: true, ...result });
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
