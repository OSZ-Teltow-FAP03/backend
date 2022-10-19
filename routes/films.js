const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");

router.get("/get", (req, res) => { //https://localhost:40324/films/get?filmQuery={query}
    if (req.session.user) {
        let queryString = `SELECT * FROM Film`;

        if (req.query.filmQuery !== undefined) {
            queryString = `SELECT * FROM Film WHERE Filmtitel Like '%${req.query.filmQuery}%' or Autor LIKE '%${req.query.filmQuery}%' or Mitwirkende LIKE '%${req.query.filmQuery}%' or Klasse like '%${req.query.filmQuery}%' or Stichworte like '%${req.query.filmQuery}%'`;
        }

        db.query(queryString, function (err, result) {
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
