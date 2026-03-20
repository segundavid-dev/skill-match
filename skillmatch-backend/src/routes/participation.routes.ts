import { Router } from 'express';
import { z } from 'zod';
import { participationController } from '../controllers/participation.controller';
import { authenticate, volunteerOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const confirmSchema = z.object({
  opportunityId: z.string().cuid(),
});

router.use(authenticate);

router.post('/confirm', volunteerOnly, validate(confirmSchema), participationController.confirm);
router.get('/mine', volunteerOnly, participationController.getMyParticipations);
router.patch('/:id/complete', participationController.markComplete);

export default router;
