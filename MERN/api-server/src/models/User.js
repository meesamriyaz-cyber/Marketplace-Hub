import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  passwordChangedAt: { type: Date, default: null },
  passwordVersion: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  trial: {
    startedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
