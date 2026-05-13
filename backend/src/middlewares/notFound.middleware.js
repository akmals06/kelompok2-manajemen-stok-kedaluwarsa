const STATUS_CODE = require('../constants/status.constant');

const notFoundMiddleware = (req, res) => {
  res.status(STATUS_CODE.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
};

module.exports = notFoundMiddleware;
