import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  status: { type: String, enum: ['trial', 'expired', 'active', 'revoked'], default: 'trial' },
  trial: {
    startedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  activatedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  activationCodeHash: { type: String, default: null, index: true },
  activationCodeExpiresAt: { type: Date, default: null },
  activationCodeConsumedAt: { type: Date, default: null },
  deviceId: { type: String, default: null, index: true },
  deviceSecretHash: { type: String, default: null },
  deviceActivatedAt: { type: Date, default: null },
  lastValidatedAt: { type: Date, default: null },
}, { timestamps: true });

licenseSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const License = mongoose.model('License', licenseSchema);
