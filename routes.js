module.exports = function (app) {
	const authRouter = require('./routes/auth');
	app.use('/auth', authRouter);
	const filmsRouter = require('./routes/films');
	app.use('/films', filmsRouter);
	const filesRouter = require('./routes/files');
	app.use('/files', filesRouter);
	const usersRouter = require('./routes/users');
	app.use('/users', usersRouter);
};
