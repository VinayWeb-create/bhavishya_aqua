const mongoose = require('mongoose');
const Return = require('../models/Return');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// POST /api/returns - process a return
const createReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { saleId, productId, quantity, reason } = req.body;

    if (!saleId || !productId || !quantity)
      return res.status(400).json({ message: 'saleId, productId, and quantity are required' });

    const sale = await Sale.findById(saleId).session(session);
    if (!sale) throw new Error('Sale not found');

    // Find the item in the sale
    const saleItem = sale.items.find((item) => item.product.toString() === productId);
    if (!saleItem) throw new Error('Product not found in this sale');
    if (quantity > saleItem.quantity) throw new Error(`Return quantity cannot exceed purchased quantity (${saleItem.quantity})`);

    // Check how much has already been returned for this item in this sale
    const existingReturns = await Return.aggregate([
      { $match: { originalSale: sale._id, product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, totalReturned: { $sum: '$quantity' } } },
    ]);
    const alreadyReturned = existingReturns[0]?.totalReturned || 0;
    if (alreadyReturned + quantity > saleItem.quantity) {
      throw new Error(`Total returns cannot exceed purchased quantity. Already returned: ${alreadyReturned}`);
    }

    // Calculate refund
    const refundAmount = (saleItem.rate * quantity) - (saleItem.discount / saleItem.quantity) * quantity;

    // Restore stock
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Product not found');
    product.stock += quantity;
    await product.save({ session });

    // Create return record
    const [returnRecord] = await Return.create(
      [{
        originalSale: sale._id,
        customer: sale.customer,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        product: product._id,
        productName: product.name,
        quantity,
        rate: saleItem.rate,
        refundAmount,
        reason: reason || '',
        processedBy: req.user.id,
        returnDate: new Date(),
      }],
      { session }
    );

    // Reduce customer total spent
    await Customer.findByIdAndUpdate(
      sale.customer,
      { $inc: { totalSpent: -refundAmount } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(returnRecord);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

// GET /api/returns - list all returns
const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .sort({ returnDate: -1 })
      .populate('product', 'name unit')
      .populate('customer', 'name phone');
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch returns', error: err.message });
  }
};

// GET /api/returns/customer/:customerId
const getReturnsByCustomer = async (req, res) => {
  try {
    const returns = await Return.find({ customer: req.params.customerId })
      .sort({ returnDate: -1 })
      .populate('product', 'name unit');
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch returns', error: err.message });
  }
};

module.exports = { createReturn, getAllReturns, getReturnsByCustomer };
