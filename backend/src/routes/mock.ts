import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { mockService } from '../services/MockService';
import { aiRateLimiter } from '../middleware/rateLimit';

const router = Router();

// POST /api/mock/start
router.post('/start', optionalAuth, aiRateLimiter, asyncHandler(async (req: any, res: any) => {
  const { companyId, companyName, role, type, difficulty, numQuestions } = req.body;
  const result = await mockService.startSession({
    userId: req.userId,
    companyId,
    companyName: companyName || 'General Tech',
    role: role || 'Software Engineer',
    type: type || 'CODING',
    difficulty: difficulty || 'MEDIUM',
    numQuestions: numQuestions ? parseInt(numQuestions) : 5,
  });
  res.json({ success: true, ...result });
}));

// POST /api/mock/:id/answer
router.post('/:id/answer', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { questionId, answer, timeTaken } = req.body;
  const result = await mockService.submitAnswer({
    sessionId: req.params.id,
    questionId,
    answer,
    timeTaken,
  });
  res.json({ success: true, evaluation: result });
}));

// POST /api/mock/:id/complete
router.post('/:id/complete', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const session = await mockService.completeSession(req.params.id, req.userId);
  res.json({ success: true, session });
}));

// GET /api/mock/:id/report
router.get('/:id/report', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const report = await mockService.getSessionReport(req.params.id, req.userId);
  if (!report) {
    res.status(404).json({ success: false, message: 'Session not found' });
    return;
  }
  res.json({ success: true, report });
}));

// GET /api/mock
router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const sessions = await mockService.getUserSessions(req.userId);
  res.json({ success: true, sessions });
}));

export default router;
