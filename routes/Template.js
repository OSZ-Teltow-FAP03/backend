const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

router.get('/get', (req, res) => {
	//LoggedIn Check
	if(req.session.user){
		db.query('SELECT * FROM Film', function (err, result) {
			if (err) throw err;
				res.send(result)
		});
	}
});

/* This is exporting the router object. */
module.exports = router;
