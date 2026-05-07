const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Gunakan status code default jika tidak ada
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err : null);
};

module.exports = errorHandler;
