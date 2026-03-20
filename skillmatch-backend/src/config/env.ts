import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  nodeEnv: optional('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  port: parseInt(optional('PORT', '4000')),
  clientUrl: optional('CLIENT_URL', 'http://localhost:3000'),

  databaseUrl: required('DATABASE_URL'),
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),

  jwt: {
    accessSecret: optional('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessExpiry: optional('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optional('JWT_REFRESH_EXPIRY', '7d'),
  },

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optional('CLOUDINARY_API_KEY', ''),
    apiSecret: optional('CLOUDINARY_API_SECRET', ''),
  },

  smtp: {
    host: optional('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(optional('SMTP_PORT', '587')),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('EMAIL_FROM', 'SkillMatch <noreply@skillmatch.io>'),
  },

  resend: {
    apiKey: optional('RESEND_API_KEY', ''),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000')),
    max: parseInt(optional('RATE_LIMIT_MAX', '100')),
    authMax: parseInt(optional('AUTH_RATE_LIMIT_MAX', '10')),
  },

  isDev: () => env.nodeEnv === 'development',
  isProd: () => env.nodeEnv === 'production',
  isTest: () => env.nodeEnv === 'test',
} as const;
