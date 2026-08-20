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
