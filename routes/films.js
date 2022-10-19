const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");

router.get("/get", (req, res) => { //https://localhost:40324/films/get?filmQuery={query}
    if (req.session.user) {

        //when queryParam filmQuery is given (simple search)
        if (req.query.filmQuery !== undefined) {
            db.query(`SELECT * FROM Film WHERE Filmtitel Like '%$?%' or Autor LIKE '%$?%' or Mitwirkende LIKE '%$?%' or Klasse like '%$?%' or Stichworte like '%?%'`, [filmQuery], function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        }

        db.query('SELECT * FROM Film', function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }
    else
    {
        res.status(400).send("not logged in")
        return
    }
});

/* This is exporting the router object. */
module.exports = router;
