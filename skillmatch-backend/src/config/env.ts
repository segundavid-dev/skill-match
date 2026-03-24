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

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiry: optional('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optional('JWT_REFRESH_EXPIRY', '7d'),
  },

  isDev: () => env.nodeEnv === 'development',
  isProd: () => env.nodeEnv === 'production',
  isTest: () => env.nodeEnv === 'test',
} as const;
