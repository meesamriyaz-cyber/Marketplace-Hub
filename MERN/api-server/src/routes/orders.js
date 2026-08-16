import { Router } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { authenticate } from '../middlewares/auth.js';
import { clearCart } from '../controllers/cartController.js';

const router = Router();

router.get('/orders', authenticate, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate('items.productId', 'name art accent')
    .sort({ createdAt: -1 })
    .lean();

  const items = (orders || []).map((order) => ({
    ...order,
    _id: order._id.toString(),
    userId: order.userId?.toString(),
    items: (order.items || []).map((item) => ({
      ...item,
      productId: item.productId?._id?.toString() || item.productId?.toString(),
    })),
  }));

  return res.json(items);
});

router.post('/orders', authenticate, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
    .populate('items.productId', 'name price')
    .lean();

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const productIds = cart.items
    .map((item) => {
      const pid = item.productId;
      if (!pid) return null;
      return typeof pid === 'string' ? pid : pid._id?.toString?.() || pid.toString();
    })
    .filter(Boolean);

  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let total = 0;
  const items = cart.items
    .filter((item) => {
      const pid = item.productId;
      const id = typeof pid === 'string' ? pid : pid._id?.toString?.() || pid.toString();
      return productMap.has(id);
    })
    .map((item) => {
      const pid = item.productId;
      const id = typeof pid === 'string' ? pid : pid._id?.toString?.() || pid.toString();
      const product = productMap.get(id);
      const price = product.price;
      total += price * item.quantity;
      return {
        productId: id,
        name: product.name,
        price,
        quantity: item.quantity,
      };
    });

  if (items.length === 0) {
    return res.status(400).json({ error: 'No valid items in cart' });
  }

  const order = await Order.create({
    userId: req.user._id,
    items,
    customerEmail: req.user.email,
    total,
    currency: 'usd',
    status: 'pending',
  });

  await clearCart(req.user._id);

  return res.status(201).json({
    _id: order._id.toString(),
    userId: order.userId.toString(),
    items: order.items.map((item) => ({
      ...item,
      productId: item.productId?.toString?.() || item.productId,
    })),
    customerEmail: order.customerEmail,
    total: order.total,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

router.get('/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId).lean();
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (order.userId?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json({
    ...order,
    _id: order._id.toString(),
    userId: order.userId?.toString(),
    items: (order.items || []).map((item) => ({
      ...item,
      productId: item.productId?.toString?.() || item.productId,
    })),
  });
});

export default router;
