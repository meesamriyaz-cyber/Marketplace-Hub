import { User } from '../models/User.js';

const TRIAL_DAYS = 7;

const serializeLicense = (user, now = new Date()) => {
  const startedAt = user.trial?.startedAt || null;
  const expiresAt = user.trial?.expiresAt || null;
  let status = 'none';
  if (user.license?.status === 'active') status = 'active';
  else if (expiresAt) status = expiresAt.getTime() > now.getTime() ? 'trial' : 'expired';
  return {
    status,
    serverTime: now.toISOString(),
    trial: startedAt && expiresAt ? { startedAt: startedAt.toISOString(), expiresAt: expiresAt.toISOString(), daysRemaining: Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000)) } : null,
    license: user.license?.status === 'active' ? { status: 'active', activatedAt: user.license.activatedAt || null, expiresAt: user.license.expiresAt || null } : null,
  };
};

export const getLicenseStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'user') return res.json({ status: 'active', serverTime: new Date().toISOString(), trial: null, license: null });
    // Trial is deliberately NOT started here. This endpoint is a read/status check.
    // A trial begins only when the real app explicitly activates it after first launch.
    return res.json(serializeLicense(user));
  } catch (err) { next(err); }
};

export const activateTrial = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'user') return res.json({ status: 'active', serverTime: new Date().toISOString(), trial: null, license: null });
    if (user.license?.status === 'active') return res.json(serializeLicense(user));
    if (user.trial?.startedAt) return res.json(serializeLicense(user));

    const now = new Date();
    user.trial = { startedAt: now, expiresAt: new Date(now.getTime() + TRIAL_DAYS * 86400000) };
    await user.save();
    return res.status(201).json(serializeLicense(user));
  } catch (err) { next(err); }
};

// Development-only test hook. This endpoint is unavailable when NODE_ENV=production.
export const expireTrialForDevelopment = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'Not found' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'user') return res.status(400).json({ error: 'Development trial expiry is only available for customer accounts' });
    if (user.license?.status === 'active') return res.status(400).json({ error: 'Cannot expire an account with an active paid license' });
    if (!user.trial?.startedAt) return res.status(400).json({ error: 'No active trial exists for this account' });

    const now = new Date();
    user.trial.expiresAt = new Date(now.getTime() - 1000);
    await user.save();
    return res.json(serializeLicense(user, now));
  } catch (err) { next(err); }
};
