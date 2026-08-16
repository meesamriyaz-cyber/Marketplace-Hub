import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/payments/create-order', authenticate, createRazorpayOrder);
router.post('/payments/verify', authenticate, verifyRazorpayPayment);

export default router;
