const express = require("express");
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
	/* This is getting the data from the request body.*/
    const Filmtitel = decrypt(req.body.Filmtitel); //
    const Tonformat = decrypt(req.body.Tonformat);
    const Bildformat = decrypt(req.body.Bildformat);
    const Bildfrequenz = decrypt(req.body.Bildfrequenz);
    const Farbtiefe = decrypt(req.body.Farbtiefe);
    const Videocontainer = decrypt(req.body.Videocontainer);
    const Tonspurbelegung = decrypt(req.body.Tonspurbelegung);
    const TimecodeAnfang = decrypt(req.body.TimecodeAnfang);
    const TimecodeEnde = decrypt(req.body.TimecodeEnde);
    const Dauer = decrypt(req.body.Dauer);
    const Videocodec = decrypt(req.body.Videocodec);
    const Auflösung = decrypt(req.body.Auflösung);
    const Vorschaubild = decrypt(req.body.Vorschaubild);
    const Erscheinungsdatum = decrypt(req.body.Erscheinungsdatum);//
    const Autor = decrypt(req.body.Autor);
    const Programmtyp = decrypt(req.body.Programmtyp);//
    const Erzählsatz = decrypt(req.body.Erzählsatz);//
    const Bemerkung = decrypt(req.body.Bemerkung);
    const Erstellungsdatum = decrypt(req.body.Erstellungsdatum);//
    const Mitwirkende = decrypt(req.body.Mitwirkende);//
    const Bewertungen = decrypt(req.body.Bewertungen);
    const Upload = decrypt(req.body.Upload);//
    const Klasse = decrypt(req.body.Klasse);
    const Status = decrypt(req.body.Status);//
    const Lehrjahr = decrypt(req.body.Lehrjahr);//
    const Stichworte= decrypt(req.body.Stichworte);//

    /* This is checking if the password is at least 8 characters long. */
    if (Filmtitel == null)
    return res.status(400).send({
      msg: 'Filmtitel cannot be null.',
    });

    if (Erscheinungsdatum == null)
    return res.status(400).send({
      msg: 'Erscheinungsdatum cannot be null.',
    });

    if (Programmtyp == null)
    return res.status(400).send({
      msg: 'Programmtyp cannot be null.',
    });

    if (Erzählsatz == null)
    return res.status(400).send({
      msg: 'Erzählsatz cannot be null.',
    });

    if (Erstellungsdatum == null)
    return res.status(400).send({
      msg: 'Erstellungsdatum cannot be null.',
    });

    if (Mitwirkende == null)
    return res.status(400).send({
      msg: 'Mitwirkende cannot be null.',
    });

    if (Upload == null)
    return res.status(400).send({
      msg: 'Upload cannot be null.',
    });

    if (Status == null)
    return res.status(400).send({
      msg: 'Status cannot be null.',
    });

    if (Lehrjahr == null)
    return res.status(400).send({
      msg: 'Lehrjahr cannot be null.',
    });

    if (Stichworte == null)
    return res.status(400).send({
      msg: 'Stichworte cannot be null.',
    });

    /* This is inserting the data into the database. */
    db.query(
    	'INSERT INTO Film ( Filmtitel, Tonformat, Bildformat, Bildfrequenz, Farbtiefe, Videocontainer, Tonspurbelegung, Timecode_Anfang, Timecode_Ende, Dauer, Videocodec, Auflösung, Vorschaubild, Erscheinungsdatum, Autor, Programmtyp, Erzählsatz, Bemerkung, Erstellungsdatum, Mitwirkende, Bewertungen, Upload, Klasse, Status, Lehrjahr, Stichworte ) VALUE (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    	[ Filmtitel, Tonformat, Bildformat, Bildfrequenz, Farbtiefe, Videocontainer, Tonspurbelegung, TimecodeAnfang, TimecodeEnde, Dauer, Videocodec, Auflösung, Vorschaubild, Erscheinungsdatum, Autor, Programmtyp, Erzählsatz, Bemerkung, Erstellungsdatum, Mitwirkende, Bewertungen, Upload, Klasse, Status, Lehrjahr, Stichworte ],
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
