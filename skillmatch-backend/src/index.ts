import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { logger } from './utils/logger';
import { swaggerSpec } from './config/swagger';
import { initSockets } from './sockets';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes';
import volunteerRoutes from './routes/volunteer.routes';
import orgRoutes from './routes/org.routes';
import opportunityRoutes from './routes/opportunity.routes';
import swipeRoutes from './routes/swipe.routes';
import chatRoutes from './routes/chat.routes';
import dashboardRoutes from './routes/dashboard.routes';
import participationRoutes from './routes/participation.routes';
import ratingRoutes from './routes/rating.routes';

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: env.isProd(),
    crossOriginEmbedderPolicy: env.isProd(),
  })
);

app.use(
  cors({
    origin: [env.clientUrl, 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── General middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (env.isDev()) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  let dbOk = false;
  let redisOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {}

  try {
    await redis.ping();
    redisOk = true;
  } catch {}

  const allOk = dbOk && redisOk;
  res.status(allOk ? 200 : 503).json({
    success: allOk,
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: { database: dbOk ? 'up' : 'down', redis: redisOk ? 'up' : 'down' },
  });
});

// ── API docs ──────────────────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'SkillMatch API Docs',
    customCss: '.swagger-ui .topbar { background: #10B981; }',
    swaggerOptions: { persistAuthorization: true },
  })
);

app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/volunteer/profile', volunteerRoutes);
app.use('/api/org/profile', orgRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/rating', ratingRoutes);

// ── 404 + error handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Socket.io ─────────────────────────────────────────────────────────────────
initSockets(httpServer);

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    logger.info('Server closed. Goodbye! 👋');
    process.exit(0);
  });

  // Force-kill after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Start ─────────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('Database connected ✓');

    await redis.connect();
    logger.info('Redis connected ✓');

    httpServer.listen(env.port, () => {
      logger.info(`\n🚀  SkillMatch API running on port ${env.port}`);
      logger.info(`📖  API Docs → http://localhost:${env.port}/api/docs`);
      logger.info(`❤️   Health  → http://localhost:${env.port}/health`);
      logger.info(`🌍  Mode    → ${env.nodeEnv}\n`);
    });
  } catch (err) {
    logger.error('Bootstrap failed', { err });
    process.exit(1);
  }
}

bootstrap();

export { app, httpServer };
