const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Access denied. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid token.', 401);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return errorResponse(res, 'Access denied. Admin only.', 403);
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
};
