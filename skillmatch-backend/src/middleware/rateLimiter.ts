import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/** General API rate limiter */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/** Stricter limit for auth endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes.',
  },
});

/** Swipe limiter — 200 swipes per hour */
export const swipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  keyGenerator: (req) => req.user?.userId ?? req.ip ?? 'unknown',
  message: {
    success: false,
    message: "You've reached the swipe limit for this hour. Come back soon!",
  },
});
