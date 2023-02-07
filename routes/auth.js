const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const { decrypt } = require('../modules/crpyto');
const bcrypt = require('bcrypt');
const { isEmail, checkUsername } = require('../modules/check_userOrEmail');
const { clearAllcookie, getSessionIDCookie } = require('../modules/cookie');

const saltRounds = 10; // The number of rounds to use when generating a salt

/* This is a post request that is used to register a user. */
router.post('/register', async (req, res) => {
	/* This is getting the data from the request body. */
	const name = await decrypt(req.body.name).toLowerCase();
	const lastname = await decrypt(req.body.lastname).toLowerCase();
	const username = await decrypt(req.body.username).toLowerCase();
	const email = await decrypt(req.body.email).toLowerCase();
	const password = await decrypt(req.body.password); //! I expect to receive an encrypted password
	/* This is checking if the email is valid. */
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
	email=email.toLowerCase();

	/* This is checking if the password is at least 8 characters long. */
	if (password.length < 8)
		return res.status(203).send({
			msg: 'Password must be at least 8 characters long.'
		});

	/* This is checking if the username is already registered. */
	db.query('SELECT * FROM users WHERE username = ?', [ username ], function(err, result) {
		if (err)
			throw res.status(500).send({
				msg: err
			});
		if (result.length == 0) {
			/* This is checking if the Email is already registered. */
			db.query('SELECT * FROM users WHERE email = ?', [ email ], function(err, result) {
				if (err)
					throw res.status(500).send({
						msg: err
					});
				if (result.length == 0) {
					// bcrypt.hash(password, saltRounds, (err, hash) => {
					/* This is inserting the data into the database. */
					db.query(
						'INSERT INTO users (name, lastname, username, email, password ) VALUE (?,?,?,?,?)',
						[ name, lastname, username, email, password ],
						(error, response) => {
							if (error && err) {
								res.status(500).send({
									msg: error || err
								});
							} else {
								res.status(200).send({
									msg: 'User successfully registered',
									code: 201
								});
							}
						}
					);
					// });
				} else {
					res.status(203).send({
						msg: 'Email already registered',
						code: 100
					});
				}
			});
		} else {
			res.status(203).send({
				msg: 'username already registered',
				code: 100
			});
		}
	});
});

/* This is a post request that is used to login a user. */
router.post('/login', async (req, res) => {
	// Unless we explicitly write to the session (and resave is false), the
	// store is never updated, even though a new session is generated on each
	// request. After we modify that session and during req.end(), it gets
	// persisted. On subsequent writes, it's updated and synced with the store.

	const email = await decrypt(req.body.email).toLowerCase();
	const password = await decrypt(req.body.password);
	var userOrEmail = 'username';

	/* This is checking if the email or username. */
	if (isEmail(email))
	{
		userOrEmail = 'email';
	} else
	{
		if (!checkUsername(email))
		{
			res.status(203).send({
				msg:
					'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
				code: 102
			});
			return;
		}

		if (result.length == 0)
		{
			res.status(500).send({
				msg: 'Username/Email or password incorrect',
				code: 108
			});
			return;
		}

		bcrypt.compare(password, result[ 0 ].password, function (error, response)
		{
			if (error)
			{
				console.error(err);
				res.status(500).send({
					msg: error,
					code: 402
				});
				return;
			}

			if (response == false)
			{
				res.status(400).send({
					msg: 'Username/Email or password incorrect',
					code: 108
				});
				return;
			}

			if (req.session.user)
			{
				res.status(200).send({
					msg: 'User logged in',
					code: 203,
					data: req.session.user
				});
				return;
			}

			getSessionIDCookie(req, res);
			req.session.user = {
				name: result[ 0 ].name,
				lastname: result[ 0 ].lastname,
				userID: result[ 0 ].userID,
				username: email,
				role: result[ 0 ].role
			};

			res.status(200).send({
				msg: 'User logged in',
				code: 203,
				data: req.session.user
			});
		});
	}
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


// reset password with token

router.get('/resetpassword:')

/* This is exporting the router object. */
module.exports = router;
