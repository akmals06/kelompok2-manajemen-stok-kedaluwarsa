const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.message || error : null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
