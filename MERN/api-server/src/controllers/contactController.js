import { ContactRequest } from '../models/ContactRequest.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createContactRequest = async (req, res) => {
  const { name, email, company, phone, projectType, budget, message } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Please tell us a bit about what you need' });
  }

  const contactRequest = await ContactRequest.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: company?.trim(),
    phone: phone?.trim(),
    projectType: projectType?.trim(),
    budget: budget?.trim(),
    message: message.trim(),
  });

  return res.status(201).json({
    message: 'Thanks — we received your requirements and will be in touch shortly.',
    id: contactRequest._id.toString(),
  });
};

// Basic listing for internal/admin use. Any authenticated user can currently
// view submissions — if you introduce user roles, gate this behind an
// `isAdmin` check before shipping to production.
export const listContactRequests = async (req, res) => {
  const requests = await ContactRequest.find({}).sort({ createdAt: -1 }).lean();
  return res.json(requests.map((item) => ({ ...item, _id: item._id.toString() })));
};
