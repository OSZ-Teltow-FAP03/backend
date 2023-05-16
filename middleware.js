const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
var useragent = require('express-useragent');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/config.json');

module.exports = function (app, SESSION_SECRET) {
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
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy(csp));
  app.use(helmet.hidePoweredBy());
  app.use(
    helmet.hsts({
      maxAge: 5184000,
    }),
  );

  app.set('trust proxy', true);
  app.disable('x-powered-by');

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
        maxAge: 10 * 60 * 1000,
        sameSite: 'none',
        secure: true,
        HostOnly: true,
      },
    }),
  );
  app.use(cookieParser(SESSION_SECRET));
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

  const corsOptions = {
    origin: [`https://${config.frontend_host}:${config.frontend_port}`], //frontend server localhost:8080
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true, // enable set cookie
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
  app.use(useragent.express());
};
