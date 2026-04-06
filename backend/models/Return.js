const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    originalSale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    rate: { type: Number, required: true },
    refundAmount: { type: Number, required: true },
    reason: { type: String, trim: true, default: '' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    returnDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Return', returnSchema);
