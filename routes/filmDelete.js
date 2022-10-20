const {
	encrypt,
	decrypt
} = require('../module/crpyto');
const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

/* This is a post request that is used to delete a film from db. */ 
/* test: https://localhost:40324/filmDelete/delete (json: {"filmID":"1"}) */
router.delete('/delete', (req, res) => {
	/* This is getting the data from the request body. */
	let filmID = decrypt(req.body.filmID);

	/* Trying to delete the film */	
	db.query('DELETE FROM Film WHERE ID = ?',[ filmID ],(error, response) => {
		/* delete Filmdateien */
		db.query('DELETE FROM FilmDateien WHERE FilmID = ?',[ filmID ],(error, response) => {
			if (error) {
				res.send({
					msg: error
				});
			} else {
				res.send({
					/* Film got deleted */
					msg: 'Film successfully deleted',
					code: 200
				});
			}
		});
	});		
})
/* This is exporting the router object. */
module.exports = router;