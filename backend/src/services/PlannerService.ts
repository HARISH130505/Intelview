import { prisma } from '../utils/prisma';
import { aiService } from './AIService';

export class PlannerService {
  async generatePlan(params: {
    userId: string;
    companyId?: string;
    companyName: string;
    role: string;
    experienceLevel: string;
    availableDays: number;
    dailyHours: number;
    targetDate?: string;
  }) {
    // Get top topics for the company if we have a companyId
    let topTopics: string[] = [];
    if (params.companyId) {
      const companyQuestions = await prisma.companyQuestion.findMany({
        where: { companyId: params.companyId },
        include: { question: { include: { topics: { include: { topic: true } } } } },
        orderBy: { frequency: 'desc' },
        take: 20,
      });
      const topicFreq: Record<string, number> = {};
      companyQuestions.forEach(cq => {
        cq.question.topics.forEach(qt => {
          topicFreq[qt.topic.name] = (topicFreq[qt.topic.name] || 0) + cq.frequency;
        });
      });
      topTopics = Object.entries(topicFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([topic]) => topic);
    }

    // Generate roadmap with AI
    const roadmap = await aiService.generateRoadmap({
      company: params.companyName,
      role: params.role,
      experienceLevel: params.experienceLevel,
      availableDays: params.availableDays,
      dailyHours: params.dailyHours,
      topTopics,
    });

    // Save to database
    const plan = await prisma.studyPlan.create({
      data: {
        userId: params.userId,
        companyId: params.companyId,
        title: `${params.companyName} - ${params.role} Study Plan`,
        role: params.role,
        experienceLevel: params.experienceLevel,
        availableDays: params.availableDays,
        dailyHours: params.dailyHours,
        targetDate: params.targetDate ? new Date(params.targetDate) : undefined,
        generatedPlan: roadmap as any,
      },
    });

    return { plan, roadmap };
  }

  async getUserPlans(userId: string) {
    return prisma.studyPlan.findMany({
      where: { userId },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlanById(id: string, userId: string) {
    return prisma.studyPlan.findFirst({
      where: { id, userId },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
      },
    });
  }

  async updateProgress(id: string, userId: string, progress: number) {
    return prisma.studyPlan.update({
      where: { id },
      data: { progress: Math.min(100, Math.max(0, progress)) },
    });
  }
}

export const plannerService = new PlannerService();
