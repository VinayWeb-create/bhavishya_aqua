const express = require('express');
const router = express.Router();
const { createReturn, getAllReturns, getReturnsByCustomer } = require('../controllers/returnController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(protect);

router.get('/', getAllReturns);
router.get('/customer/:customerId', getReturnsByCustomer);
router.post('/', validate('createReturn'), createReturn);

module.exports = router;
