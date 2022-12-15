const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');
const fs = require('fs');
const path = require('path');
const { checkPrivileges } = require('../modules/check_privileges');


function checkFileExistsSync(filepath){
	let flag = true;
	try{
	  fs.accessSync(filepath, fs.constants.F_OK);
	}catch(e){
	  flag = false;
	}
	return flag;
}

router.get('/stream', function(req, res) {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	const range = req.headers.range;
	if (!range) {
		res.status(416).send({
			msg: 'Requires Range header',
			code: 116
		});
		return;
	}

	const FileID=req.query.FileID;
	if(!FileID){
		res.status(400).send({
			msg: 'FileID not set',
			code: 113
		});
		return;
	}

	db.query('SELECT Prüfstück, Dateipfad FROM FilmDateien, Film WHERE FilmDateien.ID = ? AND Film.ID = FilmDateien.FilmID', [FileID], function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		if(result.length!==1){
			res.status(400).send({
				msg: 'File not found',
				code: 114
			});
			return;
		}

		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
			});
			return;
		}

		const filePath = result[0].Dateipfad;
		if(!checkFileExistsSync(filePath)){
			res.status(400).send({
				msg: 'File not found',
				code: 114
			});
			return;
		}

		const fileSize = fs.statSync(filePath).size;
		const fileExtension=path.extname(filePath);
		var contentType;
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
			res.status(400).send({
				msg: 'File not streamable',
				code: 115
			});
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

router.get('/download', function(req, res) {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	const FileID=req.query.FileID;
	if(!FileID){
		res.status(400).send({
			msg: 'FileID not set',
			code: 113
		});
		return;
	}

	db.query('SELECT Prüfstück, Dateipfad FROM FilmDateien, Film WHERE FilmDateien.ID = ? AND Film.ID = FilmDateien.FilmID', [FileID], function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		if(result.length!==1){
			res.status(400).send({
				msg: 'File not found',
				code: 114
			});
			return;
		}

		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
			});
			return;
		}

		const videoPath = result[0].Dateipfad;
		if(!checkFileExistsSync(videoPath)){
			res.status(400).send({
				msg: 'File not found',
				code: 114
			});
			return;
		}
		
		res.download(videoPath);
	});
});

router.post('/upload', async (req, res) => {
	if(!req.session.user){
		res.status(400).send({
			msg: 'Not logged in',
			code: 102
		});
		return;
	}

	if(!req.files) {
		res.status(400).send({
			msg: 'File not found',
			code: 114
		});
		return;
	}

	const FilmID=decrypt(req.body.FilmID);
	if(!FilmID){
		res.status(400).send({
			msg: 'FilmID not set',
			code: 111
		});
		return;
	}

	db.query('SELECT Prüfstück FROM Film WHERE Film.ID = ?', [FilmID], function(err, result) {
		if (err){
			console.error(err);
			res.status(500).send({
				msg: err,
				code: 402
			});
			return;
		}

		if(result.length!==1){
			res.status(400).send({
				msg: 'Film not found',
				code: 112
			});
			return;
		}

		if(!checkPrivileges(req.baseUrl+req.path, req.session.user.role, result[0].Prüfstück)){
			res.status(400).send({
				msg: 'Missing privileges',
				code: 103
			});
			return;
		}
		
		var file = req.files.File;
		var path='./uploads/' + file.name
		file.mv(path);

		db.query('INSERT INTO FilmDateien (FilmID, Dateipfad) VALUES (?, ?)', [FilmID, path], function(err2, result2) {
			if (err2){
				console.error(err2);
				res.status(500).send({
					msg: err2,
					code: 402
				});
				return;
			}
			res.status(200).send({
				msg: 'File uploaded',
				code: 210,
				data: {
					name: file.name,
					mimetype: file.mimetype,
					size: file.size
				}
			});
		});
	});
});

module.exports = router;
