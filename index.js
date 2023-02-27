/* This is importing the modules that we need to use in our application. */
require('./modules/checkSystem');
const express = require('express');
const app = express(); // create our Express app
var useragent = require('express-useragent');
const helmet = require('helmet');
const cors = require('cors'); //  A middleware that is used to parse the body of the request.
const https = require('https');
const fs = require('fs');
const os = require('os');
const errorHandlers = require('./handlers/errorHandlers');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {
	clearAllcookie,
	getSessionIDCookie
} = require('./modules/cookie');
const {
	v4: uuidv4
} = require('uuid');
const config = require('./config/config.json');
const hostname = config.host;
const port = config.port
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
	mediaSrc: [`'self'`]
};
const SESSION_SECRET = uuidv4();

// || ======== *** SECURITY MIDDLEWARE *** ========= ||

// adding Helmet to enhance your API's security
app.use(helmet());
app.use(helmet.contentSecurityPolicy(csp));
app.use(helmet.hidePoweredBy());
//  app.use(helmet.noCache()); // noCache disabled by default
app.use(
	helmet.hsts({
		maxAge: 5184000
	})
);

app.use(
	cors({
		credentials: true,
		origin: true
	})
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
			HostOnly: true
		}
	})
);

// app middleware
app.use(
	express.urlencoded({
		extended: true
	})
);

app.use(fileUpload({
	createParentPath: true
}));

app.use(express.json());
/* This is a middleware that is used to parse the body of the request. */
const corsOptions = {
	origin: [process.env.ORIGIN_FRONTEND_SERVER], //frontend server localhost:8080
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true, // enable set cookie
	optionsSuccessStatus: 200,
	credentials: true
};
// enabling CORS for all requests
app.use(cors(corsOptions));

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
/*
 Use cookieParser and session middlewares together.
 By default Express/Connect app creates a cookie by name 'connect.sid'.But to scale Socket.io app,
 make sure to use cookie name 'jsessionid' (instead of connect.sid) use Cloud Foundry's 'Sticky Session' feature.
 W/o this, Socket.io won't work if you have more than 1 instance.
 If you are NOT running on Cloud Foundry, having cookie name 'jsessionid' doesn't hurt - it's just a cookie name.
 */
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
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

// pass variables to our templates + all requests

// If that above routes didnt work, we 404 them and forward to error handler
//app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
	/* Development Error Handler - Prints stack trace */
	//	app.use(errorHandlers.developmentErrors);
}
// production error handler
//app.use(errorHandlers.productionErrors);

/* This is telling the server to listen to port 4000. */
const server = https
	.createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
		{
			key: fs.readFileSync(config.ssl_keys[0].key),
			cert: fs.readFileSync(config.ssl_keys[0].cert)
		},
		app
	)
	.listen(port, '0.0.0.0', (err) => {
		if (err) {
			throw err;
		} else {
			console.log(`🚀 Monitor Server running in the https://${hostname}:${port}`);
		}
	});
