const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Stack]', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found with specified ID';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered. Record already exists.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
