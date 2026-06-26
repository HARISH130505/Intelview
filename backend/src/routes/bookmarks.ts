import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.userId },
    include: {
      question: { include: { topics: { include: { topic: true } } } },
      company: { select: { id: true, name: true, slug: true, logo: true } },
      studyPlan: { select: { id: true, title: true, progress: true } },
      mockSession: { select: { id: true, role: true, totalScore: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, bookmarks });
}));

router.post('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  const { type, questionId, companyId, reportId, studyPlanId, mockSessionId, notes } = req.body;

  // Check for duplicates
  const existing = await prisma.bookmark.findFirst({
    where: {
      userId: req.userId,
      type,
      OR: [
        { questionId: questionId || undefined },
        { companyId: companyId || undefined },
        { reportId: reportId || undefined },
        { studyPlanId: studyPlanId || undefined },
        { mockSessionId: mockSessionId || undefined },
      ],
    },
  });

  if (existing) {
    res.status(400).json({ success: false, message: 'Already bookmarked' });
    return;
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: req.userId!,
      type,
      questionId,
      companyId,
      reportId,
      studyPlanId,
      mockSessionId,
      notes,
    },
  });
  res.status(201).json({ success: true, bookmark });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req: any, res: any) => {
  await prisma.bookmark.deleteMany({
    where: { id: req.params.id, userId: req.userId! },
  });
  res.json({ success: true, message: 'Bookmark removed' });
}));

export default router;
