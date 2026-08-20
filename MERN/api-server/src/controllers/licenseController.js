import { Product } from '../models/Product.js';
import { License } from '../models/License.js';

const DEFAULT_TRIAL_DAYS = 7;

async function getApp(req) {
  const productId = req.body?.productId || req.query?.productId;
  if (!productId) return { error: 'productId is required' };
  const product = await Product.findById(productId);
  if (!product || !product.app?.isApp) return { error: 'Application not found' };
  return { product };
}

function serializeLicense(license, now = new Date()) {
  if (!license) return { status: 'none', serverTime: now.toISOString(), trial: null, license: null };
  let status = license.status;
  if (status === 'trial' && license.trial?.expiresAt && license.trial.expiresAt <= now) status = 'expired';
  if (status === 'active' && license.expiresAt && license.expiresAt <= now) status = 'expired';
  const trialExpiresAt = license.trial?.expiresAt || null;
  return {
    status,
    serverTime: now.toISOString(),
    productId: license.productId.toString(),
    trial: license.trial?.startedAt && trialExpiresAt ? {
      startedAt: license.trial.startedAt.toISOString(),
      expiresAt: trialExpiresAt.toISOString(),
      daysRemaining: Math.max(0, Math.ceil((trialExpiresAt.getTime() - now.getTime()) / 86400000)),
    } : null,
    license: status === 'active' ? {
      status: 'active', activatedAt: license.activatedAt || null, expiresAt: license.expiresAt || null,
      purchaseId: license.purchaseId || null,
      razorpayOrderId: license.razorpayOrderId || null,
      razorpayPaymentId: license.razorpayPaymentId || null,
    } : null,
  };
}

export const getLicenseStatus = async (req, res, next) => {
  try {
    const { product, error } = await getApp(req);
    if (error) return res.status(400).json({ error });
    const license = await License.findOne({ userId: req.user._id, productId: product._id });
    const now = new Date();
    if (license) {
      if (license.status === 'trial' && license.trial?.expiresAt <= now) license.status = 'expired';
      if (license.status === 'active' && license.expiresAt && license.expiresAt <= now) license.status = 'expired';
      license.lastValidatedAt = now;
      await license.save();
    }
    return res.json(serializeLicense(license, now));
  } catch (err) { next(err); }
};

export const activateTrial = async (req, res, next) => {
  try {
    const { product, error } = await getApp(req);
    if (error) return res.status(400).json({ error });
    const existing = await License.findOne({ userId: req.user._id, productId: product._id });
    if (existing) return res.json(serializeLicense(existing));
    const now = new Date();
    const trialDays = Number(product.app?.trialDays) || DEFAULT_TRIAL_DAYS;
    const license = await License.create({ userId: req.user._id, productId: product._id, status: 'trial', trial: { startedAt: now, expiresAt: new Date(now.getTime() + trialDays * 86400000) }, lastValidatedAt: now });
    return res.status(201).json(serializeLicense(license, now));
  } catch (err) { next(err); }
};

export const expireTrialForDevelopment = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });
    const { product, error } = await getApp(req);
    if (error) return res.status(400).json({ error });
    const license = await License.findOne({ userId: req.user._id, productId: product._id });
    if (!license) return res.status(400).json({ error: 'No license exists for this application' });
    if (license.status === 'active') return res.status(400).json({ error: 'Cannot expire an active paid license' });
    const now = new Date();
    license.status = 'expired';
    license.trial.expiresAt = new Date(now.getTime() - 1000);
    await license.save();
    return res.json(serializeLicense(license, now));
  } catch (err) { next(err); }
};
