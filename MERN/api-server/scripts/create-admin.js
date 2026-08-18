import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

const required = ['MONGODB_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;

if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8characters long.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'super_admin') {
      console.log(`A super_admin already exists for ${email}. No changes made.`);
      process.exitCode = 0;
    } else {
      console.error(`A user already exists for ${email}. No role was changed.`);
      process.exitCode = 2;
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      name: process.env.ADMIN_NAME.trim(),
      email,
      passwordHash,
      role: 'super_admin',
      isActive: true,
    });
    console.log(`Initial super_admin created for ${email}.`);
  }
} catch (error) {
  console.error('Failed to create admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
