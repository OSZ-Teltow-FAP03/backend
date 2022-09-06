const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;


var db = mysql.createConnection({
  host: '127.0.0.1',
  user: "root",
  password: "Tolasm99",
  port: "3306",
  database: "tf",
});

db.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});

app.use(express.json());
app.use(cors());

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length == 0) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        //console.log(password, hash);
        db.query(
          "INSERT INTO users (email, password) VALUE (?,?)",
          [email, hash],
          (error, response) => {
            if (err) {
              res.send(err);
            }
            res.send({ msg: "User successfully registered" });
          }
        );
      });
    } else {
      res.send({ msg: "Email already registered" });
    }
  });
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        if (error) {
          res.send(error);
        }
        if (response == true) {
          res.send(response)
        
          
        } else {
          res.send({ msg: "Email or password incorrect" });
        }
      });
    } else {
      res.send({ msg: "Not registered user!" });
    }
  });
});

app.listen(3001, () => {
  console.log("running in the 3001");
});
