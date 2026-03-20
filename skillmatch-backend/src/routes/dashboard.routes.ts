import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, volunteerOnly, orgOnly } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/volunteer', volunteerOnly, dashboardController.volunteerDashboard);
router.get('/org', orgOnly, dashboardController.orgDashboard);

export default router;
