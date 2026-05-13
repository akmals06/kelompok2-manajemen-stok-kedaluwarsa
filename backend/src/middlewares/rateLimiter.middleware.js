const rateLimit = require('express-rate-limit');
const STATUS_CODE = require('../constants/status.constant');

// Technical Assumption: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.status(STATUS_CODE.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
