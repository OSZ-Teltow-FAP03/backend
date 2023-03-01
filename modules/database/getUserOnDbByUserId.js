const db = require('../../database/index');
const getUserOnDbByUserId = async (userId) => {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM users WHERE userID = ?', [userId], (error, results, fields) => {
			if (error) {
				resolve({ result: 1, err: error });
				return;
			}
			if (results.length === 0) {
				resolve({ result: 0 });
			} else {
				resolve({ result: 1, data: results[0] });
			}
		});
	});
};

module.exports = getUserOnDbByUserId;
