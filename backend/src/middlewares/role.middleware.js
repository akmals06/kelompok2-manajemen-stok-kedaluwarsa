const STATUS_CODE = require('../constants/status.constant');
const AppError = require('../utils/appError');
const { ROLES } = require('../constants/role.constant');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Akses ditolak. Anda belum login.', STATUS_CODE.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Akses ditolak. Role tidak sesuai.', STATUS_CODE.FORBIDDEN));
    }

    next();
  };
};

const isAdmin = requireRole(ROLES.ADMIN_USAHA);
const isPemilikOrAdmin = requireRole(ROLES.PEMILIK_USAHA, ROLES.ADMIN_USAHA);

module.exports = { requireRole, isAdmin, isPemilikOrAdmin };
