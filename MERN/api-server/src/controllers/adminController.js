import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

const SALT_ROUNDS = 12;
const generateTemporaryPassword = () => `${crypto.randomBytes(12).toString('base64url').slice(0, 10)}A7!`;

export const dashboard = async (_req, res, next) => { try { const [products, users, orders, paidOrders] = await Promise.all([Product.countDocuments(), User.countDocuments(), Order.countDocuments(), Order.find({ status: 'paid' }).select('total createdAt').lean()]); const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0); const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8).lean(); res.json({ stats: { products, users, orders, paidOrders: paidOrders.length, revenue }, recentOrders }); } catch (err) { next(err); } };
export const listProducts = async (_req, res, next) => { try { res.json(await Product.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); } };
export const createProduct = async (req, res, next) => { try { res.status(201).json(await Product.create(req.body)); } catch (err) { if (err?.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map((item) => item.message).join(' ') }); next(err); } };
export const updateProduct = async (req, res, next) => { try { const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: 'Product not found' }); res.json(product); } catch (err) { if (err?.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map((item) => item.message).join(' ') }); next(err); } };
export const deleteProduct = async (req, res, next) => { try { const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ error: 'Product deleted' }); res.json({ message: 'Product deleted' }); } catch (err) { next(err); } };
export const listUsers = async (_req, res, next) => { try { res.json(await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean()); } catch (err) { next(err); } };
export const updateUser = async (req, res, next) => { try { const allowed = {}; for (const key of ['name', 'email', 'role', 'isActive']) if (req.body[key] !== undefined) allowed[key] = req.body[key]; const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true }).select('-passwordHash'); if (!user) return res.status(404).json({ error: 'User not found' }); res.json(user); } catch (err) { next(err); } };
export const resetUserPassword = async (req, res, next) => { try { const user = await User.findById(req.params.id); if (!user) return res.status(404).json({ error: 'User not found' }); const targetIsAdmin = user.role !== 'user'; const actorIsSuperAdmin = req.user?.role === 'super_admin'; if (targetIsAdmin && !actorIsSuperAdmin) return res.status(403).json({ error: 'Only a super admin can reset an administrator password.' }); const temporaryPassword = generateTemporaryPassword(); user.passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS); user.passwordChangedAt = new Date(); user.passwordVersion = (user.passwordVersion || 0) + 1; await user.save(); res.json({ message: 'Password reset successfully. Share this temporary password securely with the user.', temporaryPassword }); } catch (err) { next(err); } };
export const sales = async (_req, res, next) => { try { const orders = await Order.find().sort({ createdAt: -1 }).lean(); const paidOrders = orders.filter((order) => order.status === 'paid'); const pendingOrders = orders.filter((order) => order.status === 'pending'); const cancelledOrders = orders.filter((order) => order.status === 'cancelled'); const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0); const totalItems = paidOrders.reduce((sum, order) => sum + (order.items || []).reduce((s, item) => s + Number(item.quantity || 0), 0), 0); const pendingValue = pendingOrders.reduce((sum, order) => sum + Number(order.total || 0), 0); const cancelledValue = cancelledOrders.reduce((sum, order) => sum + Number(order.total || 0), 0); res.json({ totalRevenue, paidOrders: paidOrders.length, pendingOrders: pendingOrders.length, cancelledOrders: cancelledOrders.length, pendingValue, cancelledValue, totalItems, orders }); } catch (err) { next(err); } };
export const reports = async (req, res, next) => {
  try {
    const { from, to, granularity = 'daily' } = req.query;
    const end = to ? new Date(`${to}T23:59:59.999`) : new Date();
    const start = from ? new Date(`${from}T00:00:00`) : new Date(end);
    if (!from) start.setDate(start.getDate() - (granularity === 'monthly' ? 365 : 29));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return res.status(400).json({ error: 'Invalid report date range.' });
    if (start > end) return res.status(400).json({ error: 'Report start date cannot be after the end date.' });

    const match = { createdAt: { $gte: start, $lte: end } };
    const paidMatch = { ...match, status: 'paid' };
    const format = granularity === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

    const [summaryRows, statusRows, topProducts, trend] = await Promise.all([
      Order.aggregate([{ $match: paidMatch }, { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 }, items: { $sum: { $sum: '$items.quantity' } } } }]),
      Order.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: paidMatch }, { $unwind: '$items' }, { $group: { _id: '$items.productId', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }, { $sort: { revenue: -1 } }, { $limit: 10 }]),
      Order.aggregate([{ $match: paidMatch }, { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' }, items: { $sum: { $sum: '$items.quantity' } } } }, { $sort: { _id: 1 } }]),
    ]);

    const summary = summaryRows[0] || { revenue: 0, orders: 0, items: 0 };
    const statuses = { paid: { count: 0, value: 0 }, pending: { count: 0, value: 0 }, cancelled: { count: 0, value: 0 } };
    for (const row of statusRows) if (statuses[row._id]) statuses[row._id] = { count: row.count, value: row.value };
    res.json({
      range: { from: start.toISOString(), to: end.toISOString() },
      granularity: granularity === 'monthly' ? 'monthly' : 'daily',
      summary: { revenue: Number(summary.revenue || 0), orders: Number(summary.orders || 0), items: Number(summary.items || 0), averageOrderValue: summary.orders ? Number(summary.revenue || 0) / Number(summary.orders) : 0 },
      statuses,
      topProducts,
      trend,
    });
  } catch (err) { next(err); }
};
export const listOrders = async (_req, res, next) => { try { res.json(await Order.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); } };
export const getOrder = async (req, res, next) => { try { const order = await Order.findById(req.params.id).lean(); if (!order) return res.status(404).json({ error: 'Order not found' }); res.json(order); } catch (err) { next(err); } };
export const cancelOrder = async (req, res, next) => { try { const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ error: 'Order not found' }); if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled from Admin.' }); order.status = 'cancelled'; await order.save(); res.json(order); } catch (err) { next(err); } };