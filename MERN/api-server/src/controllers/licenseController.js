import crypto from 'crypto';
import { Product } from '../models/Product.js';
import { License } from '../models/License.js';

const DEFAULT_TRIAL_DAYS = 7;
const ACTIVATION_CODE_TTL_MS = 10 * 60 * 1000;

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

const hashSecret = (value) => crypto.createHash('sha256').update(value).digest('hex');
const safeEqualHex = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
};
const normalizeCode = (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

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

export const createActivationCode = async (req, res, next) => {
  try {
    const { product, error } = await getApp(req);
    if (error) return res.status(400).json({ error });

    let license = await License.findOne({ userId: req.user._id, productId: product._id });
    if (!license) {
      const now = new Date();
      const trialDays = Number(product.app?.trialDays) || DEFAULT_TRIAL_DAYS;
      license = await License.create({ userId: req.user._id, productId: product._id, status: 'trial', trial: { startedAt: now, expiresAt: new Date(now.getTime() + trialDays * 86400000) }, lastValidatedAt: now });
    }

    const now = new Date();
    if (license.status === 'trial' && license.trial?.expiresAt && license.trial.expiresAt <= now) license.status = 'expired';
    if (license.status === 'active' && license.expiresAt && license.expiresAt <= now) license.status = 'expired';
    if (!['trial', 'active'].includes(license.status)) return res.status(403).json({ error: 'License is not eligible for activation' });

    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    license.activationCodeHash = hashSecret(code);
    license.activationCodeExpiresAt = new Date(now.getTime() + ACTIVATION_CODE_TTL_MS);
    license.activationCodeConsumedAt = null;
    await license.save();

    return res.json({
      productId: product._id.toString(),
      status: license.status,
      code,
      expiresAt: license.activationCodeExpiresAt.toISOString(),
    });
  } catch (err) { next(err); }
};

export const exchangeActivationCode = async (req, res, next) => {
  try {
    const productId = req.body?.productId;
    const code = normalizeCode(req.body?.code);
    const deviceId = String(req.body?.deviceId || '').trim();
    if (!productId || !code || !deviceId) return res.status(400).json({ error: 'productId, code and deviceId are required' });
    if (code.length !== 10 || deviceId.length < 8 || deviceId.length > 200) return res.status(400).json({ error: 'Invalid activation request' });

    const product = await Product.findById(productId).lean();
    if (!product || !product.app?.isApp) return res.status(404).json({ error: 'Application not found' });

    const license = await License.findOne({ productId, activationCodeHash: hashSecret(code) });
    if (!license) return res.status(401).json({ error: 'Invalid activation code' });
    const now = new Date();
    if (license.activationCodeConsumedAt || !license.activationCodeExpiresAt || license.activationCodeExpiresAt <= now) return res.status(401).json({ error: 'Activation code expired or already used' });
    if (!['trial', 'active'].includes(license.status)) return res.status(403).json({ error: 'License is not active' });

    if (license.deviceId && license.deviceId !== deviceId) return res.status(409).json({ error: 'License is already activated on another device' });

    const deviceSecret = crypto.randomBytes(32).toString('hex');
    license.deviceId = deviceId;
    license.deviceSecretHash = hashSecret(deviceSecret);
    license.deviceActivatedAt = now;
    license.activationCodeConsumedAt = now;
    license.activationCodeHash = null;
    license.activationCodeExpiresAt = null;
    license.lastValidatedAt = now;
    await license.save();

    return res.json({
      productId: product._id.toString(),
      status: license.status,
      serverTime: now.toISOString(),
      deviceSecret,
      trial: license.status === 'trial' ? {
        startedAt: license.trial?.startedAt || null,
        expiresAt: license.trial?.expiresAt || null,
      } : null,
      license: license.status === 'active' ? { expiresAt: license.expiresAt || null, activatedAt: license.activatedAt || null } : null,
    });
  } catch (err) { next(err); }
};

export const getDeviceLicenseStatus = async (req, res, next) => {
  try {
    const productId = req.body?.productId;
    const deviceId = String(req.body?.deviceId || '').trim();
    const deviceSecret = String(req.body?.deviceSecret || '');
    if (!productId || !deviceId || !deviceSecret) return res.status(400).json({ error: 'productId, deviceId and deviceSecret are required' });

    const license = await License.findOne({ productId, deviceId });
    if (!license || !license.deviceSecretHash || !safeEqualHex(hashSecret(deviceSecret), license.deviceSecretHash)) return res.status(401).json({ error: 'Invalid device credentials' });

    const now = new Date();
    if (license.status === 'trial' && license.trial?.expiresAt && license.trial.expiresAt <= now) license.status = 'expired';
    if (license.status === 'active' && license.expiresAt && license.expiresAt <= now) license.status = 'expired';
    license.lastValidatedAt = now;
    await license.save();

    return res.json(serializeLicense(license, now));
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
