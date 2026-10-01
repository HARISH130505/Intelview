import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { resolveUserId } from '../utils/userResolver';

const router = Router();

// GET /api/bookmarks — list user's bookmarks
router.get('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  // req.userId is a Clerk ID ('user_...') — must resolve to internal Prisma User.id
  const internalUserId = await resolveUserId(req.userId);
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: internalUserId },
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

// POST /api/bookmarks — create a bookmark
router.post('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  const { type, questionId, companyId, reportId, studyPlanId, mockSessionId, notes } = req.body;
  // req.userId is a Clerk ID — resolve to internal Prisma User.id before DB write
  const internalUserId = await resolveUserId(req.userId);

  // Check for duplicates
  const existing = await prisma.bookmark.findFirst({
    where: {
      userId: internalUserId,
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
      userId: internalUserId,
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

// DELETE /api/bookmarks/:id — remove a bookmark (owner only)
router.delete('/:id', requireAuth, asyncHandler(async (req: any, res: any) => {
  const internalUserId = await resolveUserId(req.userId);
  await prisma.bookmark.deleteMany({
    where: { id: req.params.id, userId: internalUserId },
  });
  res.json({ success: true, message: 'Bookmark removed' });
}));

export default router;
