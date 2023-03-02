/*
  Catch Errors Handler
  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

exports.catchErrors = (fn) => {
  return function (req, res, next) {
    const resp = fn(req, res, next);
    if (resp instanceof Promise) {
      return resp.catch(next);
    }
    return resp;
  };
};

/*
  Not Found Error Handler
  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Api url doesn't exist ",
  });
	next(); // this will give you the above exception
};

/*
  Development Error Handler
  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
exports.developmentErrors = (err, req, res, next) => {
  console.log(err)
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack,
  };

  res.status(500).send({
    msg: 'Unknown Error',
    code: 404,
    err: errorDetails,
  });
};

/*
  Production Error Handler
  No stacktraces are leaked to admin
*/
exports.productionErrors = (err, req, res, next) => {
  res.status(500).send({
    msg: 'Unknown Error',
    code: 404,
    err: err.message,
  });
};

