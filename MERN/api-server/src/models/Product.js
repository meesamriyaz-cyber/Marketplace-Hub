import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  creator: { type: String, required: true },
  initials: { type: String, required: true },
  rating: { type: Number, required: true },
  reviews: { type: Number, required: true },
  install: { type: String, required: true },
  art: { type: String, required: true },
  accent: { type: String, required: true },
  features: [{ type: String }],
  badge: { type: String },
  salesCount: { type: Number, default: 0, min: 0 },
  app: {
    isApp: { type: Boolean, default: false },
    platform: { type: String, enum: ['android', 'windows', 'ios', 'web', 'multi'], default: 'android' },
    version: { type: String, default: '' },
    downloadUrl: { type: String, default: '' },
    downloadEnabled: { type: Boolean, default: false },
    trialDays: { type: Number, default: 7, min: 1, max: 365 },
  },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
