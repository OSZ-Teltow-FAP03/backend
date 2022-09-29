const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

router.get('/get', (req, res) => {
	db.query('SELECT * FROM Film', function (err, result) {
		if (err) throw err;
			console.log(result);
			res.send(result)
	});
	//res.send(res);
	// console.log(req.sessionStore.sessions);
	// console.log(req);
});

/* This is exporting the router object. */
module.exports = router;