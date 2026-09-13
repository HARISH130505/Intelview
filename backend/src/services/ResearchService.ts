import { prisma } from '../utils/prisma';
import { aiService, CompanyResearch } from './AIService';

// ============================================================
// RESEARCH SERVICE
// Handles live dynamic company research via Gemini 2.5 Pro
// with Google Search Grounding + 30-day DB caching.
// ============================================================

const CACHE_DAYS = 30;

export class ResearchService {
  /**
   * Main entry point: get live company intelligence.
   * 1. Check `company_research` table for an unexpired record.
   * 2. If stale / missing → trigger Gemini Google Search Grounding.
   * 3. Upsert the result into `company_research`.
   * 4. Persist new questions into the Question bank.
   * 5. Return structured intelligence to the caller.
   */
  async getCompanyIntelligence(
    companySlug: string,
    role: string = 'Software Engineer',
    forceRefresh: boolean = false
  ): Promise<{ research: CompanyResearch; fromCache: boolean; company: any; researchedAt?: Date; expiresAt?: Date }> {
    // Step 1: Resolve company
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });
    const companyName = company?.name || companySlug;

    // Step 2: Look for a fresh cached record if not forceRefresh
    if (!forceRefresh && company?.id) {
      const cached = await prisma.companyResearch.findUnique({
        where: {
          companyId_role: {
            companyId: company.id,
            role,
          },
        },
      });

      if (cached && cached.expiresAt > new Date()) {
        console.log(`✅ Serving cached research for ${companyName} (${role})`);
        return {
          research: {
            ...(cached.researchData as unknown as CompanyResearch),
            sources: (cached.sources as string[]) || (cached.researchData as any)?.sources || [],
          },
          fromCache: true,
          company,
          researchedAt: cached.researchedAt,
          expiresAt: cached.expiresAt,
        };
      }
    }

    // Step 3: Live research — Gemini 2.5 Flash + Google Search Grounding
    console.log(`🔍 Starting live Gemini research for ${companyName} (${role})...`);
    const research = await aiService.researchCompany(companyName, role);

    // Step 4: Persist into company_research table
    const expiresAt = new Date(Date.now() + CACHE_DAYS * 24 * 60 * 60 * 1000);
    const researchedAt = new Date();
    if (company?.id) {
      try {
        await prisma.companyResearch.upsert({
          where: {
            companyId_role: {
              companyId: company.id,
              role,
            },
          },
          create: {
            companyId: company.id,
            role,
            researchData: research as any,
            sources: (research as any).sources ?? [],
            researchedAt,
            expiresAt,
          },
          update: {
            researchData: research as any,
            sources: (research as any).sources ?? [],
            researchedAt,
            expiresAt,
          },
        });

        // Step 5: Auto-populate question bank from research findings
        await this.persistResearchQuestions(company.id, research);
        console.log(`💾 Saved research for ${companyName} to DB (expires ${expiresAt.toDateString()})`);
      } catch (err) {
        console.warn('Failed to cache research:', err);
      }
    }

    return { research, fromCache: false, company, researchedAt, expiresAt };
  }

  /**
   * Force-refresh research for a company (bypass cache).
   * Deletes the existing record and re-fetches live from Gemini.
   */
  async refreshCompanyResearch(
    companySlug: string,
    role: string = 'Software Engineer'
  ): Promise<CompanyResearch> {
    const company = await prisma.company.findUnique({ where: { slug: companySlug } });
    const companyName = company?.name || companySlug;

    console.log(`🔄 Force-refreshing research for ${companyName} (${role})...`);
    const research = await aiService.researchCompany(companyName, role);

    if (company?.id) {
      const expiresAt = new Date(Date.now() + CACHE_DAYS * 24 * 60 * 60 * 1000);
      await prisma.companyResearch.upsert({
        where: {
          companyId_role: {
            companyId: company.id,
            role,
          },
        },
        create: {
          companyId: company.id,
          role,
          researchData: research as any,
          sources: (research as any).sources ?? [],
          researchedAt: new Date(),
          expiresAt,
        },
        update: {
          researchData: research as any,
          sources: (research as any).sources ?? [],
          researchedAt: new Date(),
          expiresAt,
        },
      });
      await this.persistResearchQuestions(company.id, research);
    }

    return research;
  }

  /**
   * Persist newly discovered questions from research into the Question bank.
   * Avoids duplicates by matching on question text prefix.
   */
  private async persistResearchQuestions(
    companyId: string,
    research: CompanyResearch
  ): Promise<void> {
    try {
      for (const q of research.recentQuestions.slice(0, 15)) {
        if (!q.text || q.text.length < 10) continue;

        const existing = await prisma.question.findFirst({
          where: { text: { contains: q.text.slice(0, 50), mode: 'insensitive' } },
        });

        let questionId = existing?.id;

        if (!existing) {
          const newQuestion = await prisma.question.create({
            data: {
              text: q.text,
              type: (q.type as any) || 'CODING',
              difficulty: (q.difficulty as any) || 'MEDIUM',
              source: q.source || 'gemini-research',
              frequency: 1,
            },
          });
          questionId = newQuestion.id;
        }

        if (questionId) {
          await prisma.companyQuestion.upsert({
            where: { companyId_questionId: { companyId, questionId } },
            create: {
              companyId,
              questionId,
              frequency: 1,
              isRecent: true,
              lastSeen: new Date(),
            },
            update: {
              frequency: { increment: 1 },
              isRecent: true,
              lastSeen: new Date(),
            },
          });
        }
      }
    } catch (err) {
      console.warn('Failed to persist research questions:', err);
    }
  }
}

export const researchService = new ResearchService();
