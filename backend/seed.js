/**
 * Seed Script — Bhavishya Aqua Feeds & Needs
 * Run once: node seed.js
 * Creates admin user + sample products
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bhavishya_aqua';

// Inline models (avoid circular deps in seed)
const userSchema = new mongoose.Schema({ name: String, username: String, password: String, role: String }, { timestamps: true });
const productSchema = new mongoose.Schema({ name: String, category: String, unit: String, rate: Number, stock: Number, description: String }, { timestamps: true });

const User    = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
  { name: 'Aqua Feed Premium 5mm', category: 'Fish Feed',   unit: 'kg',   rate: 120, stock: 500, description: 'High-protein floating pellet' },
  { name: 'Aqua Feed Starter 1mm', category: 'Fish Feed',   unit: 'kg',   rate: 145, stock: 300, description: 'For fingerlings and fry' },
  { name: 'Shrimp Feed 2mm',       category: 'Shrimp Feed', unit: 'kg',   rate: 180, stock: 200, description: 'Balanced nutrition for shrimp' },
  { name: 'Shrimp Feed 3mm',       category: 'Shrimp Feed', unit: 'kg',   rate: 175, stock: 150, description: 'Grow-out shrimp pellet' },
  { name: 'Probiotics Aqua',       category: 'Health',      unit: 'litre',rate: 350, stock: 80,  description: 'Beneficial microorganism blend' },
  { name: 'Mineral Mix Pond',      category: 'Supplements', unit: 'kg',   rate: 220, stock: 100, description: 'Essential minerals for pond water' },
  { name: 'Aeration Pipe 50m',     category: 'Equipment',   unit: 'piece',rate: 800, stock: 30,  description: 'Flexible aeration tubing' },
  { name: 'Air Stone Diffuser',    category: 'Equipment',   unit: 'piece',rate: 45,  stock: 200, description: 'Ceramic disc aerator' },
  { name: 'Pond Disinfectant 1L',  category: 'Health',      unit: 'litre',rate: 280, stock: 60,  description: 'Broad-spectrum aqua disinfectant' },
  { name: 'Water Test Kit',        category: 'Testing',     unit: 'piece',rate: 650, stock: 25,  description: 'pH, ammonia, nitrite test strips' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 12);
      await User.create({ name: 'Admin User', username: 'admin', password: hashed, role: 'admin' });
      console.log('Admin user created → username: admin | password: admin123');
    } else {
      console.log('Admin user already exists, skipping.');
    }

    // Insert products (skip duplicates)
    let added = 0;
    for (const p of sampleProducts) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) { await Product.create(p); added++; }
    }
    console.log(`${added} sample product(s) added.`);

    console.log('\nSeed complete. You can now start the server and login.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
