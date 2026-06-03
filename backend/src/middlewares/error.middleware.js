const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Tangani error dari Multer secara khusus (cth: limit ukuran file atau filter ekstensi)
  if (err.name === 'MulterError' || err.message === 'Format gambar harus JPG, PNG, atau WebP.') {
    statusCode = 400;
  }

  if (!statusCode) statusCode = 500;

  console.error(`[ERROR] ${req.method} ${req.path} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
