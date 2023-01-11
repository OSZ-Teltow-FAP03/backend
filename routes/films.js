const express = require("express");
const router = express.Router();
const db = require("../database/index");
const { decrypt } = require('../modules/crpyto');
const { checkPrivileges } = require('../modules/check_privileges');
const fs = require('fs');


router.get("/get", (req, res) => {
	console.log(req.session)
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

router.patch("/patch", (req, res) => {//https://localhost:40324/films/patch
    /*{
    "ID": "9",
    "Filmtitel": "Filmtitel",
    "Tonformat": "Tonformat",
    "Bildformat": "Bild",
    "Bildfrequenz": "60hz",
    "Farbtiefe": "Farbtiefe",
    "Videocontainer": "Videocontainer",
    "Tonspurbelegung": "A8",
    "Timecode_Anfang": "00:00:00",
    "Timecode_Ende": "00:00:00",
    "Dauer": "00:00:00",
    "Videocodec": "Videocodec",
    "Auflösung": "Auflösung",
    "Vorschaubild": "Vorschaubild",
    "Erscheinungsdatum": "1999-02-15",
    "Autor": "Autor",
    "Programmtyp": "Programmtyp",
    "Erzählsatz": "Erzählsatz",
    "Bemerkung": "Bemerkung",
    "Erstellungsdatum": "1999-02-15",
    "Mitwirkende": "Mitwirkende",
    "Bewertungen": "Bewertungen",
    "Upload": "1999-02-15",
    "Klasse": "Klasse",
    "Status": "Status",
    "Lehrjahr": "1999999",
    "Stichworte": "Stichworte"
}*/
    if (req.session.user == "admin" || req.session.user == "lehrer"|| req.session.user == "pruefer"){

        const FilmId = decrypt(req.body.ID);
        //console.log(FilmId);
        db.query("SELECT Prüfstück FROM Film WHERE ID = " + FilmId, function (err, result) {
            if (err) console.log(err);
            const prüfstück = result[0].Prüfstück;
            //console.log(prüfstück);

            var prüfstückBody = (decrypt(req.body.Prüfstück))

            //prüfstückänderung nicht zulassen wenn user nicht admin
            if(prüfstückBody != null && req.session.user != "admin") {
                prüfstückBody = prüfstück
            }
             
            if((prüfstück == 0 && (req.session.user == "admin" || req.session.user == "lehrer"))
                || (prüfstück == 1 && (req.session.user == "admin" || req.session.user == "pruefer"))) {
                
                let arrayOfValues = []
                let updateQuery = 'UPDATE Film SET ';
                
                //iterating over req body to dynamically enter attribute names to sql query
                Object.entries(req.body).forEach(entry => {
                    const [key, value] = entry;
                    if (key != "Prüfstück") {
                        arrayOfValues.push(decrypt(value));
                    }
                    else{
                        arrayOfValues.push(prüfstückBody)
                    }
                    updateQuery += key + ' = ?,';
                    //console.log(key, value);
                });
        
                //When no param is recognised in body then nothing is changed
                if (arrayOfValues.length == 0) {
                    res.status(400).send('Nothing to update.');
                    return;
                }
        
                //Removes last character from string => removes the comma
                updateQuery = updateQuery.slice(0, -1);
        
                if (FilmId == null) {
                    res.status(400).send('FilmId is null.');
                    return;
                }
        
                //adds the Id to the query
                arrayOfValues.push(FilmId);
                updateQuery += ' WHERE Film.ID = ?'
        
                db.query(updateQuery, arrayOfValues, function (err, result) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
        
                    res.send(result);
                });
            }
            else{
                res.status(403).send("Not enough rights")
                return;
            }
        });

        
    }
    else {
        res.status(400).send("not logged in")
        return;
    }
});

router.get("/listFiles", (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	const FilmID=req.query.FilmID;
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 111
		});
		return;
	}

	db.query("SELECT ID, Prüfstück FROM FilmDateien, Film WHERE Film.ID = ? AND Film.ID = FilmDateien.FilmID", [FilmID], function (err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}
		
		if(result.length>0 && !checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
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

	const filmID = decrypt(req.body.FilmID);
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 111
		});
		return;
	}
	
	db.query("SELECT Prüfstück FROM Film WHERE FilmID = ?", [filmID], function (err, result) {
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
				msg: 'Film not found',
				code: 112
			});
			return;
		}
		
		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
			});
			return;
		}

		db.query('DELETE FROM Film WHERE ID = ?; DELETE FROM FilmDateien WHERE FilmID = ?;',[ filmID, filmID ],(err2, result2) => {
			if (err2){
				console.error(err2);
				res.status(500).send({
					msg: err2,
					code: 402
				});
				return;
			}
			let rootFolder=process.env.filePath;
			if(rootFolder.slice(-1)!=="/")
				rootFolder+="/";
			let path=rootFolder + `${filmID}`

			fs.rmSync(path, { recursive: true, force: true })
			
			res.status(200).send({
				msg: 'Film deleted',
				code: 209
			});
		});
	});
});

router.put('/create', (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	const Prüfstück = decrypt(req.body.Prüfstück)=="true";
	if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, Prüfstück)){
		res.status(400).send({
			msg: 'Missing privileges',
			code: 103
		});
		return;
	}

	let arrayOfAttributes=[];
	let arrayOfValues=[];
	let replace=""
	Object.entries(req.body).forEach(entry => {
		const [key, value] = entry;
		arrayOfAttributes.push(key);
		arrayOfValues.push(decrypt(value));
		replace +=  '?, ';
	});
	replace = attributes.slice(0, -1);

	db.query('INSERT INTO Film ('+replace+') VALUE ('+replace+')', arrayOfAttributes.concat(arrayOfValues), (err, result) => {
		if (err){
			console.error(err);
			res.status(500).send({
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
			code: 102
		});
		return;
	}
	const FilmId = decrypt(req.body.ID);
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 111
		});
		return;
	}
	db.query("SELECT Prüfstück FROM Film WHERE ID = ?", [FilmId], function (err, result) {
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
				msg: 'Film not found',
				code: 112
			});
			return;
		}
		
		const prüfstück = result[0].Prüfstück;
		let prüfstückBody = decrypt(req.body.Prüfstück);
		
		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
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
			res.status(200).send({
				msg: 'Film updated',
				code: 208
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
				console.error(err);
				res.status(500).send({
					msg: err,
					code: 402
				});
				return;
			}

			res.status(200).send({
				msg: 'Film updated',
				code: 208
			});
		});
	});
});

module.exports = router;
