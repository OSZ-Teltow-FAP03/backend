const mysql = require('mysql');
const config = require('../config/config.json');
/* This is creating a connection to the database. */

var config_db = config.databank[0];

var db = mysql.createPool(config_db); // or mysql.createConnection(config_db);

/* This is creating a connection to the database. */
db.getConnection((err, connection) => {
	if (err) {
		console.error(err);
		throw err;
	}
	console.log('🗃  DB connected successful: ' + connection.threadId);
	connection.release();
});

module.exports = db;
