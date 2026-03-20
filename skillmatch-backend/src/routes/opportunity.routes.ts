import { Router } from 'express';
import { z } from 'zod';
import { opportunityController } from '../controllers/opportunity.controller';
import { authenticate, orgOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  locationType: z.enum(['REMOTE', 'IN_PERSON', 'HYBRID']),
  location: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  spotsNeeded: z.number().int().min(1).max(1000).optional(),
  impactMetric: z.string().max(200).optional(),
  skillIds: z.array(z.string().cuid()).optional(),
});

// Public listing — no auth required
router.get('/', opportunityController.list);
router.get('/:id', opportunityController.getById);

// Protected routes
router.use(authenticate);
router.get('/me/list', orgOnly, opportunityController.getMyOpportunities);
router.post('/', orgOnly, validate(createSchema), opportunityController.create);
router.put('/:id', orgOnly, validate(createSchema.partial()), opportunityController.update);
router.delete('/:id', opportunityController.remove);

export default router;
