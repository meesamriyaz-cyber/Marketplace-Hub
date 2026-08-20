import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getLicenseStatus } from '../controllers/licenseController.js';

const router = Router();
router.get('/status', authenticate, getLicenseStatus);
export default router;
