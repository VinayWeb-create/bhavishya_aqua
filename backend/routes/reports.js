const express = require('express');
const router = express.Router();
const { getReport, getSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getSummary);
router.get('/', getReport);

module.exports = router;
