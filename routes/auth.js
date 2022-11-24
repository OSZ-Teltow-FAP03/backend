const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const bcrypt = require('bcrypt'); // A library that is used to hash passwords.
const { encrypt, decrypt } = require('../modules/crpyto');
const { isEmail, checkUsername } = require('../modules/check_userOrEmail');
const { clearAllcookie, getSessionIDCookie } = require('../modules/cookie');


const saltRounds = 10; // The number of rounds to use when generating a salt

/* This is a post request that is used to register a user. */
router.post('/register', function(req, res) {
	/* This is getting the data from the request body. */
	const name = decrypt(req.body.name).toLowerCase();
	const lastname = decrypt(req.body.lastname).toLowerCase();
	const username = decrypt(req.body.username).toLowerCase();
	const email = decrypt(req.body.email).toLowerCase();
	const password = decrypt(req.body.password); //! I expect to receive an encrypted password
	/* This is checking if the email is valid. */
	if (!isEmail(email)) {
		res.status(400).send({
			msg: 'Invalid email',
			code: 102
		});
		return;
	}

	/* This is checking if the username is valid. */
	if (!checkUsername(username)) {
		res.status(400).send({
			msg: 'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
			code: 103
		});
		return;
	}

	/* This is checking if the password is at least 8 characters long. */
	if (password.length < 8){
		res.status(400).send({
			msg: 'Password must be at least 8 characters long.',
			code: 106
		});
		return;
	}
	/* This is checking if the username is already registered. */
	db.query('SELECT * FROM users WHERE username = ? OR email = ?', [ username, email ], function(err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 401
			});
			return;
		}
		if (result.length != 0) {
			res.status(500).send({
				msg: 'Username or Email already registered',
				code: 101
			});
			return;
		}
		bcrypt.hash(password, saltRounds, function(err2, hash) {
			if (err2) {
				throw res.status(500).send({
					msg: err2,
					code: 402
				});
				return;
			} 
		/* This is inserting the data into the database. */
			db.query('INSERT INTO users (name, lastname, username, email, password ) VALUE (?,?,?,?,?)', [ name, lastname, username, email, password ], function(error, response) {
				if (error) {
					throw res.status(500).send({
						msg: error,
						code: 401
					});
					return;
				} 
				res.status(200).send({
					msg: 'User successfully registered',
					code: 201
				});
			});
		});
	});
});

/* This is a post request that is used to login a user. */
router.post('/login', function(req, res) {
	// Unless we explicitly write to the session (and resave is false), the
	// store is never updated, even though a new session is generated on each
	// request. After we modify that session and during req.end(), it gets
	// persisted. On subsequent writes, it's updated and synced with the store.

	const email = decrypt(req.body.email).toLowerCase();
	const password = decrypt(req.body.password);
	var userOrEmail = 'username';

	/* This is checking if the email or username. */
	if (isEmail(email)) {
		userOrEmail = 'email';
	} else {
		if (!checkUsername(email)) {
			res.status(400).send({
				msg: 'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
				code: 103
			});
			return;
		}
	}
	/* This is checking if the user is registered. */
	db.query('SELECT * FROM users WHERE ' + userOrEmail + ' = ?', [ email ], function(err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 401
			});
			return;
		}
		if (result.length == 0) {
			res.status(500).send({
				msg: 'Not registered user!',
				code: 104
			});
			return;
		}
		bcrypt.compare(password, result[0].password, function(error, response) {
			if (error){
				throw res.status(500).send({
					msg: error,
					code: 402
				});
				return;
			}
			if (response == false) {
				res.status(400).send({
					msg: 'Username/Email or password incorrect',
					code: 105
				});
				return;
			}
			if (req.session.user) {
				res.status(200).send({
					msg: 'User successfully logged in',
					user: req.session.user,
					code: 202
				});
				return;
			} 
			getSessionIDCookie(req, res);
			req.session.user = {
				name: result[0].name,
				lastname: result[0].lastname,
				userID: result[0].userID,
				username: email,
				role: result[0].role,
				loggedIn: true
			};
			res.status(200).send({
				msg: 'User successfully logged in',
				user: req.session.user,
				code: 202
			});
		});
	});
});

router.get('/logout', function(req, res, next) {
	// Upon logout, we can destroy the session and unset req.session.
	req.session.destroy();
	clearAllcookie(req, res);
	res.status(200).send({
		msg: 'User successfully logged out',
		code: 203
	});
	next(); // this will give you the above exception
});



/* This is exporting the router object. */
module.exports = router;
