const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");

router.get("/get", (req, res) => { //https://localhost:40324/films/get?filmQuery={query}
    if (true) {

        console.log('im geting called')
        //when queryParam filmQuery is given (simple search)
        if (req.query.filmQuery !== undefined) {
            let filmQuery = `%${req.query.filmQuery}%`;
            let test =
                db.query('SELECT * FROM Film WHERE Filmtitel Like ? or Autor LIKE ? or Mitwirkende LIKE ? or Klasse like ? or Stichworte like ?', [filmQuery, filmQuery, filmQuery, filmQuery, filmQuery], function (err, result) {
                    if (err) throw err;
                    res.send(result);
                });
            console.log(test.sql);
        } else {
            db.query('SELECT * FROM Film', function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        }
    }
});

/* This is exporting the router object. */
module.exports = router;
