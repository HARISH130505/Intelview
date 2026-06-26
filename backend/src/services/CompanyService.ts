import { prisma } from '../utils/prisma';

export class CompanyService {
  async getAllCompanies(params: {
    page?: number;
    limit?: number;
    industry?: string;
    tier?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, industry, tier, search } = params;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (industry) where.industry = industry;
    if (tier) where.tier = tier as any;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { reports: { where: { status: 'APPROVED' } }, companyQuestions: true },
          },
        },
        orderBy: [{ tier: 'asc' }, { name: 'asc' }],
      }),
      prisma.company.count({ where }),
    ]);

    return { companies, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCompanyBySlug(slug: string) {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            reports: { where: { status: 'APPROVED' } },
            companyQuestions: true,
          },
        },
      },
    });
    return company;
  }

  async getCompanyAnalytics(companyId: string) {
    const [reports, questions, analytics] = await Promise.all([
      prisma.interviewReport.findMany({
        where: { companyId, status: 'APPROVED' },
        select: {
          difficulty: true,
          offerStatus: true,
          interviewDate: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.companyQuestion.findMany({
        where: { companyId },
        include: {
          question: {
            include: {
              topics: { include: { topic: true } },
            },
          },
        },
        orderBy: { frequency: 'desc' },
        take: 20,
      }),
      prisma.companyAnalytics.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculate difficulty distribution
    const difficultyDist = reports.reduce((acc: Record<string, number>, r) => {
      acc[r.difficulty] = (acc[r.difficulty] || 0) + 1;
      return acc;
    }, {});

    // Calculate offer rate
    const offerCount = reports.filter(r => r.offerStatus === 'ACCEPTED').length;
    const offerRate = reports.length > 0 ? Math.round((offerCount / reports.length) * 100) : 0;

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const count = reports.filter(r => {
        const rd = new Date(r.createdAt);
        return rd.getMonth() === date.getMonth() && rd.getFullYear() === date.getFullYear();
      }).length;
      return { month, count };
    });

    // Top topics
    const topicFreq: Record<string, number> = {};
    questions.forEach(cq => {
      cq.question.topics.forEach(qt => {
        topicFreq[qt.topic.name] = (topicFreq[qt.topic.name] || 0) + cq.frequency;
      });
    });
    const topTopics = Object.entries(topicFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, frequency]) => ({ topic, frequency }));

    return {
      reportCount: reports.length,
      offerRate,
      difficultyDistribution: difficultyDist,
      monthlyTrend,
      topTopics,
      topQuestions: questions.slice(0, 10).map(cq => ({
        ...cq.question,
        frequency: cq.frequency,
        lastSeen: cq.lastSeen,
      })),
      analytics,
    };
  }

  async getCompanyReports(companyId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      prisma.interviewReport.findMany({
        where: { companyId, status: 'APPROVED' },
        include: {
          rounds: true,
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.interviewReport.count({ where: { companyId, status: 'APPROVED' } }),
    ]);
    return { reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTrendingCompanies(limit = 8) {
    // Companies with most recent activity
    const recent = await prisma.interviewReport.groupBy({
      by: ['companyId'],
      _count: { id: true },
      where: {
        status: 'APPROVED',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const companyIds = recent.map(r => r.companyId);
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      include: { _count: { select: { reports: true } } },
    });

    return companies.map(c => ({
      ...c,
      recentReports: recent.find(r => r.companyId === c.id)?._count?.id || 0,
    }));
  }
}

export const companyService = new CompanyService();
