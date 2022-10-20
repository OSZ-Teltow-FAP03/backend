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

router.patch("/patch", (req, res) => { //https://localhost:40324/films/patch
    // if (req.session.user == "admin" || req.session.user == "prüfungskommission")
    if (true) {

        let test = decrypt(req.body);
        console.log(test)
        if (req.query.filmQuery !== undefined) {
            let filmQuery = `%${req.query.filmQuery}%`;
            db.query("SELECT * FROM Film WHERE Filmtitel Like ? or Autor LIKE ? or Mitwirkende LIKE ? or Klasse like ? or Stichworte like ?",
                [filmQuery, filmQuery, filmQuery, filmQuery, filmQuery], function (err, result) {
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


/* This is exporting the router object. */
module.exports = router;
