import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { prisma } from './config/prisma';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initIO } from './sockets';

import authRoutes from './routes/auth.routes';
import volunteerRoutes from './routes/volunteer.routes';
import orgRoutes from './routes/org.routes';
import opportunityRoutes from './routes/opportunity.routes';
import swipeRoutes from './routes/swipe.routes';
import chatRoutes from './routes/chat.routes';
import dashboardRoutes from './routes/dashboard.routes';
import participationRoutes from './routes/participation.routes';
import ratingRoutes from './routes/rating.routes';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  } catch {
    res
      .status(503)
      .json({ success: false, status: 'unhealthy', timestamp: new Date().toISOString() });
  }
});

// ── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/volunteer/profile', volunteerRoutes);
app.use('/api/org/profile', orgRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/rating', ratingRoutes);

app.use(notFound);
app.use(errorHandler);

// Initialize Socket.IO
initIO(server);

async function connectWithRetry(retries = 5, delay = 3000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('Database connected');
      return;
    } catch {
      if (i === retries - 1)
        throw new Error('Could not connect to database after multiple attempts');
      console.log(`Database not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function bootstrap() {
  try {
    await connectWithRetry();

    server.listen(env.port, () => {
      console.log(`SkillMatch API running on http://localhost:${env.port}`);
      console.log(`Health check: http://localhost:${env.port}/health`);
    });
  } catch (err) {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();

export { app, server };
