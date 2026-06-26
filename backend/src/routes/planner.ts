import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { plannerService } from '../services/PlannerService';
import { aiRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/generate', requireAuth, aiRateLimiter, asyncHandler(async (req: any, res: any) => {
  const { companyId, companyName, role, experienceLevel, availableDays, dailyHours, targetDate } = req.body;
  
  if (!companyName || !role || !experienceLevel || !availableDays || !dailyHours) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
    return;
  }

  const result = await plannerService.generatePlan({
    userId: req.userId!,
    companyId,
    companyName,
    role,
    experienceLevel,
    availableDays: parseInt(availableDays),
    dailyHours: parseFloat(dailyHours),
    targetDate,
  });

  res.json({ success: true, ...result });
}));

router.get('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  const plans = await plannerService.getUserPlans(req.userId!);
  res.json({ success: true, plans });
}));

router.get('/:id', requireAuth, asyncHandler(async (req: any, res: any) => {
  const plan = await plannerService.getPlanById(req.params.id, req.userId!);
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  res.json({ success: true, plan });
}));

router.patch('/:id/progress', requireAuth, asyncHandler(async (req: any, res: any) => {
  const { progress } = req.body;
  const plan = await plannerService.updateProgress(req.params.id, req.userId!, progress);
  res.json({ success: true, plan });
}));

export default router;
