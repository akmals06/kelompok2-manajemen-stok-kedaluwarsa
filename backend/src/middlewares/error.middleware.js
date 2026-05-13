const { errorResponse } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Terjadi kesalahan pada server.';

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err.message);
    if (!err.isOperational) {
      console.error(err.stack);
    }
  }

  return errorResponse(res, message, statusCode);
};

module.exports = errorMiddleware;
