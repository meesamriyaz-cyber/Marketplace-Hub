import mongoose from 'mongoose';

const licenseActivationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  codeHash: { type: String, required: true, unique: true, index: true },
  codeExpiresAt: { type: Date, required: true, index: true },
  consumedAt: { type: Date, default: null },
  deviceId: { type: String, default: null, index: true },
  deviceSecretHash: { type: String, default: null },
  deviceActivatedAt: { type: Date, default: null },
  lastValidatedAt: { type: Date, default: null },
}, { timestamps: true });

export const LicenseActivation = mongoose.model('LicenseActivation', licenseActivationSchema);
