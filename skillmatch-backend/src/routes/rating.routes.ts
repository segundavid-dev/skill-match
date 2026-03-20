import { Router } from 'express';
import { z } from 'zod';
import { ratingController } from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const ratingSchema = z.object({
  toUserId: z.string().cuid(),
  stars: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

router.use(authenticate);

router.post('/submit', validate(ratingSchema), ratingController.submit);
router.get('/profiles/:id', ratingController.getForProfile);
router.get('/skills', ratingController.getSkills);

export default router;
