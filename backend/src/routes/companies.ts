import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { companyService } from '../services/CompanyService';

const router = Router();

// GET /api/companies - List companies
router.get('/', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const { page, limit, industry, tier, search } = req.query;
  const result = await companyService.getAllCompanies({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
    industry: industry as string,
    tier: tier as string,
    search: search as string,
  });
  res.json({ success: true, ...result });
}));

// GET /api/companies/trending
router.get('/trending', asyncHandler(async (_req: any, res: any) => {
  const companies = await companyService.getTrendingCompanies(8);
  res.json({ success: true, companies });
}));

// GET /api/companies/:slug
router.get('/:slug', optionalAuth, asyncHandler(async (req: any, res: any) => {
  const company = await companyService.getCompanyBySlug(req.params.slug);
  if (!company) {
    res.status(404).json({ success: false, message: 'Company not found' });
    return;
  }
  res.json({ success: true, company });
}));

// GET /api/companies/:slug/analytics
router.get('/:slug/analytics', asyncHandler(async (req: any, res: any) => {
  const company = await companyService.getCompanyBySlug(req.params.slug);
  if (!company) {
    res.status(404).json({ success: false, message: 'Company not found' });
    return;
  }
  const analytics = await companyService.getCompanyAnalytics(company.id);
  res.json({ success: true, analytics });
}));

// GET /api/companies/:slug/reports
router.get('/:slug/reports', asyncHandler(async (req: any, res: any) => {
  const company = await companyService.getCompanyBySlug(req.params.slug);
  if (!company) {
    res.status(404).json({ success: false, message: 'Company not found' });
    return;
  }
  const { page, limit } = req.query;
  const result = await companyService.getCompanyReports(
    company.id,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 10
  );
  res.json({ success: true, ...result });
}));

export default router;
