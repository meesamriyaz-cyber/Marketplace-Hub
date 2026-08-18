import { Router } from 'express';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middlewares/auth.js';
import { dashboard, listProducts, createProduct, updateProduct, deleteProduct, listUsers, updateUser, sales, reports } from '../controllers/adminController.js';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/dashboard', dashboard);
router.get('/products', listProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.get('/sales', sales);
router.get('/reports', reports);
router.get('/admin-users', requireSuperAdmin, listUsers);

export default router;
