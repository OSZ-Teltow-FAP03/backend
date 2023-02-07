const { encrypt, decrypt } = require('../modules/crpyto');
const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

router.get('/user-get', async (req, res) => {
	const userID = await decrypt(req.body.userID);

	db.query('SELECT * FROM users WHERE userID =' + userID, function(err, result) {
		if (err) throw err;
		console.log(result);
		res.send(result);
	});
});

router.post('/user-update', async (req, res) => {
	/* This is getting the data from the request body.*/
	const userID = await decrypt(req.body.userID);
	const role = await decrypt(req.body.role).toLowerCase();

	/* This is updating the data into the database. */
	db.query('UPDATE users SET role = ? WHERE userID = ?', [ role, userID ], (error, response) => {
		if (error) {
			res.send({
				msg: error
			});
		} else {
			res.send({
				msg: 'User successfully updated',
				code: 201
			});
		}
	});
});

router.get('/user-list', (req, res) => {
	/* list of user info: username, first name, last name, email, role */
	if (req.session.user) {
		db.query('SELECT username, name, lastname, email, role FROM users', function(err, result) {
			if (err) throw err;
			res.send(result);
		});
	} else {
		res.statusCode(400).send('Bitte einloggen!');
	}
});

router.post('/user-delete', async (req, res) => {
	/* This is getting the data from the request body.*/
	const userID = await decrypt(req.body.userID);

	/* This is updating the data into the database. */
	db.query('DELETE FROM users WHERE userID = ?', [ userID ], (error, response) => {
		if (error) {
			res.send({
				msg: error
			});
		} else {
			res.send({
				msg: 'User successfully deleted',
				code: 201
			});
		}
	});
});

/* This is exporting the router object. */
module.exports = router;
