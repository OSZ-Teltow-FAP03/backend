const express = require("express");
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
