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
	const userID = req.query.userID;
	if(userID===false){
		res.status(400).send({
			msg: 'userID not set',
			code: 114
		});
		return;
	}

	db.query('SELECT * FROM users WHERE userID = ?', [userID], function(err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.send({
			msg: "Data sent",
			code: 204,
			data: result
		});
	});
});

router.patch('/updateRole', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	const userID = decrypt(req.body.userID);
	let role = decrypt(req.body.role);
	if(userID===false || role===false){
		res.status(400).send({
			msg: 'Request not valid',
			code: 104
		});
		return;
	}
	role=role.toLowerCase();
	db.query('UPDATE users SET role = ? WHERE userID = ?', [ role, userID ], (err, result) => {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.send({
			msg: "User updated",
			code: 205
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
			msg: "Data sent",
			code: 204,
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
	if(userID===false){
		res.status(400).send({
			msg: 'userID not set',
			code: 114
		});
		return;
	}
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

module.exports = router;
