import bcrypt from 'bcryptjs';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

const serializeUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt });

export const dashboard = async (_req, res, next) => {
  try {
    const [products, users, orders, paid] = await Promise.all([
      Product.countDocuments(), User.countDocuments(), Order.countDocuments(), Order.find({ status: 'paid' }).select('total createdAt').lean(),
    ]);
    const revenue = paid.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8).lean();
    res.json({ stats: { products, users, orders, paidOrders: paid.length, revenue }, recentOrders });
  } catch (err) { next(err); }
};

export const listProducts = async (req, res, next) => {
  try { const products = await Product.find().sort({ createdAt: -1 }).lean(); res.json(products); } catch (err) { next(err); }
};
export const createProduct = async (req, res, next) => {
  try { const product = await Product.create(req.body); res.status(201).json(product); } catch (err) { next(err); }
};
export const updateProduct = async (req, res, next) => {
  try { const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: 'Product not found' }); res.json(product); } catch (err) { next(err); }
};
export const deleteProduct = async (req, res, next) => {
  try { const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ error: 'Product not found' }); res.json({ message: 'Product deleted' }); } catch (err) { next(err); }
};

export const listUsers = async (_req, res, next) => {
  try { const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean(); res.json(users); } catch (err) { next(err); }
};
export const updateUser = async (req, res, next) => {
  try {
    const allowed = (({ name, email, role, isActive }) => ({ name, email, role, isActive }))(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(serializeUser(user));
  } catch (err) { next(err); }
};
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role });
    res.status(201).json(serializeUser(user));
  } catch (err) { next(err); }
};
export const changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

export const sales = async (req, res, next) => {
  try {
    const paid = await Order.find({ status: 'paid' }).sort({ createdAt: -1 }).lean();
    const totalRevenue = paid.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalItems = paid.reduce((sum, order) => sum + order.items.reduce((s, item) => s + Number(item.quantity || 0), 0), 0);
    res.json({ totalRevenue, paidOrders: paid.length, totalItems, orders: paid });
  } catch (err) { next(err); }
};

export const reports = async (req, res, next) => {
  try {
    const [topProducts, byDay] = await Promise.all([
      Order.aggregate([{ $match: { status: 'paid' } }, { $unwind: '$items' }, { $group: { _id: '$items.productId', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { revenue: -1 } }, { $limit: 10 }]),
      Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } }, { $sort: { _id: 1 } }]),
    ]);
    res.json({ topProducts, byDay });
  } catch (err) { next(err); }
};
