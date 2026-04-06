const express = require('express');
const router = express.Router();
const { createSale, getAllSales, getSalesByCustomer, getSale } = require('../controllers/saleController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(protect);

router.get('/', getAllSales);
router.get('/customer/:customerId', getSalesByCustomer);
router.get('/:id', getSale);
router.post('/', validate('createSale'), createSale);

module.exports = router;
