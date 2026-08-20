import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { authenticate } from '../middlewares/auth.js';
import { clearCart } from '../controllers/cartController.js';

const router = Router();

router.get('/orders', authenticate, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate('items.productId', 'name art accent').sort({ createdAt: -1 }).lean();
  return res.json((orders || []).map((order) => ({ ...order, _id: order._id.toString(), userId: order.userId?.toString(), items: (order.items || []).map((item) => ({ ...item, productId: item.productId?._id?.toString() || item.productId?.toString() })) })));
});

router.post('/orders', authenticate, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name price').lean();
  if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  const productIds = cart.items.map((item) => item.productId?._id?.toString?.() || item.productId?.toString?.()).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  let total = 0;
  const items = cart.items.filter((item) => productMap.has(item.productId?._id?.toString?.() || item.productId?.toString?.())).map((item) => {
    const id = item.productId?._id?.toString?.() || item.productId?.toString?.();
    const product = productMap.get(id); total += product.price * item.quantity;
    return { productId: id, name: product.name, price: product.price, quantity: item.quantity };
  });
  if (!items.length) return res.status(400).json({ error: 'No valid items in cart' });
  const order = await Order.create({ userId: req.user._id, items, customerEmail: req.user.email, total, currency: 'INR', status: 'pending' });
  await clearCart(req.user._id);
  return res.status(201).json({ _id: order._id.toString(), userId: order.userId.toString(), items: order.items.map((item) => ({ ...item, productId: item.productId?.toString?.() || item.productId })), customerEmail: order.customerEmail, total: order.total, currency: order.currency, status: order.status, createdAt: order.createdAt, updatedAt: order.updatedAt });
});

router.post('/orders/app-purchase', authenticate, async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ error: 'productId is required' });
  const product = await Product.findById(productId).lean();
  if (!product || !product.app?.isApp) return res.status(404).json({ error: 'Application not found' });
  const existingPaid = await Order.findOne({ userId: req.user._id, status: 'paid', 'items.productId': product._id }).lean();
  if (existingPaid) return res.status(409).json({ error: 'Application is already purchased', orderId: existingPaid._id.toString() });
  const order = await Order.create({ userId: req.user._id, items: [{ productId: product._id, name: product.name, price: product.price, quantity: 1 }], customerEmail: req.user.email, total: product.price, currency: 'INR', status: 'pending' });
  return res.status(201).json({ _id: order._id.toString(), userId: order.userId.toString(), items: order.items, customerEmail: order.customerEmail, total: order.total, currency: order.currency, status: order.status, createdAt: order.createdAt, updatedAt: order.updatedAt });
});

router.get('/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId).lean();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId?.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });
  return res.json({ ...order, _id: order._id.toString(), userId: order.userId?.toString(), items: (order.items || []).map((item) => ({ ...item, productId: item.productId?.toString?.() || item.productId })) });
});

export default router;
