import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from '../src/models/Product.js';

const product = {
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

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!uri) throw new Error('MONGO_URI or MONGODB_URI is required');

await mongoose.connect(uri);

const existing = await Product.findOne({ name: product.name, 'app.isApp': true });
const saved = existing
  ? await Product.findByIdAndUpdate(existing._id, { $set: product }, { new: true })
  : await Product.create(product);

console.log(`Cloud Kitchen product ${existing ? 'updated' : 'created'}: ${saved._id}`);
console.log('Product ID:', saved._id.toString());
console.log('Price (INR):', saved.price);

await mongoose.disconnect();
