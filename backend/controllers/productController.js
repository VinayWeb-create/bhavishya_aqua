const Product = require('../models/Product');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, unit, rate, stock, description } = req.body;
    if (!name || rate === undefined) return res.status(400).json({ message: 'Name and rate are required' });

    const existing = await Product.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ message: 'Product already exists' });

    const product = await Product.create({ name, category, unit, rate, stock: stock || 0, description });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, rate, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, unit, rate, description },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// PATCH /api/products/:id/stock - manually add stock
const addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ message: 'Quantity must be positive' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.stock += Number(quantity);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update stock', error: err.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

module.exports = { getAllProducts, getProduct, createProduct, updateProduct, addStock, deleteProduct };
