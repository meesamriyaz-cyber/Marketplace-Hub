import { Router } from "express";
import { Product } from "../models/Product.js";

const router = Router();

router.get("/products", async (_req, res) => {
  const products = await Product.find({}).sort({ salesCount: -1, rating: -1, reviews: -1, createdAt: -1 });
  res.json(products);
});

router.get("/products/:productId", async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

export default router;
