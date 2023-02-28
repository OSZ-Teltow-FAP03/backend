const db = require("../../database/index");
const checkUserTokenOnDB = async (token) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE token = ?', [token], (error, results, fields) => {
      if (error) throw reject(error);
      if (results.length === 0) {
        resolve(false);
      } else {
        resolve(results[0]);
      }
    });
  });
};

const setUserTokenOnDB = async (token, email) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET token = ? WHERE email = ?', [token, email], (error, results, fields) => {
      if (error) reject(error);
      if (results.length === 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

module.exports = {
  checkUserTokenOnDB,
  setUserTokenOnDB
};
