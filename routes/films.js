const express = require("express");
const { crossOriginResourcePolicy } = require("helmet");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");
const {
    encrypt,
    decrypt
} = require('../module/crpyto');

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
    if (req.session.user == "admin" || req.session.user == "lehrer"|| req.session.user == "pruefer" || true){

        const FilmId = decrypt(req.body.ID);
        const prüfstück = null;
        db.query("SELECT Prüfstück FROM Film WHERE ID = ?",[FilmId], function (err, result) {
            if (err) throw err;
            prüfstück = result;
            console.log(prüfstück);
        });

        if (condition) {
            
        }

        let arrayOfValues = []
        let updateQuery = 'UPDATE Film SET ';
        
        //iterating over req body to dynamically enter attribute names to sql query
        Object.entries(req.body).forEach(entry => {
            const [key, value] = entry;
            arrayOfValues.push(value);
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
/* This is exporting the router object. */
module.exports = router;
