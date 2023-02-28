const express = require('express');
const router = express.Router();
const db = require('../database/index');
const {
	decrypt
} = require('../modules/crpyto');
const {
	checkPrivileges
} = require('../modules/check_privileges');
const getUserOnDbByUserId = require("../modules/database/getUserOnDbByUserId");
router.get('/get', (req, res) => {
	if (!req.session.user) {
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	if (!checkPrivileges(req.baseUrl + req.path, req.session.user.role)) {
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}

	const userID = req.query.UserID;
	if (userID === false) {
		res.status(400).send({
			msg: 'UserID not set',
			code: 109
		});
		return;
	}

	db.query('SELECT * FROM users WHERE userID = ?', [userID], function (err, result) {
		if (err) {
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
	if (!req.session.user) {
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}
	const userID = decrypt(req.body.userID);
	const role = decrypt(req.body.role);
	if (userID === false || role === false) {
		res.status(400).send({
			msg: 'Request not valid',
			code: 101
		});
		return;
	}

	db.query('SELECT role FROM users WHERE userID = ?', [userID], (err, result) => {
		if (err) {
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		if (result.length !== 1) {
			res.status(400).send({
				msg: 'User not found',
				code: 110
			});
			return;
		}

		if (!checkPrivileges(req.baseUrl + req.path, req.session.user.role, false, {
				newRole: role,
				oldRole: result[0].role
			})) {
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
			});
			return;
		}

		db.query('UPDATE users SET role = ? WHERE userID = ?', [role, userID], (err2, result2) => {
			if (err2) {
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
	if (!req.session.user) {
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	if (!checkPrivileges(req.baseUrl + req.path, req.session.user.role)) {
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}

	db.query('SELECT username, name, lastname, email, role FROM users', function (err, result) {
		if (err) {
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

router.post('/changePassword', async (req, res) => {
	const userID = decrypt(req.body.userID)
	const user = await getUserOnDbByUserId(userID);
	const password = decrypt(req.body.password);

	if (password === false) {
		res.status(400).send({
			msg: "Request not valid",
			code: 101,
		});
		return;
	} else if (password.length < 8) {
		res.status(400).send({
			msg: "Das Kennwort muss eine Mindestlänge von 8 Zeichen haben.",
			code: 106,
		});
		return;
	}
	if (user) {
		bcrypt.hash(password, saltRounds, async (err2, hashPassword) => {
			if (err2) {
				console.error(err2);
				res.status(500).send({
					msg: err2,
					code: 402,
				});
				return;
			}
			const isChangePassword = changePassword(user.email, hashPassword);
			if (isChangePassword) {
				const transporter = nodemailer.createTransport(config.mailAuth[0]);
				const mailOptions = {
					from: {
						name: "OSZ-Teltow Filmarchiv Passwort vergessen",
						address: config.mailAuth[0].auth.user,
					},
					to: user.email,
					subject: "Filmarchiv Passwort vergessen",
					html: `
								`
				};
				transporter.sendMail(mailOptions, async (err) => {
					if (err) {
						console.log(err);
						res.status(400).send({
							msg: `Error sendMail: ${err}`,
							code: 403,
						});
						return
					}

					res.status(400).send({
						msg: `Es wurde eine E-Mail mit weiteren Anweisungen an ${ user.email } gesendet.`,
						data: encrypt(user),
						code: 405,
					});
					return
				});
			} else {
				res.status(400).send({
					msg: "Kennwort konnte nicht geändert werden",
					data: isChangePassword,
					code: 401,
				});
				return
			}
		});
	} else {
		res.status(400).send({
			msg: `Das Token zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.`,
			code: 407,
		});
		return
	}
});

router.delete('/delete', (req, res) => {
	if (!req.session.user) {
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	if (!checkPrivileges(req.baseUrl + req.path, req.session.user.role)) {
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}

	const userID = decrypt(req.body.UserID);
	if (userID === false) {
		res.status(400).send({
			msg: 'UserID not set',
			code: 109
		});
		return;
	}

	db.query('DELETE FROM users WHERE userID = ?', [userID], (err, result) => {
		if (err) {
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
