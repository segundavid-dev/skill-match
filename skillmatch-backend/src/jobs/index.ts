import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { prisma } from '../config/prisma';
import { buildFeedForVolunteer } from '../services/matching.service';

const connection = { host: redis.options.host as string, port: redis.options.port as number };

// ── Queue definitions ─────────────────────────────────────────────────────────
export const matchQueue = new Queue('match-suggestions', { connection });
export const emailQueue = new Queue('email-digest', { connection });

// ── Match suggestion worker ───────────────────────────────────────────────────
const matchWorker = new Worker(
  'match-suggestions',
  async (job: Job) => {
    const { volunteerId, userId } = job.data as { volunteerId: string; userId: string };
    logger.info(`Processing match suggestions for volunteer ${volunteerId}`);

    const feed = await buildFeedForVolunteer(volunteerId, userId, 5);
    logger.info(`Generated ${feed.length} match suggestions for ${volunteerId}`);
    return feed;
  },
  { connection, concurrency: 5 }
);

// ── Email digest worker ───────────────────────────────────────────────────────
const emailWorker = new Worker(
  'email-digest',
  async (job: Job) => {
    const { type } = job.data as { type: string };
    logger.info(`Processing email job: ${type}`);
    // TODO: Implement weekly digest email sending
  },
  { connection, concurrency: 2 }
);

matchWorker.on('completed', (job) => logger.debug(`Match job ${job.id} completed`));
matchWorker.on('failed', (job, err) => logger.error(`Match job ${job?.id} failed`, { err }));
emailWorker.on('failed', (job, err) => logger.error(`Email job ${job?.id} failed`, { err }));

// ── Helpers to enqueue jobs ───────────────────────────────────────────────────
export async function enqueueMatchSuggestions(volunteerId: string, userId: string) {
  await matchQueue.add(
    'suggest',
    { volunteerId, userId },
    { delay: 1000, attempts: 3, backoff: { type: 'exponential', delay: 5000 } }
  );
}

export async function enqueueWeeklyDigest() {
  await emailQueue.add(
    'weekly-digest',
    { type: 'weekly-digest' },
    { repeat: { pattern: '0 9 * * MON' } } // every Monday at 9 AM
  );
}

logger.info('BullMQ workers initialised');
