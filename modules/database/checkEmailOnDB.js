const db = require('../../database/index');
const checkEmailOnDB = async (email) => {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
			if (error) {
				resolve({ result: 1, err: error });
				return;
			}
			if (results.length === 0) {
				resolve({ result: 0 });
			} else {
				resolve({ result: 2, data: results[0] });
			}
		});
	});
};

module.exports = checkEmailOnDB;
