const env = require('../config/env');
const STATUS_CODE = require('../constants/status.constant');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
  const message = err.isOperational ? err.message : 'Terjadi kesalahan pada server.';

  const response = {
    success: false,
    message,
  };

  // Hanya tampilkan stack trace jika sedang development
  if (env.isDevelopment) {
    response.stack = err.stack;
    response.errorDetails = err; // Optional: raw error details for easier debugging
  }

  // Jika error Prisma atau error yang bukan instance AppError, pastikan formatnya aman
  // Tidak boleh log info sensitif

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
