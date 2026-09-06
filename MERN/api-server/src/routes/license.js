import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { activateTrial, createActivationCode, exchangeActivationCode, expireTrialForDevelopment, getDeviceLicenseStatus, getLicenseStatus, transferDevice } from '../controllers/licenseController.js';

const router = Router();
router.get('/status', authenticate, getLicenseStatus);
router.post('/activate-trial', authenticate, activateTrial);
router.post('/activation-code', authenticate, createActivationCode);
router.post('/exchange-code', exchangeActivationCode);
router.post('/transfer-device', authenticate, transferDevice);
router.post('/device-status', getDeviceLicenseStatus);
router.post('/dev/expire-trial', authenticate, expireTrialForDevelopment);
export default router;
