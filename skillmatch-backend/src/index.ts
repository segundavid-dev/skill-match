import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env';
import { prisma } from './config/prisma';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.clientUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, status: 'unhealthy', timestamp: new Date().toISOString() });
  }
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(env.port, () => {
      console.log(`SkillMatch API running on http://localhost:${env.port}`);
      console.log(`Health check: http://localhost:${env.port}/health`);
    });
  } catch (err) {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();

export { app };
