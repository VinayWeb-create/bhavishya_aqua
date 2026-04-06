const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

// GET /api/customers - list all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers', error: err.message });
  }
};

// GET /api/customers/search?q=query
const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const customers = await Customer.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ],
    }).limit(10);

    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// GET /api/customers/:id
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Attach purchase history
    const sales = await Sale.find({ customer: customer._id })
      .populate('items.product', 'name unit')
      .sort({ saleDate: -1 });

    res.json({ customer, sales });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customer', error: err.message });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !phone) return res.status(400).json({ message: 'Name and phone are required' });

    // Upsert: find or create
    let customer = await Customer.findOne({ phone });
    if (customer) return res.status(409).json({ message: 'Customer with this phone already exists', customer });

    customer = await Customer.create({ name, phone, address });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create customer', error: err.message });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update customer', error: err.message });
  }
};

module.exports = { getAllCustomers, searchCustomers, getCustomer, createCustomer, updateCustomer };
