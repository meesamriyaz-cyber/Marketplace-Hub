import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

const required = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`${key} is required in the local environment.`);
    process.exit(1);
  }
}

if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === 'super_admin') {
      console.log(`Super admin already exists for ${email}. No changes made.`);
      process.exit(0);
    }
    console.error(`A user already exists for ${email} with role '${existing.role}'. No changes made.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.create({
    name: process.env.ADMIN_NAME?.trim() || 'Super Administrator',
    email,
    passwordHash,
    role: 'super_admin',
    isActive: true,
  });

  console.log(`Initial super admin created for ${email}.`);
} catch (error) {
  console.error('Unable to create super admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
