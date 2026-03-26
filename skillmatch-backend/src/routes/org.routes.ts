import { Router } from 'express';
import { z } from 'zod';
import { orgController } from '../controllers/org.controller';
import { authenticate, orgOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../utils/upload';

const router = Router();

const profileSchema = z.object({
  name: z.string().min(2).max(120),
  mission: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  causeTags: z.array(z.string()).optional(),
});

router.use(authenticate);

router.post('/', orgOnly, validate(profileSchema), orgController.createProfile);
router.get('/', orgOnly, orgController.getMyProfile);
router.put('/', orgOnly, validate(profileSchema.partial()), orgController.updateProfile);
router.post('/logo', orgOnly, upload.single('logo') as any, orgController.uploadLogo);
router.get('/:id', orgController.getProfileById);

export default router;
