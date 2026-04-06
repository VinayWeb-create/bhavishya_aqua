const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true, default: '' },
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for fast search by name or phone
customerSchema.index({ name: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
