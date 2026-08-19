import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const SALT_ROUNDS = 12;

function generateToken(user) {
  return jwt.sign({ userId: user._id.toString(), passwordVersion: user.passwordVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function serializeUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt };
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, passwordVersion: 0 });
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({ user: serializeUser(user), token });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ error: 'Account is inactive' });
    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({ user: serializeUser(user), token });
  } catch (err) { next(err); }
};

export const me = async (req, res) => res.json({ user: serializeUser(req.user) });

export const logout = async (_req, res) => { res.clearCookie('token'); return res.json({ message: 'Logged out successfully' }); };
