const { logEvents } = require('./LogEvents');

/**
 * Middleware function that logs all errors to the server in
 * the ../logs/errorLog.txt file.
 * 
 * @param {HttpError} err error object
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @param {HttpMiddleware} next next middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, 'errorLog.txt');
    console.error(err.stack)
    res.status(500).send(err.message);
}

module.exports = errorHandler;