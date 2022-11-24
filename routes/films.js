const express = require("express");
const { crossOriginResourcePolicy } = require("helmet");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");
const {
	encrypt,
	decrypt
} = require('../modules/crpyto');

router.get("/get", (req, res) => { //https://localhost:40324/films/get?filmQuery={query}
    if (req.session.user) {
            //when queryParam filmQuery is given (simple search)
        if (req.query.filmQuery !== undefined) {
            let filmQuery = `%${req.query.filmQuery}%`;
            db.query("SELECT * FROM Film WHERE Filmtitel Like ? or Autor LIKE ? or Mitwirkende LIKE ? or Klasse like ? or Stichworte like ?", [filmQuery, filmQuery, filmQuery, filmQuery, filmQuery], function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        } else {
            db.query('SELECT * FROM Film', function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        }
    }
    else {
        res.status(400).send("not logged in")
        return
    }
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
		res.status(400).send("Not logged in");
		return;
	}
	const FilmID=req.query.FilmID;
	if(!FilmID){
		res.status(400).send("FilmID not set");
		return;
	}
    db.query("SELECT ID, Dateipfad FROM FilmDateien WHERE FilmID = ?", [FilmID], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

/* This is a post request that is used to delete a film from db. */ 
/* test: https://localhost:40324/filmDelete/delete (json: {"filmID":"1"}) */
router.delete('/delete', (req, res) => {
	/* check if user is logged in */
	if(!req.session.user){
		res.status(400).send("Not logged in");
		return;
	}

	const filmID = decrypt(req.body.filmID);
	const prüfstück = decrypt(req.body.Prüfstück)
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
	if (!rights) return res.status(400).send("Not enough privileges"); 

	/* Trying to delete the film */	
	db.query('DELETE FROM Film WHERE ID = ?',[ filmID ],(error, response) => {
		if (error) {
			res.send({
				msg: error
			});
		} else {
			/* delete Filmdateien */
			db.query('DELETE FROM FilmDateien WHERE FilmID = ?',[ filmID ],(error2, response2) => {
				if (error2) {
					res.send({
						msg: error2
					});
				} else {
					res.send({
						/* Film got deleted */
						msg: 'Film successfully deleted',
						code: 200
					});
				}
			});
		}
	});		
})
/* It's a mess. */
router.post('/create', (req, res) => {
    if (!req.session.user) return res.status(400).send("Not logged in");
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
    if (!rights) return res.status(400).send("Not enough privileges");
    var attributes = ""
    var arrayOfValues=[];
    var vals=""
    Object.entries(req.body).forEach(entry => {
        const [key, value] = entry;
        arrayOfValues.push(value);
        attributes += key + ',';
        vals +=  '?,';
    });
    attributes = attributes.slice(0, -1);
    vals = vals.slice(0, -1);

    /* This is inserting the data into the database. */
    db.query(
    	'INSERT INTO Film ('+attributes+') VALUE ('+vals+')',
    	arrayOfValues,
    	(error, response) => {
    		if (error) {
    			res.send({
    				msg: error
    			});
    		} else {
    			res.send({
    				msg: 'Film inserted',
    				code: 201
    		    });
		    }
	    }
	);
});
/* This is exporting the router object. */
module.exports = router;
