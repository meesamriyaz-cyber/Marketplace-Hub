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
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
