const Crypto = require('node:crypto');
const config = require('../config/config');

function encrypt(text) {
	let string;
	if (typeof text == 'object') {
		string = JSON.stringify(text);
	} else if (typeof text == 'string') {
		string = text;
	} else if (typeof text == 'boolean') {
		string = text ? '1' : '0';
	} else {
		return false;
	}
	const iv = Crypto.randomBytes(16).toString('hex');
	const key = Crypto.createHash('sha256').update(config.cryptoKey).digest();
	const cipher = Crypto.createCipheriv('aes-256-gcm', key, iv);
	let encrypted = cipher.update(string, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	const authTag = cipher.getAuthTag();

	return { data: encrypted, iv: iv, auth: authTag.toString('hex') };
}

function createSessionSecret() {
	return Crypto.randomBytes(16).toString('hex');
}

function decrypt(encrypted) {
	try {
		encrypted = JSON.parse(encrypted);
		const text = encrypted.data;
		const iv = encrypted.iv;
		const authTag = Buffer.from(encrypted.auth, 'hex');
		const key = Crypto.createHash('sha256').update(config.cryptoKey).digest();
		const decipher = Crypto.createDecipheriv('aes-256-gcm', key, iv);
		decipher.setAuthTag(authTag);
		var dec = decipher.update(text, 'hex', 'utf8');
		dec += decipher.final('utf8');
	} catch (error) {
		return false;
	}
	return dec;
}

module.exports = {
	encrypt,
	decrypt,
	createSessionSecret,
};
