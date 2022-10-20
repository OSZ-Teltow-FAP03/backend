const db = require('../database/index');
const { getSessionIDCookie } = require('./cookie');
const creatSessionOnDB = async (req) => {
	const userId = req.session.user.userID;
	const session_id = req.session.user.session_id;
	if (session_id == null){ session_id = getSessionIDCookie(req)}
	const ip_address = req.useragent.ip_address || '127.0.0.1';
	const platform = req.useragent.platform;
	const browser_name = req.useragent.browser;
	const browser_version = req.useragent.version;
	/* Comparing the session on the database. */
	if (await compareSessionOnDB(req)) return setSessionOnDB(req);
	db.query('INSERT INTO session_users (userId, session_id, ip_address, browser_name, browser_version, platform) VALUE (?,?,?,?,?,?)', [userId, session_id, ip_address, browser_name, browser_version, platform], (error) => {
		if (error)  console.log(error);
	});
};

const getSessionOnDBByUserId = (userId) => {
	return new Promise((resolve, reject) => {
		db.query('select * from session_users (userId) VALUE (?)', [userId], (error, response) => {
			if (error) reject(error);
			if (response.length > 0) return resolve(response);
		});
	});
};

const setSessionOnDB = (req) => {
	const userId = req.session.user.userID;
	const session_id = req.session.user.session_id;
	const platform = req.useragent.platform;
	const browser_name = req.useragent.browser;
	const browser_version = req.useragent.version;
	db.query('UPDATE session_users SET session_id = ? WHERE userID = ? AND platform = ? AND browser_name = ? AND browser_version = ?', [session_id, userId, platform, browser_name, browser_version ], (error) => {
		if (error) console.log(error);
	});
};

const compareSessionOnDB = (req) => {
	const userId = req.session.user.userID;
	const ip_address = req.useragent.ip_address || '127.0.0.1';
	const platform = req.useragent.platform;
	const browser_name = req.useragent.browser;
	const browser_version = req.useragent.version;
	return new Promise((resolve, reject) => {
		db.query('select * from session_users WHERE userId = ? AND ip_address = ? AND browser_name = ? AND browser_version = ? AND platform = ?', [userId, ip_address, browser_name, browser_version, platform], (error, response) => {
			if (error) reject(error);
			if (response.length > 0) {
				return resolve(true);
			}
			return resolve(false);
		});
	});
};

const destroySessionOnDB_BySessionID = (session_id) => {
	console.log('Session ID: ' + session_id);
	db.query('DELETE FROM session_users WHERE session_id = ?', [session_id], (error, response) => {
		if (error)  error;
	});
};
const destroyAllSessionOnDBByUserId = (userId) => {
	db.query('DELETE FROM session_users WHERE userId = ?', [userId], (error, response) => {
		if (error)  error;
	});
};


// return error ? reject(error) : resolve(response);
// console.log('userID: ' + userId, 'ip_address: ' + ip_address, 'browser: ' + browser_name, 'platform: ' + platform, 'compareSessionOnDB: ');


module.exports = {
	creatSessionOnDB,
	setSessionOnDB,
	getSessionOnDBByUserId,
	compareSessionOnDB,
	destroySessionOnDB_BySessionID,
	destroyAllSessionOnDBByUserId,
};