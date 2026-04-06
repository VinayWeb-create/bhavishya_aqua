const Joi = require('joi');

// Validation schemas
const schemas = {
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),

  createCustomer: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    address: Joi.string().max(500).optional(),
  }),

  createProduct: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    category: Joi.string().min(2).max(100).required(),
    unit: Joi.string().min(1).max(20).required(),
    rate: Joi.number().min(0).required(),
    stock: Joi.number().min(0).required(),
    description: Joi.string().max(1000).optional(),
  }),

  createSale: Joi.object({
    customerName: Joi.string().min(2).max(100).required(),
    customerPhone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    customerAddress: Joi.string().max(500).optional(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        rate: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).required(),
        discount: Joi.number().min(0).optional(),
      })
    ).min(1).required(),
    paymentMode: Joi.string().valid('cash', 'upi', 'credit', 'other').optional(),
    notes: Joi.string().max(1000).optional(),
  }),

  createReturn: Joi.object({
    customerId: Joi.string().hex().length(24).required(),
    saleId: Joi.string().hex().length(24).required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    ).min(1).required(),
    reason: Joi.string().max(500).optional(),
  }),

  updateStock: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }),
};

// Validation middleware
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ message: 'Validation schema not found' });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
  };
};

module.exports = { validate };