import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { activateTrial, getLicenseStatus } from '../controllers/licenseController.js';

const router = Router();
router.get('/status', authenticate, getLicenseStatus);
router.post('/activate-trial', authenticate, activateTrial);
export default router;
