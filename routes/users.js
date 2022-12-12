const { encrypt, decrypt } = require('../modules/crpyto');
const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

router.get('/get', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	const userID = decrypt(req.body.userID);

	db.query('SELECT * FROM users WHERE userID = ?', [userID], function(err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.send({
			code: 204,
			msg: "Data sent",
			data: result
		});
	});
});

router.patch('/update', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	const userID = decrypt(req.body.userID);
	const role = decrypt(req.body.role).toLowerCase();
	db.query('UPDATE users SET role = ? WHERE userID = ?', [ role, userID ], (err, result) => {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.send({
			code: 205,
			msg: "User updated"
		});
	});
});

router.get('/list', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	db.query('SELECT username, name, lastname, email, role FROM users', function(err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.send({
			code: 204,
			msg: "Data sent",
			data: result
		});
	});
});

router.delete('/delete', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	const userID = decrypt(req.body.userID);
	db.query('DELETE FROM users WHERE userID = ?', [ userID ], (err, result) => {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.send({
			code: 206,
			msg: "User deleted"
		});
	});
});

/* This is exporting the router object. */
module.exports = router;
