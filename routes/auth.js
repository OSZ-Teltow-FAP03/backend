const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");
const {
	decrypt,
	encrypt
} = require("../modules/crpyto");
const bcrypt = require("bcrypt");
const {
	isEmail,
	checkUsername
} = require("../modules/check_userOrEmail");
const {
	clearAllcookie,
	getSessionIDCookie
} = require("../modules/cookie");
const crypto = require('crypto');
const config = require('../config/config');
const nodemailer = require('nodemailer')
const checkEmailOnDB = require('../modules/database/checkEmailOnDB');
const {
	checkUserTokenOnDB,
	setUserTokenOnDB
} = require("../modules/database/userTokenOnDB");
const changePassword = require("../modules/database/changePassword")

const saltRounds = 10; // The number of rounds to use when generating a salt

router.post("/register", function (req, res) {
	let name = decrypt(req.body.name);
	let lastname = decrypt(req.body.lastname);
	let username = decrypt(req.body.username);
	let email = decrypt(req.body.email);
	let password = decrypt(req.body.password);

	if (
		name === false ||
		lastname === false ||
		username === false ||
		email === false ||
		password === false
	) {
		res.status(400).send({
			msg: "Request not valid",
			code: 101,
		});
		return;
	}
	username = username.toLowerCase();
	email = email.toLowerCase();

	if (!isEmail(email)) {
		res.status(400).send({
			msg: "Email not valid",
			code: 105,
		});
		return;
	}

	if (!checkUsername(username)) {
		res.status(400).send({
			msg: "Benutzername hat ungültige Zeichen",
			code: 107,
		});
		return;
	}

	if (password.length < 8) {
		res.status(400).send({
			msg: "Das Kennwort muss eine Mindestlänge von 8 Zeichen haben.",
			code: 106,
		});
		return;
	}

	db.query(
		"SELECT * FROM users WHERE username = ? OR email = ?",
		[username, email],
		function (err, result) {
			if (err) {
				console.error(err);
				res.status(500).send({
					msg: err,
					code: 401,
				});
				return;
			}

			if (result.length != 0) {
				res.status(500).send({
					msg: "Benutzername oder E-Mail bereits registriert",
					code: 104,
				});
				return;
			}

			bcrypt.hash(password, saltRounds, function (err2, hash) {
				if (err2) {
					console.error(err2);
					res.status(500).send({
						msg: err2,
						code: 402,
					});
					return;
				}

				db.query(
					"INSERT INTO users (name, lastname, username, email, password ) VALUE (?,?,?,?,?)",
					[name, lastname, username, email, hash],
					function (error, response) {
						if (error) {
							console.error(error);
							res.status(500).send({
								msg: error,
								code: 401,
							});
							return;
						}

						res.status(200).send({
							msg: "Registrierter Benutzer",
							code: 202,
						});
					}
				);
			});
		}
	);
});

