import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const isTokenIssuedBeforePasswordChange = (payload, user) => {
  if (!user.passwordChangedAt || !payload.iat) return false;
  return payload.iat * 1000 < new Date(user.passwordChangedAt).getTime();
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenFromCookie;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user || !user.isActive || isTokenIssuedBeforePasswordChange(payload, user)) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) return res.status(403).json({ error: 'Administrator access required' });
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super administrator access required' });
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenFromCookie;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (user && user.isActive && !isTokenIssuedBeforePasswordChange(payload, user)) req.user = user;
    next();
  } catch {
    next();
  }
};

export const requireAdmin = requireAdmin;
export const requireSuperAdmin = requireSuperAdmin;
