const express = require('express');
const https = require('https');
const fs = require('fs');
const config = require('./config/config.json');

const app = express();
require('./middleware.js')(app);
require('./routes.js')(app);
require('./errorHandeling.js')(app);

const server = https
	.createServer(
		{
			key: fs.readFileSync(config.ssl_keys[0].key),
			cert: fs.readFileSync(config.ssl_keys[0].cert),
		},
		app,
	)
	.listen(config.port, config.host, (err) => {
		if (err) {
			console.error(err);
			throw err;
		} else {
			console.log(`🚀 Server running at https://${config.host}:${config.port}`);
		}
	});
