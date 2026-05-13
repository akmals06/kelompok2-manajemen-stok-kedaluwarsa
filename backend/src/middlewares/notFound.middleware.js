const { errorResponse } = require('../utils/response');

const notFoundMiddleware = (req, res) => {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan.`, 404);
};

module.exports = notFoundMiddleware;
