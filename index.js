/* This is importing the modules that we need to use in our application. */
const express = require('express');
require('./module/checkVersion');
var useragent = require('express-useragent');
const helmet = require('helmet');
const cors = require('cors'); //  A middleware that is used to parse the body of the request.
const https = require('https');
const http = require('http');
const fs = require('fs');
const errorHandlers = require('./handlers/errorHandlers');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();

// create our Express app
const app = express();
app.use(useragent.express());

//setting CSP
const csp = {
	defaultSrc: [ `'none'` ],
	styleSrc: [ `'self'`, `'unsafe-inline'` ],
	scriptSrc: [ `'self'` ],
	imgSrc: [ `'self'` ],
	connectSrc: [ `'self'` ],
	frameSrc: [ `'self'` ],
	fontSrc: [ `'self'`, 'data:' ],
	objectSrc: [ `'self'` ],
	mediaSrc: [ `'self'` ],
};

//  app.use(helmet.noCache()); // noCache disabled by default
const SERVERPORT = process.env.SERVERPORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const sixtyDaysInSeconds = 5184000; // 60 * 24 * 60 * 60

// ======== *** SECURITY MIDDLEWARE ***

//setup helmet js
app.use(helmet());
app.use(helmet.contentSecurityPolicy(csp));
app.use(helmet.hidePoweredBy());
app.use(
	helmet.hsts({
		maxAge: sixtyDaysInSeconds,
	}),
);

app.use(
	cors({
		credentials: true,
		origin: true,
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

app.use(express.json());
/* This is a middleware that is used to parse the body of the request. */
const corsOptions = {
	origin: [ process.env.ORIGIN_FRONTEND_SERVER ], //frontend server localhost:8080
	methods: [ 'GET', 'POST', 'PUT', 'DELETE' ],
	credentials: true, // enable set cookie
	optionsSuccessStatus: 200,
	credentials: true,
};

app.use(cors(corsOptions));

/*
 Use cookieParser and session middlewares together.
 By default Express/Connect app creates a cookie by name 'connect.sid'.But to scale Socket.io app,
 make sure to use cookie name 'jsessionid' (instead of connect.sid) use Cloud Foundry's 'Sticky Session' feature.
 W/o this, Socket.io won't work if you have more than 1 instance.
 If you are NOT running on Cloud Foundry, having cookie name 'jsessionid' doesn't hurt - it's just a cookie name.
 */
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);
app.use(cookieParser(SESSION_SECRET)); // any string ex: 'keyboard cat'

// Routers
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

app.get('/', (req, res, next) => {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ip.substr(0, 7) == '::ffff:') {
		ip = ip.substr(7);
		req.useragent.ip_address = ip;
	}
	req.useragent.ip_address = ip;
	console.log(req.useragent.ip_address);
	if (req.session.user) {
		res.status(200).send({
			loggedIn: true,
			user: req.session.user,
		});
	} else {
		res.status(200).send({
			loggedIn: false,
		});
	}
});

// pass variables to our templates + all requests

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
	/* Development Error Handler - Prints stack trace */
	app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

/* This is telling the server to listen to port 3001. */
// http.createServer(app).listen(8080, '0.0.0.0', (err) => {
// 	if (err) {
// 		throw err;
// 	} else {
// 		console.log('🚀 Server running');
// 	}
// });
https
	.createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
		{
			key: fs.readFileSync(process.env.privateKey),
			cert: fs.readFileSync(process.env.certificate),
		},
		app,
	)
	.listen(SERVERPORT, '0.0.0.0', (err) => {
		if (err) {
			throw err;
		} else {
			console.log('🚀 Server running in the', SERVERPORT);
		}
	});

