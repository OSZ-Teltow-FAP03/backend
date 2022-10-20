const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const fs = require('fs');
const path = require('path');

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
	console.log(req.query)
	const FileID=req.query.FileID;
	if(!FileID){
		res.status(400).send("FileID not set");
		return;
	}
	db.query('SELECT * FROM FilmDateien where FilmDateien.ID = ?', [FileID], function (err, result) {
		if (err) throw err;
		const filePath = result[0].Dateipfad;

		if(!checkFileExistsSync(filePath)){
			res.status(400).send("File not found");
			return;
		}

		const fileSize = fs.statSync(filePath).size;

		const fileExtension=path.extname(filePath);
		var contentType;
		console.log(fileExtension)
		console.log(filePath)
		switch (fileExtension) {
			case ".mp4":
				contentType="video/mp4";
				break;
			case ".mp3":
				contentType="audio/mpeg3";
				break;
			case ".wav":
				contentType="audio/wav";
				break;
		
			default:
				break;
		}

		if(!contentType){
			res.status(400).send("File not streamable");
			return;
		}

		const CHUNK_SIZE = 10 ** 6; // 1MB
		const start = Number(range.replace(/\D/g, ""));
		const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
		const contentLength = end - start + 1;
		const headers = {
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": contentLength,
			"Content-Type": contentType,
		};
		
		res.writeHead(206, headers);
		const videoStream = fs.createReadStream(filePath, { start, end });
		videoStream.pipe(res);
	});
});

router.get('/download', (req, res) => {
	if(!req.session.user){
		res.status(400).send("Not logged in");
		return;
	}
	const FileID=req.query.FileID;
	if(!FileID){
		res.status(400).send("FileID not set");
		return;
	}
	db.query('SELECT * FROM FilmDateien where FilmDateien.ID = ?', [FileID], function (err, result) {
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