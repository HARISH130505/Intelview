import { prisma } from '../utils/prisma';
import { aiService } from './AIService';
import { resolveUserId } from '../utils/userResolver';

export class PlannerService {
  async generatePlan(params: {
    userId?: string;
    companyId?: string;
    companyName: string;
    role: string;
    experienceLevel: string;
    availableDays: number;
    dailyHours: number;
    targetDate?: string;
  }) {
    const internalUserId = await resolveUserId(params.userId);

    // Resolve company from DB
    let resolvedCompanyId = params.companyId;
    let companyName = params.companyName.trim();

    if (!resolvedCompanyId) {
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            { name: { equals: companyName, mode: 'insensitive' } },
          ],
        },
      });
      if (company) {
        resolvedCompanyId = company.id;
        companyName = company.name;
      }
    }

    // Get top topics and recent questions for the company if we have a companyId
    let topTopics: string[] = [];
    if (resolvedCompanyId) {
      const companyQuestions = await prisma.companyQuestion.findMany({
        where: { companyId: resolvedCompanyId },
        include: { question: { include: { topics: { include: { topic: true } } } } },
        orderBy: { frequency: 'desc' },
        take: 20,
      });

      const topicFreq: Record<string, number> = {};
      companyQuestions.forEach((cq) => {
        cq.question.topics.forEach((qt) => {
          topicFreq[qt.topic.name] = (topicFreq[qt.topic.name] || 0) + cq.frequency;
        });
      });

      topTopics = Object.entries(topicFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([topic]) => topic);
    }

    // Generate personalized roadmap with Gemini AI
    const roadmap = await aiService.generateRoadmap({
      company: companyName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      availableDays: params.availableDays,
      dailyHours: params.dailyHours,
      topTopics,
    });

    // Save to database
    const plan = await prisma.studyPlan.create({
      data: {
        userId: internalUserId,
        companyId: resolvedCompanyId,
        title: `${companyName} - ${params.role} Preparation Roadmap`,
        role: params.role,
        experienceLevel: params.experienceLevel,
        availableDays: params.availableDays,
        dailyHours: params.dailyHours,
        targetDate: params.targetDate ? new Date(params.targetDate) : undefined,
        generatedPlan: roadmap as any,
        progress: 0,
      },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
      },
    });

    return { plan, roadmap };
  }

  async getUserPlans(userId?: string) {
    const internalUserId = await resolveUserId(userId);
    return prisma.studyPlan.findMany({
      where: { userId: internalUserId },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(id: string, userId?: string) {
    const internalUserId = await resolveUserId(userId);
    return prisma.studyPlan.findFirst({
      where: {
        id,
        OR: [
          { userId: internalUserId },
          { user: { clerkId: userId || '' } },
        ],
      },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
      },
    });
  }

  async updateProgress(id: string, userId: string | undefined, progress: number) {
    return prisma.studyPlan.update({
      where: { id },
      data: { progress: Math.min(100, Math.max(0, progress)) },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
      },
    });
  }
}

export const plannerService = new PlannerService();
