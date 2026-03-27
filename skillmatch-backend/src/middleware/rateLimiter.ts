import rateLimit from 'express-rate-limit';

export const swipeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 swipes per window
  message: { success: false, message: 'Too many swipes. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
