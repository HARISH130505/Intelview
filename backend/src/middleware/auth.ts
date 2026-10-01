import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { prisma } from '../utils/prisma';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const verifyAuthToken = async (token: string) => {
  return verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    jwtKey: process.env.CLERK_JWT_KEY,
  });
};

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAuthToken(token);

    req.userId = payload.sub;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyAuthToken(token);
      req.userId = payload.sub;
    }
    next();
  } catch {
    next(); // Continue even if auth fails for optional routes
  }
};

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAuthToken(token);
    req.userId = payload.sub;

    // Check admin role from Clerk metadata first
    let isRoleAdmin = false;
    try {
      const user = await clerk.users.getUser(payload.sub);
      const role = (user.publicMetadata?.role as string)?.toLowerCase();
      if (role === 'admin' || role === 'moderator') {
        isRoleAdmin = true;
      }
    } catch {
      // If Clerk API lookup fails or is unavailable, check database
    }

    // Also check Prisma user record
    if (!isRoleAdmin) {
      const dbUser = await prisma.user.findFirst({
        where: { clerkId: payload.sub },
        select: { role: true },
      });
      if (dbUser && (dbUser.role === 'ADMIN' || dbUser.role === 'MODERATOR')) {
        isRoleAdmin = true;
      }
    }

    if (!isRoleAdmin) {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    req.userRole = 'ADMIN';
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

