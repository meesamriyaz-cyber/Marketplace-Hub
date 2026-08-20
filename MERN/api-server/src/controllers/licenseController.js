import { User } from '../models/User.js';

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
    if (!user.trial?.startedAt) {
      const now = new Date();
      user.trial = { startedAt: now, expiresAt: new Date(now.getTime() + 7 * 86400000) };
      await user.save();
    }
    return res.json(serializeLicense(user));
  } catch (err) { next(err); }
};
