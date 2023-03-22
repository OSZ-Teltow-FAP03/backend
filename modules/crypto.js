const CryptoJS = require('crypto-js');
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
	const iv = randomBytes(16);
	let parsed_iv = CryptoJS.enc.Hex.parse(iv);
	const parsedKey = CryptoJS.SHA256(config.cryptoKey);
	const encrypted = CryptoJS.AES.encrypt(string, parsedKey, {
		iv: parsed_iv,
		mode: CryptoJS.mode.CTR,
		format:CryptoJS.format.Hex
	});
	return {
		data: encrypted.toString(),
		iv: iv,
	};
}

function randomBytes(length) {
	length = Math.floor(length);
	let bytes = '';
	for (let index = 0; index < length; index++) {
		let result = parseInt((Math.random() * 256).toString(), 10).toString(16);
		result = result.padStart(2, '0');
		bytes += result;
	}
	return bytes;
}

function createSessionSecret() {
	return randomBytes(16);
}

function decrypt(encrypted) {
	let json;
	if (typeof encrypted == 'object') {
		json = encrypted;
	} else if (typeof encrypted == 'string') {
		json = JSON.parse(encrypted);
	} else {
		return false;
	}
	const iv = CryptoJS.enc.Hex.parse(json.iv);
	const parsedKey = CryptoJS.SHA256(config.cryptoKey);
	const decrypted = CryptoJS.AES.decrypt(CryptoJS.format.Hex.parse(json.data), parsedKey, {
		iv: iv,
		mode: CryptoJS.mode.CTR,
	});
	try {
		return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
	} catch (error) {
		return decrypted.toString(CryptoJS.enc.Utf8)
	}
}

module.exports = {
	encrypt,
	decrypt,
	createSessionSecret
};
