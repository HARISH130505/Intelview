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

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }
    if (role) {
      where.role = { contains: role, mode: 'insensitive' };
    }
    if (company && company !== 'ALL') {
      where.company = {
        OR: [
          { slug: company },
          { name: { contains: company, mode: 'insensitive' } },
        ],
      };
    }

    const [reports, total] = await Promise.all([
      prisma.interviewReport.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true, slug: true, logo: true, tier: true } },
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
    const report = await prisma.interviewReport.findUnique({
      where: { id },
      include: {
        company: true,
        rounds: {
          orderBy: { roundNumber: 'asc' },
        },
        questions: {
          include: {
            question: {
              include: {
                topics: { include: { topic: true } },
                companyQuestions: { include: { company: true } },
              },
            },
          },
        },
      },
    });

    if (report) {
      // Non-blocking view count increment
      prisma.interviewReport
        .update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    return report;
  }

  async submitReport(data: {
    companyId?: string;
    companyName?: string;
    userId?: string;
    role: string;
    location?: string;
    interviewDate?: string;
    difficulty?: string;
    offerStatus?: string;
    rawText: string;
    experience?: string;
    yearsExp?: number;
    salary?: string;
    isAnonymous?: boolean;
    source?: string;
    rounds?: Array<{
      roundNumber?: number;
      type?: string;
      description?: string;
      duration?: number;
      difficulty?: string;
    }>;
    questions?: Array<{
      text: string;
      type?: string;
      difficulty?: string;
      topics?: string[];
    }>;
  }) {
    // 1. Resolve Company
    let resolvedCompanyId = data.companyId;

    if (!resolvedCompanyId && data.companyName) {
      const trimmed = data.companyName.trim();
      const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const existing = await prisma.company.findFirst({
        where: {
          OR: [
            { slug },
            { name: { equals: trimmed, mode: 'insensitive' } },
          ],
        },
      });

      if (existing) {
        resolvedCompanyId = existing.id;
      } else {
        const created = await prisma.company.create({
          data: {
            name: trimmed,
            slug: slug || `company-${Date.now()}`,
            description: `${trimmed} interview experiences and hiring intelligence`,
            tier: 'TIER2',
          },
        });
        resolvedCompanyId = created.id;
      }
    }

    if (!resolvedCompanyId) {
      // Fallback to first existing company or create a generic one
      const fallback = await prisma.company.findFirst();
      if (fallback) {
        resolvedCompanyId = fallback.id;
      } else {
        const created = await prisma.company.create({
          data: {
            name: 'Tech Company',
            slug: 'tech-company',
            tier: 'TIER2',
          },
        });
        resolvedCompanyId = created.id;
      }
    }

    // 2. Create the report
    const report = await prisma.interviewReport.create({
      data: {
        companyId: resolvedCompanyId,
        userId: data.userId,
        role: data.role || 'Software Engineer',
        location: data.location,
        interviewDate: data.interviewDate ? new Date(data.interviewDate) : undefined,
        difficulty: (data.difficulty as any) || 'MEDIUM',
        offerStatus: (data.offerStatus as any) || 'UNKNOWN',
        rawText: data.rawText,
        experience: data.experience || data.rawText.slice(0, 500),
        yearsExp: data.yearsExp,
        salary: data.salary,
        isAnonymous: data.isAnonymous ?? false,
        source: data.source || 'community',
        status: 'APPROVED', // Community submissions are immediately viewable
      },
    });

    // 3. Process structured data or trigger AI
    if (data.rounds && data.rounds.length > 0) {
      await this.saveStructuredRoundsAndQuestions(report.id, resolvedCompanyId, data.rounds, data.questions || []);
    } else {
      // Trigger AI extraction asynchronously
      this.processReportWithAI(report.id, resolvedCompanyId, data.rawText).catch(console.error);
    }

    return report;
  }

  private async saveStructuredRoundsAndQuestions(
    reportId: string,
    companyId: string,
    rounds: Array<any>,
    questions: Array<any>
  ) {
    try {
      // Create rounds
      for (let i = 0; i < rounds.length; i++) {
        const r = rounds[i];
        await prisma.round.create({
          data: {
            reportId,
            roundNumber: r.roundNumber || i + 1,
            type: (r.type as any) || 'TECHNICAL',
            description: r.description || `Round ${i + 1}`,
            duration: r.duration ? parseInt(r.duration) : undefined,
            difficulty: (r.difficulty as any) || undefined,
          },
        });
      }

      // Process questions
      for (const q of questions) {
        if (!q.text || !q.text.trim()) continue;

        let question = await prisma.question.findFirst({
          where: { text: { equals: q.text.trim(), mode: 'insensitive' } },
        });

        if (!question) {
          question = await prisma.question.create({
            data: {
              text: q.text.trim(),
              type: (q.type as any) || 'CODING',
              difficulty: (q.difficulty as any) || 'MEDIUM',
              frequency: 1,
              source: 'Community Interview Report',
            },
          });
        } else {
          await prisma.question.update({
            where: { id: question.id },
            data: { frequency: { increment: 1 } },
          });
        }

        // Link to report
        await prisma.reportQuestion.create({
          data: {
            reportId,
            questionId: question.id,
            rawText: q.text.trim(),
          },
        });

        // Link to Company
        await prisma.companyQuestion.upsert({
          where: {
            companyId_questionId: {
              companyId,
              questionId: question.id,
            },
          },
          update: {
            frequency: { increment: 1 },
            lastSeen: new Date(),
          },
          create: {
            companyId,
            questionId: question.id,
            frequency: 1,
            lastSeen: new Date(),
          },
        });

        // Link topics
        if (q.topics && Array.isArray(q.topics)) {
          for (const topicName of q.topics) {
            const cleanName = topicName.trim();
            const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!slug) continue;

            const topic = await prisma.topic.upsert({
              where: { slug },
              update: {},
              create: {
                name: cleanName,
                slug,
                category: 'General',
              },
            });

            await prisma.questionTopic.upsert({
              where: {
                questionId_topicId: {
                  questionId: question.id,
                  topicId: topic.id,
                },
              },
              update: {},
              create: {
                questionId: question.id,
                topicId: topic.id,
              },
            });
          }
        }
      }

      await prisma.interviewReport.update({
        where: { id: reportId },
        data: { processedAt: new Date() },
      });
    } catch (err) {
      console.error('Failed to save structured rounds and questions:', err);
    }
  }

  private async processReportWithAI(reportId: string, companyId: string, rawText: string) {
    try {
      console.log(`🤖 Starting AI extraction for report ${reportId}...`);
      const extracted = await aiService.extractInterview(rawText);

      // Update report metadata if fields were default
      const updates: any = {
        processedAt: new Date(),
      };
      if (extracted.summary) {
        updates.experience = extracted.summary;
      }
      if (extracted.difficulty) {
        updates.difficulty = extracted.difficulty;
      }
      if (extracted.offerStatus && extracted.offerStatus !== 'UNKNOWN') {
        updates.offerStatus = extracted.offerStatus;
      }

      await prisma.interviewReport.update({
        where: { id: reportId },
        data: updates,
      });

      // Save extracted rounds and questions
      await this.saveStructuredRoundsAndQuestions(
        reportId,
        companyId,
        extracted.rounds || [],
        extracted.questions || []
      );

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
