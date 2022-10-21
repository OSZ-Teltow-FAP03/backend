const express = require("express");
const router = express.Router(); // Creating a router object.
const db = require("../database/index");
const {
    encrypt,
    decrypt
} = require('../module/crpyto');

router.get("/get", (req, res) => { //https://localhost:40324/films/get?filmQuery={query}
    if (req.session.user) {

        //when queryParam filmQuery is given (simple search)
        if (req.query.filmQuery !== undefined) {
            let filmQuery = `%${req.query.filmQuery}%`;
            db.query("SELECT * FROM Film WHERE Filmtitel Like ? or Autor LIKE ? or Mitwirkende LIKE ? or Klasse like ? or Stichworte like ?", [filmQuery, filmQuery, filmQuery, filmQuery, filmQuery], function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        } else {
            db.query('SELECT * FROM Film', function (err, result) {
                if (err) throw err;
                res.send(result);
            });
        }
    }
    else {
        res.status(400).send("not logged in")
        return
    }
});

router.patch("/patch", (req, res) => { //https://localhost:40324/films/patch
    // if (req.session.user == "admin" || req.session.user == "prüfungskommission")
    if (true) {
        console.log('1')
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
        const Stichworte = decrypt(req.body.Stichworte);
        const FilmId = decrypt(req.body.FilmId);

        console.log('2');

        let arrayOfValues = []
        let isUpdate = false;

        console.log('3');

        let updateQuery = 'UPDATE Film SET';
        console.log('4');
        if (Filmtitel != null) {
            arrayOfValues.push(Filmtitel);
            updateQuery += 'Filmtitel = ?,';
            isUpdate = true;
            console.log('5');
        }
        if (Tonformat != null) {
            arrayOfValues.push();
            updateQuery += 'Tonformat = ?,';
            isUpdate = true;
        }
        if (Bildformat != null) {
            arrayOfValues.push(Bildformat);
            updateQuery += 'Bildformat = ?,';
            isUpdate = true;
        }
        if (Bildfrequenz != null) {
            arrayOfValues.push(Bildfrequenz);
            updateQuery += 'Bildfrequenz = ?,';
            isUpdate = true;
        }
        if (Farbtiefe != null) {
            arrayOfValues.push(Farbtiefe);
            updateQuery += 'Farbtiefe = ?,';
            isUpdate = true;
        }
        if (Videocontainer != null) {
            arrayOfValues.push(Videocontainer);
            updateQuery += 'Videocontainer = ?,';
            isUpdate = true;
        }
        if (Tonspurbelegung != null) {
            arrayOfValues.push(Tonspurbelegung);
            updateQuery += 'Tonspurbelegung = ?,';
            isUpdate = true;
        }
        if (TimecodeAnfang != null) {
            arrayOfValues.push(TimecodeAnfang);
            updateQuery += 'TimecodeAnfang = ?,';
            isUpdate = true;
        }
        if (TimecodeEnde != null) {
            arrayOfValues.push(TimecodeEnde);
            updateQuery += 'TimecodeEnde = ?,';
            isUpdate = true;
        }
        if (Dauer != null) {
            arrayOfValues.push(Dauer);
            updateQuery += 'Dauer = ?,';
            isUpdate = true;
        }
        if (Videocodec != null) {
            arrayOfValues.push(Videocodec);
            updateQuery += 'Videocodec = ?,';
            isUpdate = true;
        }
        if (Auflösung != null) {
            arrayOfValues.push(Auflösung);
            updateQuery += 'Auflösung = ?,';
            isUpdate = true;
        }
        if (Vorschaubild != null) {
            arrayOfValues.push(Vorschaubild);
            updateQuery += 'Vorschaubild = ?,';
            isUpdate = true;
        }
        if (Erscheinungsdatum != null) {
            arrayOfValues.push(Erscheinungsdatum);
            updateQuery += 'Erscheinungsdatum = ?,';
            isUpdate = true;
        }
        if (Autor != null) {
            arrayOfValues.push(Autor);
            updateQuery += 'Autor = ?,';
            isUpdate = true;
        }
        if (Programmtyp != null) {
            arrayOfValues.push(Programmtyp);
            updateQuery += 'Programmtyp = ?,';
            isUpdate = true;
            console.log("9")
        }
        if (Erzählsatz != null) {
            arrayOfValues.push(Erzählsatz);
            updateQuery += 'Erzählsatz = ?,';
            isUpdate = true;
        }
        if (Bemerkung != null) {
            arrayOfValues.push(Bemerkung);
            updateQuery += 'Bemerkung = ?,';
            isUpdate = true;
        }
        if (Erstellungsdatum != null) {
            arrayOfValues.push(Erstellungsdatum);
            updateQuery += 'Erstellungsdatum = ?,';
            isUpdate = true;
        }
        if (Mitwirkende != null) {
            arrayOfValues.push(Mitwirkende);
            updateQuery += 'Mitwirkende = ?,';
            isUpdate = true;
            
        }
        if (Bewertungen != null) {
            arrayOfValues.push(Bewertungen);
            updateQuery += 'Bewertungen = ?,';
            isUpdate = true;
        }
        if (Upload != null) {
            arrayOfValues.push(Upload);
            updateQuery += 'Upload = ?,';
            isUpdate = true;
        }
        if (Klasse != null) {
            arrayOfValues.push(Klasse);
            updateQuery += 'Klasse = ?,';
            isUpdate = true;
        }
        if (Status != null) {
            arrayOfValues.push(Status);
            updateQuery += 'Status = ?,';
            isUpdate = true;
        }
        if (Lehrjahr != null) {
            arrayOfValues.push(Lehrjahr);
            updateQuery += 'Lehrjahr = ?,';
            isUpdate = true;
        }
        if (Stichworte != null) {
            arrayOfValues.push(Stichworte);
            updateQuery += 'Stichworte = ?,';
            isUpdate = true;
            console.log('5,1');
        }

        console.log('5.2');

        if (!isUpdate) {
            res.status(400).send('Nothing to update.');
            return;
        }

        console.log('3');

        //Removes last character from string => removes the comma
        updateQuery.slice(0, -1);

        console.log('3');

        if (FilmId = null) {
            res.status(400).send('FilmId is null');
            return;
        }

        //ID hinzufügen zur Query für das Update
        arrayOfValues.push(FilmId);
        updateQuery += ' WHERE Film.ID = ?'

        db.query(updateQuery, arrayOfValues, function (err, result) {
            if (err) throw err;
            res.send(result);
        });

        console.log(updateQuery);
        console.log(arrayOfValues);
    }
    else {
        res.status(400).send("not logged in")
        return;
    }
});




/* This is exporting the router object. */
module.exports = router;
