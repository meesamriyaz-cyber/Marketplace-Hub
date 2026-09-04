import { Router } from 'express';
import { registerCloudKitchen } from '../controllers/cloudKitchenRegistrationController.js';

const router = Router();

router.post('/cloud-kitchen/register', registerCloudKitchen);

export default router;
