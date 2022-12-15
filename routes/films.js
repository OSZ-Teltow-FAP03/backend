const express = require("express");
const router = express.Router();
const db = require("../database/index");
const {
	encrypt,
	decrypt
} = require('../modules/crpyto');
const { checkPrivileges } = require('../modules/check_privileges');


router.get("/get", (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	let prüfstück=false;
	if(["admin", "pruefer"].indexOf(req.session.user.role)!==-1){
		prüfstück=true;
	}
	let filmQuery="";
	if(req.query.filmQuery!==undefined && req.query.filmQuery.length>0)
		filmQuery = `%${req.query.filmQuery}%`;
	
	let queryString="SELECT * FROM Film";
	if(!prüfstück || filmQuery.length>0)
		queryString+=" WHERE ";
	if(!prüfstück)
		queryString+="Prüfstück = 0";
	if(!prüfstück && filmQuery.length>0)
		queryString+=" AND ";
	if(filmQuery.length>0)
		queryString+="(Filmtitel Like ? or Autor LIKE ? or Mitwirkende LIKE ? or Klasse like ? or Stichworte like ?)"
	db.query(queryString, (filmQuery.length>0)?[filmQuery, filmQuery, filmQuery, filmQuery, filmQuery]:[], function (err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		res.status(200).send({
			msg: "Data sent",
			code: 204,
			data: result
		});
	});
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

	db.query("SELECT ID, Prüfstück FROM FilmDateien, Film WHERE Film.ID = ? AND Film.ID = FilmDateien.FilmID", [FilmID], function (err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		
		if(result.length>0 && !checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 113
			});
			return;
		}

		res.status(200).send({
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

	const filmID = decrypt(req.body.FilmID);
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 112
		});
		return;
	}
	
	db.query("SELECT Prüfstück FROM Film WHERE FilmID = ?", [filmID], function (err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		if(result.length!==1){
			res.status(400).send({
				msg: 'Film not found',
				code: 116
			});
			return;
		}
		
		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
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
			
			res.status(200).send({
				msg: 'Film deleted',
				code: 210
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

	const Prüfstück = decrypt(req.body.Prüfstück)=="true";
	if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, Prüfstück)){
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

		res.status(200).send({
			msg: 'Film inserted',
			code: 207
		});
	});
});

router.patch("/update", (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 107
		});
		return;
	}
	const FilmId = decrypt(req.body.ID);
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 112
		});
		return;
	}
	db.query("SELECT Prüfstück FROM Film WHERE ID = ?", [FilmId], function (err, result) {
		if (err){
			throw res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		if(result.length!==1){
			res.status(400).send({
				msg: 'Film not found',
				code: 116
			});
			return;
		}
		
		const prüfstück = result[0].Prüfstück;
		let prüfstückBody = decrypt(req.body.Prüfstück);
		
		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 113
			});
			return;
		}

		//prüfstückänderung nicht zulassen wenn user nicht admin
		if(req.session.user.role != "admin") {
			prüfstückBody = prüfstück
		}

		let arrayOfValues = [];
		let updateQuery = 'UPDATE Film SET ';

		//iterating over req body to dynamically enter attribute names to sql query
		Object.entries(req.body).forEach(entry => {
			const [key, value] = entry;
			if (key != "Prüfstück") {
				arrayOfValues.push(decrypt(value));
			} else{
				arrayOfValues.push(prüfstückBody)
			}
			updateQuery += key + ' = ?,';
		});

		//When no param is recognised in body then nothing is changed
		if (arrayOfValues.length == 0) {
			res.status(400).send({
				msg: 'Nothing to change',
				code: 115
			});
			return;
		}

		//Removes last character from string => removes the comma
		updateQuery = updateQuery.slice(0, -1);

		//adds the Id to the query
		arrayOfValues.push(FilmId);
		updateQuery += ' WHERE Film.ID = ?'

		db.query(updateQuery, arrayOfValues, function (err, result) {
			if (err){
				throw res.status(500).send({
					msg: err,
					code: 402
				});
				return;
			}

			res.status(200).send({
				msg: 'Film updated',
				code: 209
			});
		});
	});
});

module.exports = router;
