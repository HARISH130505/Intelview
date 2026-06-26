import { prisma } from '../utils/prisma';
import { aiService } from './AIService';

export class ReportService {
  async getAllReports(params: {
    page?: number;
    limit?: number;
    company?: string;
    role?: string;
    difficulty?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, company, role, difficulty, status = 'APPROVED' } = params;
    const skip = (page - 1) * limit;

    const where: any = { status };
    if (difficulty) where.difficulty = difficulty;
    if (role) where.role = { contains: role, mode: 'insensitive' };
    if (company) where.company = { slug: company };

    const [reports, total] = await Promise.all([
      prisma.interviewReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true, slug: true, logo: true } },
          rounds: { orderBy: { roundNumber: 'asc' } },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interviewReport.count({ where }),
    ]);

    return { reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReportById(id: string) {
    await prisma.interviewReport.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    
    return prisma.interviewReport.findUnique({
      where: { id },
      include: {
        company: true,
        rounds: {
          orderBy: { roundNumber: 'asc' },
          include: { questions: true },
        },
        questions: {
          include: { question: { include: { topics: { include: { topic: true } } } } },
        },
      },
    });
  }

  async submitReport(data: {
    companyId: string;
    userId?: string;
    role: string;
    location?: string;
    interviewDate?: string;
    difficulty: string;
    offerStatus?: string;
    rawText: string;
    experience?: string;
    yearsExp?: number;
    isAnonymous?: boolean;
    source?: string;
  }) {
    // Create the report
    const report = await prisma.interviewReport.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        role: data.role,
        location: data.location,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : undefined,
        difficulty: data.difficulty as any,
        offerStatus: (data.offerStatus || 'UNKNOWN') as any,
        rawText: data.rawText,
        experience: data.experience,
        yearsExp: data.yearsExp,
        isAnonymous: data.isAnonymous || false,
        source: data.source || 'community',
        status: 'PENDING',
      },
    });

    // Trigger AI processing asynchronously
    this.processReportWithAI(report.id, data.rawText).catch(console.error);

    return report;
  }

  private async processReportWithAI(reportId: string, rawText: string) {
    try {
      const extracted = await aiService.extractInterview(rawText);

      // Update report with AI data
      await prisma.interviewReport.update({
        where: { id: reportId },
        data: {
          processedAt: new Date(),
          // Store extracted rounds
          rounds: {
            create: extracted.rounds.map((r, i) => ({
              roundNumber: r.roundNumber || i + 1,
              type: r.type as any,
              description: r.description,
              duration: r.duration,
            })),
          },
        },
      });

      // Process and link questions
      for (const eq of extracted.questions) {
        // Find or create question
        let question = await prisma.question.findFirst({
          where: { text: { equals: eq.text, mode: 'insensitive' } },
        });

        if (!question) {
          question = await prisma.question.create({
            data: {
              text: eq.text,
              type: eq.type as any,
              difficulty: eq.difficulty as any,
              frequency: 1,
            },
          });
        } else {
          await prisma.question.update({
            where: { id: question.id },
            data: { frequency: { increment: 1 } },
          });
        }

        // Link question to report
        await prisma.reportQuestion.create({
          data: {
            reportId,
            questionId: question.id,
            rawText: eq.text,
          },
        });
      }

      console.log(`✅ AI processing complete for report ${reportId}`);
    } catch (error) {
      console.error(`❌ AI processing failed for report ${reportId}:`, error);
    }
  }

  async approveReport(id: string) {
    return prisma.interviewReport.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async rejectReport(id: string) {
    return prisma.interviewReport.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async getPendingReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      prisma.interviewReport.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        include: {
          company: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.interviewReport.count({ where: { status: 'PENDING' } }),
    ]);
    return { reports, total, page, limit };
  }

  async markHelpful(id: string) {
    return prisma.interviewReport.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });
  }
}

export const reportService = new ReportService();
