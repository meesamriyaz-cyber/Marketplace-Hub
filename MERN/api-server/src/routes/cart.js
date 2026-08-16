import { Router } from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/cart', authenticate, getCart);
router.post('/cart', authenticate, addToCart);
router.delete('/cart/:productId', authenticate, removeFromCart);

export default router;
