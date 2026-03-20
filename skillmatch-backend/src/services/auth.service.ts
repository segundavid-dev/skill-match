import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { sendEmail, emailTemplates } from '../utils/email';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

export const authService = {
  // ── Register ───────────────────────────────────────────────────────────
  async register(email: string, password: string, role: Role) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('An account with this email already exists', 409);

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        verificationToken,
      },
      select: { id: true, email: true, role: true },
    });

    // Send verification email (non-blocking)
    const template = emailTemplates.verifyEmail(email, verificationToken, env.clientUrl);
    sendEmail({ to: email, ...template }).catch((e) =>
      logger.error('Failed to send verification email', { e })
    );

    return user;
  },

  // ── Login ──────────────────────────────────────────────────────────────
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, password: true, verified: true },
    });

    if (!user || !user.password) throw new AppError('Invalid email or password', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    if (!user.verified) throw new AppError('Please verify your email before logging in', 403);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const tokens = generateTokenPair(payload);

    // Persist refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt } });

    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  },

  // ── Verify email ───────────────────────────────────────────────────────
  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new AppError('Invalid or expired verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, verificationToken: null },
    });

    return { email: user.email };
  },

  // ── Refresh tokens ─────────────────────────────────────────────────────
  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Rotate — delete old, issue new
    await prisma.refreshToken.delete({ where: { token } });

    const newTokens = generateTokenPair({ userId: payload.userId, email: payload.email, role: payload.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: newTokens.refreshToken, userId: payload.userId, expiresAt } });

    return newTokens;
  },

  // ── Logout ─────────────────────────────────────────────────────────────
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  // ── Forgot password ────────────────────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // silent — don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });

    const template = emailTemplates.passwordReset(email, resetToken, env.clientUrl);
    sendEmail({ to: email, ...template }).catch((e) =>
      logger.error('Failed to send reset email', { e })
    );
  },

  // ── Reset password ─────────────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw new AppError('Invalid or expired password reset token', 400);

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, resetToken: null, resetTokenExpiry: null },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  },
};
