const db = require('../../database/index');
const changePassword = async (email, password) => {
	return new Promise((resolve, reject) => {
		db.query('UPDATE users SET password = ? WHERE email = ?', [password, email], (error, results, fields) => {
			if (error) {
				resolve({ result: 1, err: error });
				return;
			}
			if (results.length === 0) {
				resolve({ result: 0 });
			} else {
				resolve({ result: 2 });
			}
		});
	});
};

module.exports = changePassword;
