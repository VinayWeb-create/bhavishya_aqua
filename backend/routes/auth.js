const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.post('/login', validate('login'), login);
router.post('/register', register); // Remove or protect this in production
router.get('/me', protect, getMe);

module.exports = router;
