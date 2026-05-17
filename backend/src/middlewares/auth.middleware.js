const { verifikasiAccessToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan',
      errors: [],
    });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifikasiAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa',
      errors: [],
    });
  }
};

module.exports = authMiddleware;
