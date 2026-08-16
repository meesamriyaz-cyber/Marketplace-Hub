import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';

dotenv.config();

const DEMO_PRODUCTS = [
  {
    name: 'Lumen',
    category: 'Creative',
    tagline: 'Your ideas, in their best light.',
    description: 'A visual thinking space for turning scattered references into clear, living direction. Lumen gives the messy middle of a project a place to breathe.',
    price: 38,
    creator: 'Studio Parallel',
    initials: 'SP',
    rating: 4.9,
    reviews: 128,
    install: 'macOS · Windows',
    art: 'art-lumen',
    accent: '#ee9d83',
    badge: "Editor's pick",
    features: ['Spatial canvases for references and notes', 'Instant moodboard extraction', 'Presentation mode with one clean link'],
  },
  {
    name: 'Kairo',
    category: 'Focus',
    tagline: 'A quieter way to get things done.',
    description: 'Kairo turns time into something you can feel. A focused daily studio that pairs intentional sessions with a calm record of your best work.',
    price: 24,
    creator: 'Mina Okafor',
    initials: 'MO',
    rating: 4.8,
    reviews: 84,
    install: 'macOS · iOS',
    art: 'art-kairo',
    accent: '#a9d0b8',
    features: ['Ritual-based focus sessions', 'Ambient soundscapes that never distract', 'Weekly reflection, beautifully surfaced'],
  },
  {
    name: 'Drift',
    category: 'Finance',
    tagline: 'See where your money is going.',
    description: 'A lucid personal finance studio for people who want the signal without the spreadsheet. Drift makes patterns visible and next steps obvious.',
    price: 29,
    creator: 'Northstar Works',
    initials: 'NW',
    rating: 4.7,
    reviews: 61,
    install: 'macOS · Windows · Linux',
    art: 'art-drift',
    accent: '#cf9f71',
    badge: 'New',
    features: ['Private, local-first ledger', 'Flexible rules for recurring spending', 'Monthly story instead of monthly panic'],
  },
  {
    name: 'Arc',
    category: 'Utilities',
    tagline: 'The small command center for your day.',
    description: 'Arc gathers the tiny tools you reach for all day into one precise, surprisingly delightful workspace. Less tab-hunting. More momentum.',
    price: 19,
    creator: 'Eli & Co.',
    initials: 'EC',
    rating: 4.9,
    reviews: 42,
    install: 'macOS',
    art: 'art-arc',
    accent: '#cf897b',
    features: ['Universal command palette', 'Clipboard history with context', 'Quick capture for anything'],
  },
  {
    name: 'Lumina',
    category: 'Creative',
    tagline: 'Lighting design for modern creators.',
    description: 'A professional lighting studio for product photography and video. Control colors, intensity, and mood with an intuitive interface designed for creators who care about every frame.',
    price: 45,
    creator: 'Lumina Labs',
    initials: 'LL',
    rating: 4.6,
    reviews: 35,
    install: 'macOS · Windows',
    art: 'art-lumina',
    accent: '#d4a5ff',
    features: ['Real-time lighting simulation', 'HDR export support', 'Scene library with 200+ presets'],
  },
  {
    name: 'Vault',
    category: 'Utilities',
    tagline: 'Your digital safety deposit box.',
    description: 'End-to-end encrypted password manager and secure notes. Zero-knowledge architecture means only you hold the keys. Beautiful, fast, and built for the modern web.',
    price: 12,
    creator: 'SecureStack',
    initials: 'SS',
    rating: 4.8,
    reviews: 210,
    install: 'macOS · Windows · Linux · iOS',
    art: 'art-vault',
    accent: '#6ec6f0',
    badge: 'Popular',
    features: ['Zero-knowledge encryption', 'Biometric unlock', 'Secure sharing'],
  },
];

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();
  const count = await Product.countDocuments({});
  if (count === 0) {
    await Product.insertMany(DEMO_PRODUCTS);
    console.log(`Seeded ${DEMO_PRODUCTS.length} products`);
  } else {
    console.log(`Database already has ${count} products. Skipping seed.`);
  }
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
