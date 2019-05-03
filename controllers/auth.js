const { validatioResult } = require('express-validator/check');

const config = require('config');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// LOGIN
exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;

	const jwtPrivateKey = config.get('jwtPrivateKey')

	User.findOne({ email: email })
		.then(user => {
			if (!user) {
				const error = new Error('A user with this email could not be found.');
				error.statusCode = 401;
				throw error;
			}

			loadedUser = user;

			return bcrypt.compare(password, user.password)
		})
		.then(isEqual => {
			if (!isEqual) {
				const error = new Error('Wrong password!');
				error.statusCode = 401;
				throw error;
			}
			const token = jwt.sign({
				email: loadedUser.email,
				userId: loadedUser._id,
				// role: loadedUser.role
			},
			jwtPrivateKey,
			{ expiresIn: '1h'}
			);
			res.status(200).json({ token: token, userId: loadedUser._id.toString() });
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		})
};
