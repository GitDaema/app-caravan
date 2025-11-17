import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

export function requireRole(role: 'HOST' | 'ADMIN') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: any = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.role?.toUpperCase() !== role && user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
