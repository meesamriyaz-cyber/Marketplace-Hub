import { Router } from 'express';
import { registerCloudKitchen } from '../controllers/cloudKitchenRegistrationController.js';

const router = Router();

router.post('/register-cloud-kitchen', registerCloudKitchen);

export default router;
