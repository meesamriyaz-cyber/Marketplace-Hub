import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
  }],
  customerEmail: { type: String, required: true },
  total: { type: Number, required: true },
  currency: { type: String, required: true, default: 'usd' },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  payment: {
    provider: { type: String, enum: ['razorpay', null], default: null },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
  },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
