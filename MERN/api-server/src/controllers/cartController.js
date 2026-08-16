import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

function toObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
}

function serializeCart(cart) {
  const items = (cart.items || [])
    .filter((item) => item.productId)
    .map((item) => {
      const pid = item.productId;
      if (pid._id) {
        return {
          id: pid._id.toString(),
          name: pid.name,
          price: pid.price,
          quantity: item.quantity,
          art: pid.art,
          accent: pid.accent,
          creator: pid.creator,
        };
      }
      return {
        id: pid.toString(),
        name: 'Unknown',
        price: 0,
        quantity: item.quantity,
        art: '',
        accent: '',
        creator: '',
      };
    });

  return { items };
}

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id })
    .populate('items.productId', 'name price art accent creator category')
    .lean();

  if (!cart) {
    return res.json({ items: [] });
  }

  return res.json(serializeCart(cart));
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user._id,
      items: [{ productId: toObjectId(productId), quantity }],
    });
    const populated = await Cart.findById(cart._id).populate('items.productId', 'name price art accent creator category').lean();
    return res.status(201).json({ message: 'Item added to cart', ...serializeCart(populated) });
  }

  const existingIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity = Math.max(cart.items[existingIndex].quantity, quantity);
  } else {
    cart.items.push({ productId: toObjectId(productId), quantity });
  }

  await cart.save();
  const populated = await Cart.findById(cart._id).populate('items.productId', 'name price art accent creator category').lean();
  return res.json({ message: 'Item added to cart', ...serializeCart(populated) });
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return res.json({ message: 'Item removed', items: [] });
  }

  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate('items.productId', 'name price art accent creator category').lean();
  return res.json({ message: 'Item removed', ...serializeCart(populated) });
};

export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
};
