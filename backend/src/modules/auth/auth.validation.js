const AppError = require('../../utils/appError');

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email dan password wajib diisi.', 400);
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new AppError('Format input tidak valid.', 400);
  }

  next();
};

module.exports = { validateLogin };
