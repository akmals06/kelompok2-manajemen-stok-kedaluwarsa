const izinkanRole = (...daftarRole) => {
  return (req, res, next) => {
    if (!req.user || !daftarRole.includes(req.user.peran)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak — role tidak memiliki izin',
        errors: [],
      });
    }
    next();
  };
};

module.exports = { izinkanRole };
