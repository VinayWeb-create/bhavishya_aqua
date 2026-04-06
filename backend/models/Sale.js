const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true }, // snapshot at time of sale
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0, min: 0 },  // discount in rupees per item
    subtotal: { type: Number, required: true },       // (rate * qty) - discount
  },
  { _id: true }
);

const saleSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },  // snapshot
    customerPhone: { type: String, required: true }, // snapshot
    items: [saleItemSchema],
    totalAmount: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    paymentMode: { type: String, enum: ['cash', 'upi', 'credit', 'other'], default: 'cash' },
    notes: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
