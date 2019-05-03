const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// SIGNUP
exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	const email = req.body.email;
	const password = req.body.password;
	const name = req.body.name;
	const surname = req.body.surname;
	const phone = req.body.phone;

	bcrypt
		.hash(password, 12)
		.then(hashedPw => {
			const user = new User({
				email: email,
				password: hashedPw,
				name: name,
				surname: surname,
				phone: phone
			})
			return user.save();
		})
		.then(result => {
			res.status(201).json({message: 'User created!', userId: result._id });
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

// GET USERS
exports.users = (req, res, next) => {
	const query = req.query.query;

	function escapeRegex(text) {
    	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  	};

  	let pageNumber = req.query.pageNumber;
  	let pageSize = 10;
  	let totalItems;
  	let totalPages;

  	if (query) {
  		const regex = new RegExp(escapeRegex(query), 'gi');
  		User.find({ name: regex })
  		.countDocuments()
  		.then(numUsers => {
  			totalItems = numUsers;
  			if (!pageNumber) {
  				pageNumber = 1
  			}
			return User.find({ name: regex }).select('-password').skip((pageNumber - 1) * pageSize).limit(pageSize)
  		})
  		.then(users => {
  			totalPages = Math.ceil((totalItems / pageSize))
			res
			.status(200)
			.json({message: 'Fetched users successfully', users: users, totalItems: totalItems, totalPages: totalPages, pageSize: pageSize, pageNumber: pageNumber});
  		})
  		.catch(err => {
  			if (!err.statusCode) {
  				err.statusCode = 500;
  			}
  			next(err);
  		});
  	} else {
  		User.find()
  		.countDocuments()
  		.then(numUsers => {
  			totalItems = numUsers;
  			if (!pageNumber) {
  				pageNumber = 1
  			}
  			return User.find().select('-password').skip((pageNumber - 1) * pageSize).limit(pageSize)
  		})
  		.then(users => {
  			totalPages = Math.ceil((totalItems / pageSize))
			res
			.status(200)
			.json({message: 'Fetched users successfully', users: users, totalItems: totalItems, totalPages: totalPages, pageSize: pageSize, pageNumber: pageNumber});
  		})
  		.catch(err => {
  			if (!err.statusCode) {
  				err.statusCode = 500;
  			}
  			next(err);
  		});
  	}
};

// GET USER
exports.user = (req, res, next) => {
	const id = req.params.id;
	
	User.findById(id)
	.select('-password')
	.then(user => {
		if (!user) {
			const error = new Error('Could not find user.');
			error.statusCode = 404;
			throw error;
		}
		res
		.status(200)
		.json({ message: 'User fetched.', user: user });
	})
	.catch(err => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	});
};

// UPDATE USER
exports.updateUser = (req, res, next) => {
	const id = req.params.id;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, entered data is incorrect.');
		error.statusCode = 422;
		throw error;
	}

	const password = req.body.password;
	const name = req.body.name;
	const surname = req.body.surname;
	const phone = req.body.phone;

	User.findById(id)
		.then(user => {
			if (!user) {
				const error = new Error('Could not find user.');
				error.statusCode = 404;
				throw error;
			}

			bcrypt
				.hash(password, 12)
				.then(hashedPw => {
					user.password = hashedPw;
					user.name = name;
					user.surname = surname;
					user.phone = phone;

					return user.save();
				})
				.catch(err => {
					if (!err.statusCode) {
						err.statusCode = 500;
					}
					next(err);
				});

		})
		.then(result => {
			res.status(200).json({ message: 'User updated!', user: result })
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

// DELETE USER
exports.deleteUser = (req, res, next) => {
	const id = req.params.id;

	User.findById(id)
		.then(user => {
			if (!user) {
				const error = new Error('Could not find user.');
				error.statusCode = 404;
				throw error;
			}
			return User.findByIdAndRemove(id);
		})
		.then(result => {
			console.log(result);
			res.status(200).json({ message: 'Deleted user.'})
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
		});
};
