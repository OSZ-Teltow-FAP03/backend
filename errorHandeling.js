const errorHandlers = require('./handlers/errorHandlers');

module.exports = function (app) {
	if (app.get('env') === 'prod') {
    app.use(errorHandlers.productionErrors);
  } else {
    app.use(errorHandlers.developmentErrors);
  }
};
