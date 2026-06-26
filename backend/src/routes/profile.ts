import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  const user = await prisma.user.findFirst({
    where: { clerkId: req.userId! },
    include: {
      _count: {
        select: {
          reports: true,
          bookmarks: true,
          studyPlans: true,
          mockSessions: true,
          resumeUploads: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, user });
}));

router.post('/sync', requireAuth, asyncHandler(async (req: any, res: any) => {
  // Called on login to sync Clerk user to our DB
  const { email, name, avatarUrl } = req.body;

  const user = await prisma.user.upsert({
    where: { clerkId: req.userId! },
    update: { email, name, avatarUrl },
    create: { clerkId: req.userId!, email, name, avatarUrl },
  });

  res.json({ success: true, user });
}));

router.put('/', requireAuth, asyncHandler(async (req: any, res: any) => {
  const { name, bio, college, graduationYear, targetRoles } = req.body;
  const user = await prisma.user.update({
    where: { clerkId: req.userId! },
    data: { name, bio, college, graduationYear, targetRoles },
  });
  res.json({ success: true, user });
}));

router.get('/stats', requireAuth, asyncHandler(async (req: any, res: any) => {
  const user = await prisma.user.findFirst({ where: { clerkId: req.userId! } });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const [mockSessions, reports, bookmarks, plans] = await Promise.all([
    prisma.mockSession.findMany({
      where: { userId: user.id },
      select: { totalScore: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.interviewReport.count({ where: { userId: user.id } }),
    prisma.bookmark.count({ where: { userId: user.id } }),
    prisma.studyPlan.findMany({
      where: { userId: user.id },
      select: { progress: true, title: true, createdAt: true },
    }),
  ]);

  const avgMockScore = mockSessions.filter(s => s.totalScore !== null).reduce((sum, s) => sum + (s.totalScore || 0), 0)
    / (mockSessions.filter(s => s.totalScore !== null).length || 1);

  res.json({
    success: true,
    stats: {
      reportsSubmitted: reports,
      bookmarks,
      mockSessions: mockSessions.length,
      avgMockScore: Math.round(avgMockScore),
      studyPlans: plans,
      recentMockSessions: mockSessions.slice(0, 5),
    },
  });
}));

export default router;
