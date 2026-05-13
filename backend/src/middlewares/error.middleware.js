const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

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