router.post("/login", function (req, res) {
	let email = decrypt(req.body.email);
	const password = decrypt(req.body.password);
	let userOrEmail = "username";

	if (email === false || password === false) {
		res.status(400).send({
			msg: "Anfrage nicht gültig",
			code: 101,
		});
		return;
	}

	if (isEmail(email)) {
		userOrEmail = "email";
	} else if (!checkUsername(email)) {
		res.status(500).send({
			msg: "Benutzername/E-Mail oder Passwort falsch",
			code: 108,
		});
		return;
	}
	email = email.toLowerCase();

	db.query(
		"SELECT * FROM users WHERE " + userOrEmail + " = ?",
		[email],
		function (err, result) {
			if (err) {
				console.error(err);
				res.status(500).send({
					msg: err,
					code: 401,
				});
				return;
			}

			if (result.length == 0) {
				res.status(500).send({
					msg: "Benutzername/E-Mail oder Passwort falsch",
					code: 108,
				});
				return;
			}

			bcrypt.compare(password, result[0].password, function (error, response) {
				if (error) {
					console.error(err);
					res.status(500).send({
						msg: error,
						code: 402,
					});
					return;
				}

				if (response == false) {
					res.status(400).send({
						msg: "Benutzername/E-Mail oder Passwort falsch",
						code: 108,
					});
					return;
				}

				if (req.session.user) {
					res.status(200).send({
						msg: "Eingeloggter Benutzer",
						code: 203,
						data: req.session.user,
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
				};

				res.status(200).send({
					msg: "Eingeloggter Benutzer",
					code: 203,
					data: req.session.user,
				});
			});
		}
	);
});

router.post("/forgetpassword", async (req, res) => {
	// const email = decrypt(req.body.email);
	var email = req.body.email
	console.log(email);
	// Find the user with the specified email
	const user = await checkEmailOnDB(email);
	if (!user) {
		res.status(400).send({
			msg: "E-Mail existiert nicht",
			code: 105,
		});
		return;
	}
	// Generate a token and send it to the user's email
	const token = crypto.randomBytes(1000).toString("hex");
	const transporter = nodemailer.createTransport(config.mailAuth[0]);
	const mailOptions = {
		from: {
			name: "OSZ-Teltow Filmarchiv Passwort vergessen",
			address: config.mailAuth[0].auth.user,
		},
		to: email,
		subject: "Filmarchiv Passwort vergessen",
		html: `
	<html>
		<head>
		  <meta charset="UTF-8">
  		<meta name="viewport" content="width=device-width, initial-scale=1.0">
  		<meta http-equiv="X-UA-Compatible" content="ie=edge">
    	<title>OSZ-Teltow Filmarchiv Passwort vergessen</title>
			<style>
				body {
					font-family: Arial, sans-serif;
					font-size: 14px;
					color: #333;
					line-height: 1.5;
				}
				h1 {
					font-size: 24px;
					font-weight: bold;
					margin-bottom: 30px;
				}
				p {
					margin-bottom: 20px;
				}
				a {
					color: #fff;
					background-color: #007bff;
					border-color: #007bff;
					border-radius: 4px;
					padding: 10px 20px;
					text-decoration: none;
					display: inline-block;
				}
				.container {
					max-width: 600px;
					margin: 0 auto;
					padding: 20px;
					border: 1px solid #ccc;
					border-radius: 5px;
					background-color: #f7f7f7;
				}
				.signature {
					margin-top: 30px;
					text-align: left;
				}
				.signature p {
					margin: 0;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<h1>Passwort zurücksetzen</h1>
				<p>Sehr geehrte/r <strong>${user.lastname}</strong>,</p>
				<p>Sie erhalten diese Nachricht, weil für Ihr Konto eine Passwortrücksetzung angefordert wurde. Bitte beachten Sie, dass Sie diese E-Mail ignorieren können, wenn Sie das Zurücksetzen nicht angefordert haben. Ihr Passwort bleibt dann unverändert.</p>
				<p> Bitte beachten Sie, dass es wichtig ist, Ihr neues Passwort sicher aufzubewahren. Hier sind einige Tipps, wie Sie ein sicheres Passwort erstellen können: </p>
					<ul>
				    <li>Passwörter sollten mindestens 8 Zeichen lang sein. </li>
						<li > Verwenden Sie eine Mischung aus Groß - und Kleinbuchstaben, Zahlen und Symbolen. </li>
						<li > Vermeiden Sie Informationen, die leicht zu erraten sind.Dazu gehören Ihr Name, Ihr Geburtsdatum oder allgemein gebräuchliche Wörter. </li>
						<li > Verwenden Sie für jedes Ihrer Online - Konten ein eigenes Passwort. </li>
					</ul>
				<p>Um Ihr Passwort zurückzusetzen, klicken Sie bitte auf den folgenden Button:</p>
				<a href="https://${req.headers.host}/auth/forgetpassword/${token}">Passwort zurücksetzen</a>
				<p>Bei Fragen oder Unklarheiten können Sie sich gerne mit unserem OSZ-Teltow Admin in Verbindung setzen.</p>
				<div class="signature">
					<p>Mit freundlichen Grüßen,</p>
					<br>OSZ-Teltow Admin</p>
				</div>
			</div>
			<p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
			<p>&copy; OSZ-Teltow. All rights reserved. </p>
		</body>
	</html>`
	};
	transporter.sendMail(mailOptions, async (err, info) => {
		if (err) {
			console.log(err);
			res.status(400).send({
				msg: `Error sendMail`,
				code: 403
			});
			return
		}
		const isSetUserTokenOnDB = await setUserTokenOnDB(token, email);
		if (isSetUserTokenOnDB) {
			res.status(400).send({
				msg: `Es wurde eine E-Mail mit weiteren Anweisungen an ${email} gesendet.`,
				code: 405,
			});
		} else {
			res.status(400).send({
				msg: `${isSetUserTokenOnDB}`,
				code: 401,
			});
		}
	});
})


router.get('/forgetpassword/:token', async (req, res) => {
	const token = req.params.token
	const isTokenOnDB = await checkUserTokenOnDB(token);
	if (isTokenOnDB) {
		res.status(400).send({
			data: isTokenOnDB,
			code: 201,
		});
		return
	} else {
		res.status(400).send({
			msg: `not found the ${ token }`,
			code: 407,
		});
	}
});

router.post('/forgetpassword/:token', async (req, res) => {
	const token = req.params.token
	const isTokenOnDB = await checkUserTokenOnDB(token);
	const user = isTokenOnDB;
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

	if (isTokenOnDB) {
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
				const isSetUserTokenOnDB = await setUserTokenOnDB(null, user.email);
				if (isSetUserTokenOnDB) {
					const transporter = nodemailer.createTransport(config.mailAuth[0]);
					const mailOptions = {
						from: {
							name: "OSZ-Teltow Filmarchiv Passwort vergessen",
							address: config.mailAuth[0].auth.user,
						},
						to: user.email,
						subject: "Filmarchiv Passwort vergessen",
						html: `
								<html>
									<head>
									  	<meta charset="UTF-8">
  										<meta name="viewport" content="width=device-width, initial-scale=1.0">
  										<meta http-equiv="X-UA-Compatible" content="ie=edge">
  										<title>OSZ-Teltow Filmarchiv Passwort erfolgreich geändert</title>
										<style>
											body {
												font-family: Arial, sans-serif;
												font-size: 14px;
												color: #333;
												line-height: 1.5;
											}
											h1 {
												font-size: 24px;
												font-weight: bold;
												margin-bottom: 30px;
											}
											p {
												margin-bottom: 20px;
											}
											a {
												color: #fff;
												background-color: #007bff;
												border-color: #007bff;
												border-radius: 4px;
												padding: 10px 20px;
												text-decoration: none;
												display: inline-block;
											}
											.container {
												max-width: 600px;
												margin: 0 auto;
												padding: 20px;
												border: 1px solid #ccc;
												border-radius: 5px;
												background-color: #f7f7f7;
											}
											.signature {
												margin-top: 30px;
												text-align: left;
											}
											.signature p {
												margin: 0;
											}
										</style>
									</head>
									<body>
										<div class="container">
											<h1>Passwort zurücksetzen</h1>
											<p>Sehr geehrte/r <strong>${user.lastname}</strong>,</p>
											<p> wir möchten Ihnen bestätigen, dass das Passwort für Ihr Konto erfolgreich geändert wurde.Falls Sie das Passwort nicht geändert haben, bitten wir Sie, uns umgehend zu kontaktieren. </p>
											<p> Wir empfehlen Ihnen, Ihr Passwort regelmäßig zu ändern, um Ihr Konto zu schützen. </p>
											<p> Wenn Sie weitere Fragen oder Bedenken haben, wenden Sie sich bitte an unser Admin-Team. Wir stehen Ihnen gerne zur Verfügung. </p>
											<p><a href="https://osz-teltow.de/home/kontakt/" class="btn">Contact Support</a></p>
											<div class="signature">
												<p>Mit freundlichen Grüßen,</p>
												<br>ihr OSZ-Teltow Filmarchiv Team</p>
											</div>
										</div>
										<p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
										<p>&copy; OSZ-Teltow. All rights reserved. </p>
									</body>
								</html>`
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
						msg: `Token konnte nicht gesetzt werden. ${isSetUserTokenOnDB}`,
						data: isTokenOnDB,
						code: 201,
					});
					return
				}
			} else {
				res.status(400).send({
					msg: "Kennwort konnte nicht geändert werden",
					code: 406,
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


router.get("/logout", function (req, res, next) {
	req.session.destroy();
	clearAllcookie(req, res);
	res.status(200).send({
		msg: "User logged out",
		code: 204,
	});
	next();
});

module.exports = router;
