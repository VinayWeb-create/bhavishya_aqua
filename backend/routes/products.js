const express = require('express');
const router = express.Router();
const { getAllProducts, getProduct, createProduct, updateProduct, addStock, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.use(protect);

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', validate('createProduct'), createProduct);
router.put('/:id', validate('createProduct'), updateProduct);
router.patch('/:id/stock', validate('updateStock'), addStock);
router.delete('/:id', deleteProduct);

module.exports = router;
