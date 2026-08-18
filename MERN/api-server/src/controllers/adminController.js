import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

export const dashboard = async (_req, res, next) => {
  try {
    const [products, users, orders, paidOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Order.find({ status: 'paid' }).select('total createdAt').lean(),
    ]);
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8).lean();
    res.json({ stats: { products, users, orders, paidOrders: paidOrders.length, revenue }, recentOrders });
  } catch (err) { next(err); }
};

export const listProducts = async (_req, res, next) => {
  try { res.json(await Product.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); }
};

export const createProduct = async (req, res, next) => {
  try { res.status(201).json(await Product.create(req.body)); } catch (err) { next(err); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
};

export const listUsers = async (_req, res, next) => {
  try { res.json(await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean()); } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowed = {};
    for (const key of ['name', 'email', 'role', 'isActive']) if (req.body[key] !== undefined) allowed[key] = req.body[key];
    const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

export const sales = async (_req, res, next) => {
  try {
    const orders = await Order.find({ status: 'paid' }).sort({ createdAt: -1 }).lean();
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + Number(item.quantity || 0), 0), 0);
    res.json({ totalRevenue, paidOrders: orders.length, totalItems, orders });
  } catch (err) { next(err); }
};

export const reports = async (_req, res, next) => {
  try {
    const [topProducts, byDay] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'paid' } }, { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } }, { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({ topProducts, byDay });
  } catch (err) { next(err); }
};
