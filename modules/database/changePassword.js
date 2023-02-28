const db = require("../../database/index");
const changePassword = async (email, password) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE users SET password = ? WHERE email = ?', [password, email], (error, results, fields) => {
      if (error) reject(error);
      if (results.length === 0) {
        resolve(null);
      } else {
        resolve(results[0]);
      }
    });
  });
};


module.exports = changePassword;
