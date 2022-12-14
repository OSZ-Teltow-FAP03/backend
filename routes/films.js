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

module.exports = router;
