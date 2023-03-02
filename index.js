/* This is importing the modules that we need to use in our application. */
require('./modules/checkSystem');
const express = require('express');
const app = express(); // create our Express app
var useragent = require('express-useragent');
const helmet = require('helmet');
const cors = require('cors'); //  A middleware that is used to parse the body of the request.
const https = require('https');
const fs = require('fs');
const errorHandlers = require('./handlers/errorHandlers');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { createSessionSecret } = require('./modules/crypto.js');
const config = require('./config/config.json');
const hostname = config.host;
const port = config.port;
//setting CSP
const csp = {
	defaultSrc: [`'none'`],
	styleSrc: [`'self'`, `'unsafe-inline'`],
	scriptSrc: [`'self'`],
	imgSrc: [`'self'`],
	connectSrc: [`'self'`],
	frameSrc: [`'self'`],
	fontSrc: [`'self'`, 'data:'],
	objectSrc: [`'self'`],
	mediaSrc: [`'self'`],
};
const SESSION_SECRET = createSessionSecret();

// || ======== *** SECURITY MIDDLEWARE *** ========= ||

// adding Helmet to enhance your API's security
app.use(helmet());
app.use(helmet.contentSecurityPolicy(csp));
app.use(helmet.hidePoweredBy());
//  app.use(helmet.noCache()); // noCache disabled by default
app.use(
	helmet.hsts({
		maxAge: 5184000,
	}),
);

app.set('trust proxy', true); // trust first proxy
app.disable('x-powered-by');

// Sessions allow us to Contact data on visitors from request to request
// This keeps admins logged in and allows us to send flash messages
app.use(
	session({
		name: 'session_id',
		saveUninitialized: true,
		resave: false,
		rolling: false,
		secret: SESSION_SECRET,
		cookie: {
			path: '/',
			httpOnly: true,
			maxAge: 1 * 60 * 1000,
			sameSite: 'none',
			secure: true,
			HostOnly: true,
		},
	}),
);

// app middleware
app.use(
	express.urlencoded({
		extended: true,
	}),
);

app.use(
	fileUpload({
		createParentPath: true,
	}),
);

app.use(express.json());
const corsOptions = {
	origin: [`https://${config.frontend_host}:${config.frontend_port}`], //frontend server localhost:8080
	methods: ['GET', 'POST', 'DELETE'],
	credentials: true, // enable set cookie
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
/*
 Use cookieParser and session middlewares together.
 By default Express/Connect app creates a cookie by name 'connect.sid'.But to scale Socket.io app,
 make sure to use cookie name 'jsessionid' (instead of connect.sid) use Cloud Foundry's 'Sticky Session' feature.
 W/o this, Socket.io won't work if you have more than 1 instance.
 If you are NOT running on Cloud Foundry, having cookie name 'jsessionid' doesn't hurt - it's just a cookie name.
 */
app.use(cookieParser(SESSION_SECRET)); // any string ex: 'keyboard cat'
app.use(useragent.express());

// Routers
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);
const filmsRouter = require('./routes/films');
app.use('/films', filmsRouter);
const filesRouter = require('./routes/files');
app.use('/files', filesRouter);
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

app.get('/test', (req, res) => {
	throw new Error('Ich bin ein error');
});

if (app.get('env') === 'prod') {
	app.use(errorHandlers.productionErrors);
} else {
	app.use(errorHandlers.developmentErrors);
}

const server = https
	.createServer(
		{
			key: fs.readFileSync(config.ssl_keys[0].key),
			cert: fs.readFileSync(config.ssl_keys[0].cert),
		},
		app,
	)
	.listen(port, hostname, (err) => {
		if (err) {
			throw err;
		} else {
			console.log(`🚀 Server running at https://${hostname}:${port}`);
		}
	});
