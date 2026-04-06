const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

// POST /api/sales - create a new sale
const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customerName, customerPhone, customerAddress, items, paymentMode, notes } = req.body;

    if (!customerName || !customerPhone) return res.status(400).json({ message: 'Customer name and phone required' });
    if (!items || items.length === 0) return res.status(400).json({ message: 'At least one item required' });

    // Find or create customer
    let customer = await Customer.findOne({ phone: customerPhone }).session(session);
    if (!customer) {
      [customer] = await Customer.create([{ name: customerName, phone: customerPhone, address: customerAddress || '' }], { session });
    }

    // Validate items and reduce stock
    let totalAmount = 0;
    let totalDiscount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);

      const subtotal = item.rate * item.quantity - (item.discount || 0);
      totalAmount += subtotal;
      totalDiscount += item.discount || 0;

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ session });

      processedItems.push({
        product: product._id,
        productName: product.name,
        rate: item.rate,
        quantity: item.quantity,
        discount: item.discount || 0,
        subtotal,
      });
    }

    // Create sale record
    const [sale] = await Sale.create(
      [{
        customer: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: processedItems,
        totalAmount,
        totalDiscount,
        paymentMode: paymentMode || 'cash',
        notes: notes || '',
        createdBy: req.user.id,
        saleDate: new Date(),
      }],
      { session }
    );

    // Update customer total spent
    customer.totalSpent += totalAmount;
    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(sale);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

// GET /api/sales - list all sales with pagination
const getAllSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sales = await Sale.find()
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name phone');

    const total = await Sale.countDocuments();
    res.json({ sales, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales', error: err.message });
  }
};

// GET /api/sales/customer/:customerId
const getSalesByCustomer = async (req, res) => {
  try {
    const sales = await Sale.find({ customer: req.params.customerId })
      .sort({ saleDate: -1 })
      .populate('items.product', 'name unit');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales', error: err.message });
  }
};

// GET /api/sales/:id
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('items.product', 'name unit');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sale', error: err.message });
  }
};

module.exports = { createSale, getAllSales, getSalesByCustomer, getSale };
