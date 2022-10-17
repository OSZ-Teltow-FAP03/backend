const db = require('../database/index');

const creatSessionOnDB = async (req) => {
	const userId = req.session.user.userID;
	const session_id = req.session_id;
	const ip_address = '1312312';
	const platform = req.useragent.platform;
	const browser_id = req.useragent.browser;
	/* Comparing the session on the database. */
	var t = await compareSessionOnDB(req);
	console.log(t);
	if (!t) {
		// console.log('userID: ' + userId, 'session_id: ' + session_id, 'ip_address: ' + ip_address, 'browser: ' + browser_id, 'platform: ' + platform);
		db.query('INSERT INTO session_users (userId, session_id, ip_address, browser_id, platform) VALUE (?,?,?,?,?)', [ userId, session_id, ip_address, browser_id, platform ], (error, response) => {
			if (error) return error;
			if (response.length > 0) return response;
		});
	}
	return null;
};

const getSessionOnDB = (userId) => {
	db.query('select * from session_users (userId) VALUE (?)', [ userId ], (error, response) => {
		if (error) return error;
		if (response.length > 0) return response;
	});
	return null;
};

const setSessionOnDB = (req) => {
	if (getSessionOnDB(req.session.userID)) return;
	const userId = req.session.user.userID;
	const session_id = req.sessionID;
	const ip_address = String(req.connection.remoteAddress);
	const platform = 127001;
	var data = JSON.parse(JSON.stringify(req.sessionStore.sessions));
	data = JSON.stringify(data);
	console.log('userID: ' + userId, 'session_id: ' + session_id, 'ip_address: ' + ip_address, 'platform: ' + platform, 'data: ' + data);
	if (getSessionOnDB(userId) < 0) return;
	db.query('UPDATE session_users (userId, session_id, ip_address, platform, data) VALUE (?,?,?,?,?)', [ userId, session_id, ip_address, platform, data ], (error, response) => {
		if (error) return error;
		if (response.length > 0) return response;
	});
	return null;
};

const compareSessionOnDB = (req, callback) => {
	const userId = req.session.user.userID;
	const ip_address = '1312312';
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
		if (response.length > 0) return response;
	});
	return null;
};

// return error ? reject(error) : resolve(response);

module.exports = {
	getSessionOnDB,
	setSessionOnDB,
	creatSessionOnDB,
	compareSessionOnDB,
	destroySessionOnDB,
};
