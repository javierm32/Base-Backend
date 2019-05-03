const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();

// LOGIN
router.post('/login', [
	body('email')
		.isEmail()
		.withMessage('Please enter a valid email.')
		.normalizeEmail(),
	body('password')
		.trim()
		.isLength({min: 5})
],
	authController.login
);

module.exports = router;
