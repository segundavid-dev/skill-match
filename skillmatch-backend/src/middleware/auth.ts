import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { prisma } from '../config/prisma';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, verified: true },
    });

    if (!user) {
      sendUnauthorized(res, 'User no longer exists');
      return;
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendForbidden(res, `Access restricted to: ${roles.join(', ')}`);
      return;
    }
    next();
  };

export const volunteerOnly = requireRole(Role.VOLUNTEER);
export const orgOnly = requireRole(Role.ORGANIZATION);
export const adminOnly = requireRole(Role.ADMIN);
