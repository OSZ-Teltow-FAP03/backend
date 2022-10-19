const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const fs = require('fs');

function checkFileExistsSync(filepath){
	let flag = true;
	try{
	  fs.accessSync(filepath, fs.constants.F_OK);
	}catch(e){
	  flag = false;
	}
	return flag;
}

router.get('/stream', (req, res) => {
	if(!req.session.user){
		res.status(400).send("Not logged in");
		return;
	}
	const range = req.headers.range;
	if (!range) {
		res.status(400).send("Requires Range header");
		return;
	}
	const FilmID=req.query.ID;
	if(!FilmID){
		res.status(400).send("ID not set");
		return;
	}
	db.query('SELECT * FROM FilmDateien where FilmDateien.FilmID = ?', [FilmID], function (err, result) {
		if (err) throw err;
		const videoPath = result[0].Dateipfad;

		if(!checkFileExistsSync(videoPath)){
			res.status(400).send("File not found");
			return;
		}

		const videoSize = fs.statSync(videoPath).size;

		const CHUNK_SIZE = 10 ** 6; // 1MB
		const start = Number(range.replace(/\D/g, ""));
		const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
		const contentLength = end - start + 1;
		const headers = {
			"Content-Range": `bytes ${start}-${end}/${videoSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": contentLength,
			"Content-Type": "video/mp4",
		};
		res.writeHead(206, headers);
		const videoStream = fs.createReadStream(videoPath, { start, end });
		videoStream.pipe(res);
	});
});

router.get('/download', (req, res) => {
	if(!req.session.user){
		res.status(400).send("Not logged in");
		return;
	}
	const FilmID=req.query.ID;
	if(!FilmID){
		res.status(400).send("ID not set");
		return;
	}
	db.query('SELECT * FROM FilmDateien where FilmDateien.FilmID = ?', [FilmID], function (err, result) {
		if (err) throw err;
		const videoPath = result[0].Dateipfad;

		if(!checkFileExistsSync(videoPath)){
			res.status(400).send("File not found");
			return;
		}

		res.download(videoPath);
	});
});

/* This is exporting the router object. */
module.exports = router;