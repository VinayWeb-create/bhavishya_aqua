const express = require('express');
const router = express.Router();
const { getAllCustomers, searchCustomers, getCustomer, createCustomer, updateCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(protect);

router.get('/', getAllCustomers);
router.get('/search', searchCustomers);
router.get('/:id', getCustomer);
router.post('/', validate('createCustomer'), createCustomer);
router.put('/:id', validate('createCustomer'), updateCustomer);

module.exports = router;
