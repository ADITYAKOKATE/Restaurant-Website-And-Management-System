import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../lib/auth';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/** Middleware: protect routes — requires valid JWT cookie */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    return;
  }

  req.user = payload;
  next();
}

/** Middleware: admin only */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required.' });
      return;
    }
    next();
  });
}

/** Middleware: kitchen staff or admin */
export function requireKitchen(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'kitchen' && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Kitchen staff access required.' });
      return;
    }
    next();
  });
}

/** Middleware: delivery staff or admin */
export function requireDelivery(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'delivery' && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Delivery staff access required.' });
      return;
    }
    next();
  });
}
