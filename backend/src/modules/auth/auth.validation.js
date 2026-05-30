const validasiLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email wajib diisi');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Format email tidak valid');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password wajib diisi');
  } else if (password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors,
    });
  }

  next();
};

module.exports = { validasiLogin };
