import { Router } from 'express';
import healthRouter from './health.js';
import productsRouter from './products.js';
import ordersRouter from './orders.js';
import authRouter from './auth.js';
import cartRouter from './cart.js';
import paymentsRouter from './payments.js';
import contactRouter from './contact.js';
import adminRouter from './admin.js';
import licenseRouter from './license.js';
import cloudKitchenRegistrationRouter from './cloudKitchenRegistration.js';

const router = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use('/auth', authRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(contactRouter);
router.use('/admin', adminRouter);
router.use('/license', licenseRouter);
router.use('/admin', cloudKitchenRegistrationRouter);

export default router;
