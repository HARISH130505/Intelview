import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

// Route imports
import companyRoutes from './routes/companies';
import questionRoutes from './routes/questions';
import reportRoutes from './routes/reports';
import resumeRoutes from './routes/resume';
import plannerRoutes from './routes/planner';
import mockRoutes from './routes/mock';
import bookmarkRoutes from './routes/bookmarks';
import searchRoutes from './routes/search';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import profileRoutes from './routes/profile';
import researchRoutes from './routes/research';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet());
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = rawFrontendUrl
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:3000')) {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.some(allowed => allowed.toLowerCase() === normalizedOrigin.toLowerCase())) {
      return callback(null, true);
    }
    // Also allow Vercel deployment URLs if FRONTEND_URL contains vercel.app
    if (allowedOrigins.some(ao => ao.includes('vercel.app')) && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(rateLimiter);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'intelview-api' });
});

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/companies', companyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/research', researchRoutes); // 🔍 Live Gemini Search Grounding

// ============================================================
// ERROR HANDLING
// ============================================================
app.use(errorHandler);

// 404 handler
app.use('*', (_req: any, res: any) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ============================================================
// SERVER START
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Intelview API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
