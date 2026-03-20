import { Router } from 'express';
import { z } from 'zod';
import { swipeController } from '../controllers/swipe.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { swipeLimiter } from '../middleware/rateLimiter';

const router = Router();

const swipeSchema = z.object({
  opportunityId: z.string().cuid(),
  volunteerId: z.string().cuid().optional(),
  direction: z.enum(['LEFT', 'RIGHT']),
});

router.use(authenticate);

router.post('/', swipeLimiter, validate(swipeSchema), swipeController.swipe);
router.get('/feed', swipeController.getFeed);
router.get('/matches', swipeController.getMatches);

export default router;
