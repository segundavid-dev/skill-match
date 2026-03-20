import { Router } from 'express';
import { z } from 'zod';
import { chatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});

router.use(authenticate);

router.get('/', chatController.getMyChats);
router.get('/:roomId/messages', chatController.getMessages);
router.post('/:roomId/messages', validate(messageSchema), chatController.sendMessage);

export default router;
