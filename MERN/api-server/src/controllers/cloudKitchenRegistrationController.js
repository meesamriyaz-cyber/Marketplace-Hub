import crypto from 'crypto';
import { Product } from '../models/Product.js';

const PRODUCT = {
  name: 'Cloud Kitchen',
  category: 'Restaurants',
  tagline: 'Complete restaurant POS, kitchen and online ordering system.',
  description: 'A Windows restaurant management application for point-of-sale, kitchen operations, inventory and online customer ordering.',
  price: 9999,
  creator: 'Cutting Edge',
  initials: 'CK',
  rating: 5,
  reviews: 0,
  install: 'Windows',
  art: 'cloud-kitchen',
  accent: 'restaurant',
  features: [
    'Restaurant POS',
    'Kitchen management',
    'Inventory management',
    'Online ordering',
    'Customer-specific MongoDB database',
  ],
  badge: 'Windows App',
  app: {
    isApp: true,
    platform: 'windows',
    version: '1.0.0',
    downloadUrl: '',
    downloadEnabled: false,
    trialDays: 7,
  },
};

const secretsMatch = (provided, expected) => {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

export const registerCloudKitchen = async (req, res) => {
  try {
    const expectedSecret = process.env.CLOUD_KITCHEN_REGISTER_SECRET;
    const providedSecret = req.get('x-cloud-kitchen-register-secret');

    if (!secretsMatch(providedSecret, expectedSecret)) {
      return res.status(403).json({ error: 'Invalid registration secret' });
    }

    const existing = await Product.findOne({ name: PRODUCT.name, 'app.isApp': true });
    const saved = existing
      ? await Product.findByIdAndUpdate(existing._id, { $set: PRODUCT }, { new: true, runValidators: true })
      : await Product.create(PRODUCT);

    return res.json({
      success: true,
      action: existing ? 'updated' : 'created',
      productId: saved._id.toString(),
      name: saved.name,
      price: saved.price,
      platform: saved.app?.platform,
      trialDays: saved.app?.trialDays,
      downloadEnabled: saved.app?.downloadEnabled,
    });
  } catch (error) {
    console.error('Cloud Kitchen registration failed:', error);
    return res.status(500).json({ error: 'Cloud Kitchen registration failed' });
  }
};
