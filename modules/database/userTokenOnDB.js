const db = require('../../database/index');
const checkUserTokenOnDB = async (token) => {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM users WHERE token = ?', [token], (error, results, fields) => {
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

const setUserTokenOnDB = async (token, email) => {
	return new Promise((resolve, reject) => {
		db.query('UPDATE users SET token = ? WHERE email = ?', [token, email], (error, results, fields) => {
			if (error) {
				resolve({ result: 1, err: error });
				return;
			}
			if (results.length === 0) {
				resolve({ result: 0 });
			} else {
				resolve({ result: 1 });
			}
		});
	});
};

module.exports = {
	checkUserTokenOnDB,
	setUserTokenOnDB,
};
