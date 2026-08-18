import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

export const listCategories = async (_req, res, next) => {
  try { res.json(await Category.find().sort({ name: 1 }).lean()); } catch (err) { next(err); }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    if (err?.code === 11000) return res.status(400).json({ error: 'A category with this name already exists.' });
    if (err?.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map((item) => item.message).join(' ') });
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const allowed = {};
    for (const key of ['name', 'description', 'isActive']) if (req.body[key] !== undefined) allowed[key] = req.body[key];
    const category = await Category.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    if (err?.code === 11000) return res.status(400).json({ error: 'A category with this name already exists.' });
    if (err?.name === 'ValidationError') return res.status(400).json({ error: Object.values(err.errors).map((item) => item.message).join(' ') });
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const productsUsingCategory = await Product.countDocuments({ category: category.name });
    if (productsUsingCategory > 0) return res.status(400).json({ error: `Cannot delete this category because ${productsUsingCategory} product(s) use it. Deactivate it instead.` });
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
};
