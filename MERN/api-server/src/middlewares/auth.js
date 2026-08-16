import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;

    let token = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.token;

    let token = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    }

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};
