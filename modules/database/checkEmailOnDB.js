const db = require("../../database/index");
const checkEmailOnDB = async (email) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
      if (error) throw reject(error);
      if (results.length === 0) {
        resolve(null);
      } else {
        resolve(results[0]);
      }
    });
  });
};


module.exports = checkEmailOnDB;
