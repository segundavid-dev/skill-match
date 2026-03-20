import { Router } from 'express';
import { z } from 'zod';
import { volunteerController } from '../controllers/volunteer.controller';
import { authenticate, volunteerOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../utils/upload';

const router = Router();

const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  availability: z.array(z.enum(['weekdays', 'weekends', 'evenings', 'flexible'])).optional(),
  causes: z.array(z.string()).optional(),
  skillIds: z.array(z.string().cuid()).optional(),
});

const updateSchema = profileSchema.partial();

router.use(authenticate);

router.post('/', volunteerOnly, validate(profileSchema), volunteerController.createProfile);
router.get('/', volunteerOnly, volunteerController.getMyProfile);
router.put('/', volunteerOnly, validate(updateSchema), volunteerController.updateProfile);
router.post('/avatar', volunteerOnly, upload.single('avatar'), volunteerController.uploadAvatar);
router.get('/:id', volunteerController.getProfileById);
router.get('/:id/ratings', volunteerController.getRatings);

export default router;
