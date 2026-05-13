const { errorResponse } = require('../utils/response');
const ROLES = require('../constants/role.constant');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Akses ditolak. Role tidak sesuai.', 403);
    }
    next();
  };
};

const isAdmin = authorizeRoles(ROLES.ADMIN_USAHA);
const isPemilik = authorizeRoles(ROLES.PEMILIK_USAHA);
const isPemilikOrAdmin = authorizeRoles(ROLES.PEMILIK_USAHA, ROLES.ADMIN_USAHA);

module.exports = { authorizeRoles, isAdmin, isPemilik, isPemilikOrAdmin };
