const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`
  });
};

module.exports = notFoundMiddleware;
