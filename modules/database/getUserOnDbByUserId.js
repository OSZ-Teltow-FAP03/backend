const db = require("../../database/index");
const getUserOnDbByUserId = async (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE userID = ?', [userId], (error, results, fields) => {
      if (error) throw reject(error);
      if (results.length === 0) {
        resolve(null);
      } else {
        resolve(results[0]);
      }
    });
  });
};


module.exports = getUserOnDbByUserId;
