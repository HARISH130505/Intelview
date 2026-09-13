import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { plannerService } from '../services/PlannerService';
import { aiRateLimiter } from '../middleware/rateLimit';

const router = Router();

// POST /api/planner/generate
router.post('/generate', optionalAuth, aiRateLimiter, asyncHandler(async (req: any, res: any) => {
  const { companyId, companyName, role, experienceLevel, availableDays, dailyHours, targetDate } = req.body;
  
  if (!companyName || !role) {
    res.status(400).json({ success: false, message: 'Please provide company name and target role' });
    return;
  }

  const result = await plannerService.generatePlan({
    userId: req.userId,
    companyId,
    companyName,
    role,
    experienceLevel: experienceLevel || 'fresher',
    availableDays: availableDays ? parseInt(availableDays) : 30,
    dailyHours: dailyHours ? parseFloat(dailyHours) : 3,
    targetDate,
  });

  res.json({ success: true, ...result });
}));

// GET /api/planner
router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const plans = await plannerService.getUserPlans(req.userId);
  res.json({ success: true, plans });
}));

// GET /api/planner/:id
router.get('/:id', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const plan = await plannerService.getPlanById(req.params.id, req.userId);
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  res.json({ success: true, plan });
}));

// PATCH /api/planner/:id/progress
router.patch('/:id/progress', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { progress } = req.body;
  const plan = await plannerService.updateProgress(req.params.id, req.userId, progress);
  res.json({ success: true, plan });
}));

export default router;
