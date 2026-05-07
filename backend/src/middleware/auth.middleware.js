const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

// Middleware untuk ngecek apakah user punya token yang valid
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Akses ditolak. Token tidak ditemukan.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Token tidak valid atau sudah expired.', 401);
  }
};

// Middleware khusus untuk batasi akses cuma buat Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN_USAHA') {
    return errorResponse(res, 'Akses ditolak. Hanya untuk Admin.', 403);
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
};
