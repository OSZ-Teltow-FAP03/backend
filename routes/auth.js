const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const bcrypt = require('bcrypt'); // A library that is used to hash passwords.
const { encrypt, decrypt } = require('../modules/crpyto');
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
		res.status(203).send({
			msg: 'Invalid email',
			code: 101
		});
		return;
	}

	/* This is checking if the username is valid. */
	if (!checkUsername(username)) {
		res.status(203).send({
			msg:
				'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
			code: 102
		});
		return;
	}

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
	if (isEmail(email)) {
		userOrEmail = 'email';
	} else {
		if (!checkUsername(email)) {
			res.status(203).send({
				msg:
					'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.',
				code: 102
			});
			return;
		}
	}
	/* This is checking if the user is registered. */
	db.query('SELECT * FROM users WHERE ' + userOrEmail + ' = ?', [ email ], (err, result) => {
		if (err) res.status(500).send(err);
		if (result.length > 0) {
			bcrypt.compare(password, result[0].password, (error, response) => {
				if (error) {
					res.status(500).send(error);
				} else if (err) {
					res.status(500).send(err);
				}
				if (response == true) {
					if (req.session.user) {
						res.status(200).send({
							user: req.session.user,
							code: 105
						});
					} else {
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
							msg: 'successfully',
							user: req.session.user,
							code: 105
						});
					}
				} else {
					res.status(203).send({
						msg: 'Email or password incorrect',
						code: 105
					});
				}
			});
		} else {
			res.status(203).send({
				msg: 'Not registered user!',
				code: 104
			});
		}
	});
});

router.get('/logout', (req, res, next) => {
	// Upon logout, we can destroy the session and unset req.session.
	req.session.destroy();
	clearAllcookie(req, res);
	res.status(200);
	next(); // this will give you the above exception
});


// reset password with token

router.get('/resetpassword:')

/* This is exporting the router object. */
module.exports = router;
