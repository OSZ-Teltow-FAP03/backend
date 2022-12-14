const express = require("express");
const router = express.Router();
const db = require("../database/index");
const {
	encrypt,
	decrypt
} = require('../modules/crpyto');


router.get("/get", (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	const filmQuery = `%${req.query.filmQuery}%`;
	if (filmQuery !== undefined) {
		db.query("SELECT * FROM Film WHERE Filmtitel Like ? or Autor LIKE ? or Mitwirkende LIKE ? or Klasse like ? or Stichworte like ?", [filmQuery, filmQuery, filmQuery, filmQuery, filmQuery], function (err, result) {
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
	} else {
		db.query('SELECT * FROM Film', function (err, result) {
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
	}
});

router.get("/listFiles", (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}

	const FilmID=req.query.FilmID;
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 112
		});
		return;
	}

	db.query("SELECT ID FROM FilmDateien WHERE FilmID = ?", [FilmID], function (err, result) {
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

	const filmID = decrypt(req.body.filmID);
	
	db.query("SELECT Prüfstück FROM Film WHERE FilmID = ?", [filmID], function (err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		const prüfstück = result[0].Prüfstück;
		const rights = false;
		switch (req.session.user.role) {
			case "admin":
				rights = true;
				break;
			case "pruefer":
				if(prüfstück) rights = true;
				break;
			case "lehrerMedien":
				if(!prüfstück) rights = true;
				break;
			default:
				break;
		}

		if(!rights){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 113
			});
			return;
		}

		db.query('DELETE FROM Film WHERE ID = ?; DELETE FROM FilmDateien WHERE FilmID = ?;',[ filmID, filmID ],(err2, result2) => {
			if (err2){
				throw res.status(500).send({
					msg: err2,
					code: 402
				});
				return;
			}

			res.send({
				msg: 'Film deleted',
				code: 200
			});
		});
	});
});

router.put('/create', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}

	const Prüfstück = decrypt(req.body.Prüfstück)
	const rights = false;
	switch (req.session.user.role) {
		case "admin":
			rights = true;
			break;
		case "pruefer":
			if(Prüfstück) rights = true;
			break;
		case "lehrerMedien":
			if(!Prüfstück) rights = true;
			break;
		default:
			break;
	}

	if(!rights){
		res.status(400).send({
			msg: 'Missing privileges',
			code: 113
		});
		return;
	}

	var arrayOfAttributes=[];
	var arrayOfValues=[];
	var replace=""
	Object.entries(req.body).forEach(entry => {
		const [key, value] = entry;
		arrayOfAttributes.push(key);
		arrayOfValues.push(decrypt(value));
		replace +=  '?, ';
	});
	replace = attributes.slice(0, -1);

	db.query('INSERT INTO Film ('+replace+') VALUE ('+replace+')', arrayOfAttributes.concat(arrayOfValues), (err, result) => {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		res.send({
			msg: 'Film inserted',
			code: 207
		});
	});
});

module.exports = router;
