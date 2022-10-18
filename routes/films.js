const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");

router.get("/get", (req, res) => {
    if (req.session.user) {
        console.log("Das ist in req.query drin");
        console.log(req.query);
        queryString = `SELECT * FROM Film`;

        if (req.query.filmQuery !== undefined) {
            queryString = `SELECT * FROM Film WHERE Filmtitel Like '%${req.query.stringsuche}%%' or Autor LIKE '%${req.query.stringsuche}%%' or Mitwirkende LIKE '%${req.query.stringsuche}%%' or Klasse like '%${req.query.stringsuche}%%' or Stichworte like '%${req.query.stringsuche}%%'`;
        }

        if (true) {
            db.query(queryString, function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        }
    }
});

/* This is exporting the router object. */
module.exports = router;
