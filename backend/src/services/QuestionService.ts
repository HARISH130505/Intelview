import { prisma } from '../utils/prisma';

export class QuestionService {
  async getAllQuestions(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    type?: string;
    topic?: string;
    company?: string;
    role?: string;
    search?: string;
    source?: string;
    verified?: boolean;
  }) {
    const { page = 1, limit = 50, difficulty, type, topic, company, role, search, source, verified } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (search) where.text = { contains: search, mode: 'insensitive' };
    if (topic) {
      where.topics = { some: { topic: { slug: { equals: topic, mode: 'insensitive' } } } };
    }
    if (company) {
      where.companyQuestions = { some: { company: { slug: { equals: company, mode: 'insensitive' } } } };
    }
    if (role && role !== 'All') {
      where.OR = [
        { text: { contains: role, mode: 'insensitive' } },
        { reportQuestions: { some: { report: { role: { contains: role, mode: 'insensitive' } } } } },
      ];
    }
    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }
    if (verified !== undefined) {
      where.isVerified = verified;
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        include: {
          topics: { include: { topic: true } },
          companyQuestions: {
            include: { company: { select: { id: true, name: true, slug: true, logo: true } } },
            orderBy: { frequency: 'desc' },
            take: 5,
          },
          _count: { select: { reportQuestions: true } },
        },
        orderBy: [{ frequency: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.question.count({ where }),
    ]);

    return { questions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getQuestionById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        topics: { include: { topic: true } },
        companyQuestions: {
          include: { company: true },
          orderBy: { frequency: 'desc' },
        },
        reportQuestions: {
          include: {
            report: {
              select: {
                id: true,
                role: true,
                difficulty: true,
                createdAt: true,
                company: { select: { name: true, slug: true } },
              },
            },
          },
          take: 5,
        },
      },
    });
  }

  async getTrendingQuestions(limit = 10) {
    return prisma.question.findMany({
      orderBy: [{ frequency: 'desc' }, { viewCount: 'desc' }],
      take: limit,
      include: {
        topics: { include: { topic: true } },
        companyQuestions: {
          include: { company: { select: { name: true, slug: true, logo: true } } },
          orderBy: { frequency: 'desc' },
          take: 3,
        },
      },
    });
  }

  async incrementViewCount(id: string) {
    return prisma.question.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async searchQuestions(query: string, limit = 20) {
    return prisma.question.findMany({
      where: {
        OR: [
          { text: { contains: query, mode: 'insensitive' } },
          { topics: { some: { topic: { name: { contains: query, mode: 'insensitive' } } } } },
        ],
      },
      take: limit,
      include: {
        topics: { include: { topic: true } },
        companyQuestions: {
          include: { company: { select: { name: true, slug: true } } },
          take: 3,
        },
      },
      orderBy: { frequency: 'desc' },
    });
  }

  async getRelatedQuestions(questionId: string, topicIds: string[], limit = 5) {
    return prisma.question.findMany({
      where: {
        id: { not: questionId },
        topics: { some: { topicId: { in: topicIds } } },
      },
      take: limit,
      include: { topics: { include: { topic: true } } },
      orderBy: { frequency: 'desc' },
    });
  }
}

export const questionService = new QuestionService();
