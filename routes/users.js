const express = require('express');
const router = express.Router();
const db = require('../database/index');
const { decrypt } = require('../modules/crpyto');
const { checkPrivileges } = require('../modules/check_privileges');

router.get('/get', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}
	
	if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role)){
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}
	
	const userID = req.query.UserID;
	if(userID===false){
		res.status(400).send({
			msg: 'UserID not set',
			code: 109
		});
		return;
	}

	db.query('SELECT * FROM users WHERE userID = ?', [userID], function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.status(200).send({
			msg: "Data sent",
			code: 201,
			data: result
		});
	});
});

router.patch('/updateRole', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}
	const userID = decrypt(req.body.userID);
	const role = decrypt(req.body.role);
	if(userID===false || role===false){
		res.status(400).send({
			msg: 'Request not valid',
			code: 101
		});
		return;
	}
	
	db.query('SELECT role FROM users WHERE userID = ?', [ userID ], (err, result) => {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		
		if(result.length!==1){
			res.status(400).send({
				msg: 'User not found',
				code: 110
			});
			return;
		}
		
		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, false, {newRole: role, oldRole: result[0].role})){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
			});
			return;
		}

		db.query('UPDATE users SET role = ? WHERE userID = ?', [ role, userID ], (err2, result2) => {
			if (err2){
				console.error(err2);
				res.status(500).send({
					msg: err2,
					code: 402
				});
				return;
			}
			res.status(200).send({
				msg: "User updated",
				code: 205
			});
		});
	});
});

router.get('/list', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}
	
	if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role)){
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}
	
	db.query('SELECT username, name, lastname, email, role FROM users', function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.status(200).send({
			msg: "Data sent",
			code: 201,
			data: result
		});
	});
});

router.delete('/delete', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}
	
	if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role)){
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}
	
	const userID = decrypt(req.body.UserID);
	if(userID===false){
		res.status(400).send({
			msg: 'UserID not set',
			code: 109
		});
		return;
	}
	
	db.query('DELETE FROM users WHERE userID = ?', [ userID ], (err, result) => {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		res.status(200).send({
			code: 206,
			msg: "User deleted"
		});
	});
});

module.exports = router;
