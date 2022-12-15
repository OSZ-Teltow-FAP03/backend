const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../modules/crpyto');
const { isEmail, checkUsername } = require('../modules/check_userOrEmail');
const { clearAllcookie, getSessionIDCookie } = require('../modules/cookie');


const saltRounds = 10; // The number of rounds to use when generating a salt

router.post('/register', function(req, res) {
	let name = decrypt(req.body.name);
	let lastname = decrypt(req.body.lastname);
	let username = decrypt(req.body.username);
	let email = decrypt(req.body.email);
	let password = decrypt(req.body.password);
	
	if(name===false || lastname===false || username===false || email===false || password===false){
		res.status(400).send({
			msg: 'Request not valid',
			code: 101
		});
		return;
	}
	name=name.toLowerCase();
	lastname=lastname.toLowerCase();
	username=username.toLowerCase();
	email=email.toLowerCase();

	if (!isEmail(email)) {
		res.status(400).send({
			msg: 'Email not valid',
			code: 105
		});
		return;
	}

	if (!checkUsername(username)) {
		res.status(400).send({
			msg: 'Username has invalid characters',
			code: 107
		});
		return;
	}

	if (password.length < 8){
		res.status(400).send({
			msg: 'Password must be at least 8 characters long',
			code: 106
		});
		return;
	}

	db.query('SELECT * FROM users WHERE username = ? OR email = ?', [ username, email ], function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 401
			});
			return;
		}

		if (result.length != 0) {
			res.status(500).send({
				msg: 'Username or Email already registered',
				code: 104
			});
			return;
		}

		bcrypt.hash(password, saltRounds, function(err2, hash) {
			if (err2) {
				console.error(err2);
				res.status(500).send({
					msg: err2,
					code: 402
				});
				return;
			}

			db.query('INSERT INTO users (name, lastname, username, email, password ) VALUE (?,?,?,?,?)', [ name, lastname, username, email, hash ], function(error, response) {
				if (error) {
					console.error(error);
					res.status(500).send({
						msg: error,
						code: 401
					});
					return;
				}

				res.status(200).send({
					msg: 'User registered',
					code: 202
				});
			});
		});
	});
});

router.post('/login', function(req, res) {
	let email = decrypt(req.body.email);
	const password = decrypt(req.body.password);
	let userOrEmail = 'username';
	
	if(email===false || password===false){
		res.status(400).send({
			msg: 'Request not valid',
			code: 101
		});
		return;
	}

	if (isEmail(email)) {
		userOrEmail = 'email';
	} else if (!checkUsername(email)) {
		res.status(500).send({
			msg: 'Username/Email or password incorrect',
			code: 108
		});
		return;
	}

	db.query('SELECT * FROM users WHERE ' + userOrEmail + ' = ?', [ email ], function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 401
			});
			return;
		}

		if (result.length == 0) {
			res.status(500).send({
				msg: 'Username/Email or password incorrect',
				code: 108
			});
			return;
		}

		bcrypt.compare(password, result[0].password, function(error, response) {
			if (error){
				console.error(err);
				res.status(500).send({
					msg: error,
					code: 402
				});
				return;
			}

			if (response == false) {
				res.status(400).send({
					msg: 'Username/Email or password incorrect',
					code: 108
				});
				return;
			}

			if (req.session.user) {
				res.status(200).send({
					msg: 'User logged in',
					code: 203,
					data: req.session.user
				});
				return;
			}

			getSessionIDCookie(req, res);
			req.session.user = {
				name: result[0].name,
				lastname: result[0].lastname,
				userID: result[0].userID,
				username: email,
				role: result[0].role
			};

			res.status(200).send({
				msg: 'User logged in',
				code: 203,
				data: req.session.user
			});
		});
	});
});

router.get('/logout', function(req, res, next) {
	req.session.destroy();
	clearAllcookie(req, res);
	res.status(200).send({
		msg: 'User logged out',
		code: 204
	});
	next();
});

module.exports = router;
