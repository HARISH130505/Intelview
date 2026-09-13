import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth, requireAdmin } from '../middleware/auth';
import { researchService } from '../services/ResearchService';
import { aiRateLimiter } from '../middleware/rateLimit';

const router = Router();

// ============================================================
// GET /api/research/:slug
// Live company research via Gemini 2.5 Pro + Google Search Grounding
// Returns cached data if < 30 days old, otherwise fetches live
// ============================================================
router.get(
  '/:slug',
  optionalAuth,
  aiRateLimiter,
  asyncHandler(async (req: any, res: any) => {
    const { slug } = req.params;
    const role = (req.query.role as string) || 'Software Engineer';
    const refresh = req.query.refresh === 'true' || req.query.refresh === '1';

    if (!slug || slug.length < 2) {
      res.status(400).json({ success: false, message: 'Invalid company slug' });
      return;
    }

    const { research, fromCache, company, researchedAt, expiresAt } =
      await researchService.getCompanyIntelligence(slug, role, refresh);

    res.json({
      success: true,
      fromCache,
      cachedNote: fromCache
        ? 'Serving recent research (< 30 days old). Use refresh button to force update.'
        : 'Fresh research fetched via Gemini 2.5 Flash + Google Search Grounding.',
      researchedAt,
      expiresAt,
      company: company
        ? { id: company.id, name: company.name, slug: company.slug, tier: company.tier }
        : { name: slug, slug },
      research,
    });
  })
);

// ============================================================
// POST /api/research/:slug/refresh
// Force-refresh research for a company (Admin only)
// ============================================================
router.post(
  '/:slug/refresh',
  requireAdmin,
  aiRateLimiter,
  asyncHandler(async (req: any, res: any) => {
    const { slug } = req.params;
    const role = (req.body.role as string) || 'Software Engineer';

    const research = await researchService.refreshCompanyResearch(slug, role);

    res.json({
      success: true,
      message: `Research for "${slug}" refreshed via Gemini 2.5 Pro + Google Search Grounding.`,
      research,
    });
  })
);

export default router;
