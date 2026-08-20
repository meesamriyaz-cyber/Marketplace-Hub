import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { activateTrial, expireTrialForDevelopment, getLicenseStatus } from '../controllers/licenseController.js';

const router = Router();
router.get('/status', authenticate, getLicenseStatus);
router.post('/activate-trial', authenticate, activateTrial);
router.post('/dev/expire-trial', authenticate, expireTrialForDevelopment);
export default router;
