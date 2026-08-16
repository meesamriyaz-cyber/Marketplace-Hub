import { Router } from 'express';
import { createContactRequest, listContactRequests } from '../controllers/contactController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/contact', createContactRequest);
router.get('/contact', authenticate, listContactRequests);

export default router;
