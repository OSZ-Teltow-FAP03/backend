const db = require('../database/index');

const creatSessionOnDB = async (req) => {
	const userId = req.session.user.userID;
	const session_id = req.session_id;
	const ip_address = req.useragent.ip_address || '127.0.0.1';
	const platform = req.useragent.platform;
	const browser_id = req.useragent.browser;
	/* Comparing the session on the database. */
	var t = await compareSessionOnDB(req);
	console.log(t);
	if (t) {
		return setSessionOnDB(req);
	}
	console.log('userID: ' + userId, 'session_id: ' + session_id, 'ip_address: ' + ip_address, 'browser: ' + browser_id, 'platform: ' + platform);
	db.query('INSERT INTO session_users (userId, session_id, ip_address, browser_id, platform) VALUE (?,?,?,?,?)', [ userId, session_id, ip_address, browser_id, platform ], (error) => {
		console.log('err: ' + error);
		if (error) return error;
	});
};

const getSessionOnDBByUserId = (userId) => {
	db.query('select * from session_users (userId) VALUE (?)', [ userId ], (error, response) => {
		if (error) return error;
		if (response.length > 0) return response;
	});
};

const setSessionOnDB = (req) => {
	// if (getSessionOnDB(req.session.userID)) return;
	const userId = req.session.user.userID;
	const session_id = req.session_id;
	const ip_address = req.useragent.ip_address || '127.0.0.1';
	const browser_id = req.useragent.browser;
	const platform = req.useragent.platform;
	// if (getSessionOnDB(userId) < 0) return;
	db.query('UPDATE session_users SET userId = ? AND ip_address = ? AND browser_id = ? AND platform = ? WHERE userId = ?  ', [ userId, session_id, ip_address, browser_id, platform ], (error) => {
		console.log('err: ' + error);
		if (error) return error;
	});
};

const compareSessionOnDB = (req, callback) => {
	const userId = req.session.user.userID;
	const ip_address = req.useragent.ip_address || '127.0.0.1';
	const platform = req.useragent.platform;
	const browser_id = req.useragent.browser;
	console.log('userID: ' + userId, 'ip_address: ' + ip_address, 'browser: ' + browser_id, 'platform: ' + platform, 'compareSessionOnDB: ');
	return new Promise((resolve, reject) => {
		db.query('select * from session_users WHERE userId = ? AND ip_address = ? AND browser_id = ? AND platform = ?', [ userId, ip_address, browser_id, platform ], (error, response) => {
			if (error) return reject(error);
			if (response.length > 0) {
				return resolve(true);
			}
			return resolve(false);
		});
	});
};

const destroySessionOnDB = (userId) => {
	console.log(userId);
	db.query('DELETE FROM session_users WHERE userId = ?', [ userId ], (error, response) => {
		if (error) return error;
	});
};

// return error ? reject(error) : resolve(response);

module.exports = {
	creatSessionOnDB,
	setSessionOnDB,
	getSessionOnDBByUserId,
	compareSessionOnDB,
	destroySessionOnDB,
};
