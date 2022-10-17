const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");

router.get("/geheimeRouteBrudii", (req, res) => {
    //check the user fpr specifying which films can be shown
    //Werkstüke dürfen nur von dem Prüfungskomitteeee angesehen werden dürfen
    console.log(req.query);
    queryString = `SELECT * FROM Film`;
    if (req.query) {
        queryString = `SELECT * FROM Film WHERE LIKE %${req.query.stringsuche}%`;
    }
    if (true) {
        db.query(queryString, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }
});

/* This is exporting the router object. */
module.exports = router;
