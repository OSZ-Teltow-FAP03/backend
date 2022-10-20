const {
	encrypt,
	decrypt
} = require('../module/crpyto');
const express = require('express');
const router = express.Router(); // Creating a router object.
const db = require('../database/index');

router.post('/create', (req, res) => {
	/* This is getting the data from the request body.*/
  const Filmtitel = decrypt(req.body.Filmtitel);
  const Tonformat = decrypt(req.body.Tonformat);
  const Bildformat = decrypt(req.body.Bildformat);
  const Bildfrequenz = decrypt(req.body.Bildfrequenz);
  const Farbtiefe = decrypt(req.body.Farbtiefe);
  const Videocontainer = decrypt(req.body.Videocontainer);
  const Tonspurbelegung = decrypt(req.body.Tonspurbelegung);
  const TimecodeAnfang = decrypt(req.body.TimecodeAnfang);
  const TimecodeEnde = decrypt(req.body.TimecodeEnde);
  const Dauer = decrypt(req.body.Dauer);
  const Videocodec = decrypt(req.body.Videocodec);
  const Auflösung = decrypt(req.body.Auflösung);
  const Vorschaubild = decrypt(req.body.Vorschaubild);
  const Erscheinungdsdatum = decrypt(req.body.Erscheinungdsdatum);
  const Autor = decrypt(req.body.Autor);
  const Programmtyp = decrypt(req.body.Programmtyp);
  const Erzählsatz = decrypt(req.body.Erzählsatz);
  const Bemerkung = decrypt(req.body.Bemerkung);
  const Erstellungsdatum = decrypt(req.body.Erstellungsdatum);
  const Mitwirkende = decrypt(req.body.Mitwirkende);
  const Bewertungen = decrypt(req.body.Bewertungen);
  const Upload = decrypt(req.body.Upload);
  const Klasse = decrypt(req.body.Klasse);
  const Status = decrypt(req.body.Status);
  const Lehrjahr = decrypt(req.body.Lehrjahr);
  const Stichworte= decrypt(req.body.Stichworte);
	
	/* This is inserting the data into the database. */
	let tets = db.query(
		'INSERT INTO Film ( Filmtitel, Tonformat, Bildformat, Bildfrequenz, Farbtiefe, Videocontainer, Tonspurbelegung, Timecode Anfang, Timecode Ende, Dauer, Videocodec, Auflösung, Vorschaubild, Erscheinungdsdatum, Autor, Programmtyp, Erzählsatz, Bemerkung, Erstellungsdatum, Mitwirkende, Bewertungen, Upload, Klasse, Status, Lehrjahr, Stichworte ) VALUE (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
		[ Filmtitel, Tonformat, Bildformat, Bildfrequenz, Farbtiefe, Videocontainer, Tonspurbelegung, TimecodeAnfang, TimecodeEnde, Dauer, Videocodec, Auflösung, Vorschaubild, Erscheinungdsdatum, Autor, Programmtyp, Erzählsatz, Bemerkung, Erstellungsdatum, Mitwirkende, Bewertungen, Upload, Klasse, Status, Lehrjahr, Stichworte ],
		(error, response) => {
			if (error) {
				res.send({
					msg: error
				});
			} else {
				res.send({
					msg: 'Film inserted',
					code: 201
				});
			}
      console.log('error :' + tets.sql);	
		}
	);		
});


/* This is exporting the router object. */
module.exports = router;