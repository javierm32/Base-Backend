const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const userController = require('../controllers/user')

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// SIGNUP
router.put('/signup', isAuth, 
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom((value, { req }) => {
				return User.findOne({email: value}).then(userDoc => {
					if (userDoc) {
						return Promise.reject('E-mail address already exists!');
					}
				});
			})
			.normalizeEmail(),
			body('password')
				.trim()
				.isLength({min: 5}),
			body('name')
				.trim()
				.not()
				.isEmpty(),
			body('surname')
				.trim()
				.not()
				.isEmpty()
	], 
	userController.signup
);

// GET USERS
router.get('/users', isAuth, userController.users);

// GET USER
router.get('/user/:id', isAuth, userController.user);

// UPDATE USER
router.put('/user/:id', isAuth, userController.updateUser);

// DELETE USER
router.delete('/user/:id', isAuth, userController.deleteUser);

module.exports = router;
