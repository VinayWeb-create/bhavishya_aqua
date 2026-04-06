const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    category: { type: String, trim: true, default: 'General' },
    unit: { type: String, default: 'kg', trim: true }, // kg, bag, litre, piece, etc.
    rate: { type: Number, required: true, min: 0 },    // default selling rate
    stock: { type: Number, required: true, default: 0, min: 0 },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
