import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { License } from '../models/License.js';

const CURRENCY = process.env.RAZORPAY_CURRENCY || 'INR';

function getClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.startsWith('rzp_test_replace') || keySecret === 'replace-with-razorpay-key-secret') return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId is required' });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });
  if (order.status === 'paid') return res.status(400).json({ error: 'Order is already paid' });
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'Razorpay is not configured yet', configured: false });
  const razorpayOrder = await client.orders.create({ amount: Math.round(order.total * 100), currency: CURRENCY, receipt: order._id.toString(), notes: { internalOrderId: order._id.toString(), customerEmail: order.customerEmail } });
  order.payment = { ...order.payment, provider: 'razorpay', razorpayOrderId: razorpayOrder.id };
  await order.save();
  return res.json({ configured: true, keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, orderId: order._id.toString(), customerEmail: order.customerEmail });
};

export const verifyRazorpayPayment = async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: 'Missing payment verification fields' });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Forbidden' });
  if (order.status === 'paid') return res.json({ message: 'Payment already verified', status: order.status });
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(503).json({ error: 'Razorpay is not configured yet' });
  if (order.payment?.razorpayOrderId && order.payment.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ error: 'Razorpay order mismatch' });
  const expectedSignature = crypto.createHmac('sha256', keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expectedSignature !== razorpay_signature) return res.status(400).json({ error: 'Payment verification failed' });

  const paidAt = new Date();
  order.status = 'paid';
  order.payment = { ...order.payment, provider: 'razorpay', razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, paidAt };
  await order.save();

  await Promise.all((order.items || []).map(async (item) => {
    await Product.findByIdAndUpdate(item.productId, { $inc: { salesCount: item.quantity || 1 } });
    const product = await Product.findById(item.productId).select('app').lean();
    if (!product?.app?.isApp) return;
    await License.findOneAndUpdate(
      { userId: order.userId, productId: item.productId },
      { $set: { status: 'active', activatedAt: paidAt, expiresAt: null, purchaseId: order._id, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, lastValidatedAt: paidAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }));

  return res.json({ message: 'Payment verified and application license activated', status: order.status, licenseActivated: true });
};
