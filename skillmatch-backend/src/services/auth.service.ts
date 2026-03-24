import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export const authService = {
  async register(email: string, password: string, role: Role) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('An account with this email already exists', 409);

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        verified: true,
      },
      select: { id: true, email: true, role: true },
    });

    const jwtPayload = { userId: user.id, email: user.email, role: user.role };
    const tokens = generateTokenPair(jwtPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt } });

    return { user, tokens };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        verified: true,
        volunteerProfile: { select: { id: true, fullName: true, avatar: true } },
        orgProfile: { select: { id: true, name: true, logo: true } },
      },
    });

    if (!user || !user.password) throw new AppError('Invalid email or password', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const jwtPayload = { userId: user.id, email: user.email, role: user.role };
    const tokens = generateTokenPair(jwtPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt } });

    const { password: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  },

  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    await prisma.refreshToken.delete({ where: { token } });

    const tokens = generateTokenPair({ userId: payload.userId, email: payload.email, role: payload.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: payload.userId, expiresAt } });

    return { tokens };
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        verified: true,
        createdAt: true,
        volunteerProfile: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            bio: true,
            location: true,
            availability: true,
            causes: true,
            impactScore: true,
          },
        },
        orgProfile: {
          select: {
            id: true,
            name: true,
            logo: true,
            mission: true,
            website: true,
            location: true,
            causeTags: true,
            verifiedBadge: true,
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
  },
};
