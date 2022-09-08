const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
var ping = require('ping');
require('dotenv').config();
const saltRounds = 10;

var db = mysql.createConnection({
	host: process.env.host,
	user: process.env.user,
	password: process.env.password,
	port: process.env.port,
	database: process.env.database
});

db.connect(function(err) {
	if (err) {
		return console.error('error: ' + err.message);
	}

	console.log('Connected to the MySQL server.');
});

app.use(express.json());
app.use(cors());

app.post('/Register', (req, res) => {
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;

	if (!isEmail(email)) {
		res.send({ msg: 'Invalid email' });
		return;
	}

	if (!checkUsername(username)) {
		res.send({
			msg:
				'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.'
		});
		return;
	}

	if (password.length < 8) return res.send({ msg: 'Password must be at least 8 characters long.' });

	db.query('SELECT * FROM users WHERE username = ?', [ username ], function(err, result) {
		if (err) throw err;
		if (result.length == 0) {
			db.query('SELECT * FROM users WHERE email = ?', [ email ], function(err, result) {
				if (err) throw err;
				if (result.length == 0) {
					bcrypt.hash(password, saltRounds, (err, hash) => {
						db.query(
							'INSERT INTO users (username, email, password) VALUE (?,?,?)',
							[ username, email, hash ],
							(error, response) => {
								if (error) {
									console.log('error :' + error);
									res.send(error);
								} else if (err) {
									console.log('err :' + err);
									res.send(err);
								} else {
									res.send({ msg: 'User successfully registered' });
								}
							}
						);
					});
				} else {
					res.send({ msg: 'Email already registered' });
				}
			});
		} else {
			res.send({ msg: 'username already registered' });
		}
	});
});

app.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	var userOrEmail = 'username';
	if (isEmail(email)) {
		userOrEmail = 'email';
	} else {
		if (!checkUsername(email)) {
			res.send({
				msg:
					'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.'
			});
			return;
		}
	}

	console.log(email);
	db.query('SELECT * FROM users WHERE ' + userOrEmail + ' = ?', [ email ], (err, result) => {
		if (err) {
			res.send(err);
		}
		if (result.length > 0) {
			bcrypt.compare(password, result[0].password, (error, response) => {
				if (error) {
					console.log('error :' + error);
					res.send(error);
				} else if (err) {
					console.log('err :' + err);
					res.send(err);
				}
				if (response == true) {
					res.send(response);
				} else {
					res.send({ msg: 'Email or password incorrect' });
				}
			});
		} else {
			res.send({ msg: 'Not registered user!' });
		}
	});
});

let isEmail = (email) => {
	// don't remember from where i copied this code, but this works.
	let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (re.test(email)) {
		// this is a valid email address
		// call setState({email: email}) to update the email
		// or update the data in redux store.
		return true;
	} else {
		// invalid email, maybe show an error to the user.
		return false;
	}
};

let checkUsername = (username) => {
	// don't remember from where i copied this code, but this works.
	let re = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;
	if (re.test(username)) {
		// this is a valid username
		// call setState({username: username}) to update the username
		// or update the data in redux store.
		return true;
	} else {
		// invalid username, maybe show an error to the user.
		return false;
	}
};

app.listen(3001, () => {
	console.log('running in the 3001');
});
