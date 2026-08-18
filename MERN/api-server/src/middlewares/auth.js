import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;

    let token = null;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7);
    else if (tokenFromCookie) token = tokenFromCookie;

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super administrator access required' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;
    let token = null;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7);
    else if (tokenFromCookie) token = tokenFromCookie;
    if (!token) return next();

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (user && user.isActive) req.user = user;
    next();
  } catch {
    next();
  }
};
