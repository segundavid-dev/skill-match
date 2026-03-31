import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Use sslmode=verify-full to silence the deprecation warning and keep pool warm
const connectionString = env.databaseUrl.replace('sslmode=require', 'sslmode=verify-full');

const adapter = new PrismaPg({
  connectionString,
  max: 5,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
