import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { err: err.message }));

// ── Key helpers ──────────────────────────────────────────────────────────────
export const redisKeys = {
  onlineUser: (userId: string) => `online:${userId}`,
  matchQueue: (userId: string) => `match_queue:${userId}`,
  rateLimitSwipe: (userId: string) => `rl:swipe:${userId}`,
  feedCache: (userId: string) => `feed:${userId}`,
};

export const ONLINE_TTL = 300; // 5 minutes
