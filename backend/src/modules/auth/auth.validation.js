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
const validasiForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email wajib diisi');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Format email tidak valid');
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

const validasiVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email wajib diisi');
  }

  if (!otp || typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    errors.push('Kode OTP harus berupa 6 digit angka');
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

const validasiResetPassword = (req, res, next) => {
  const { email, otp, password_baru } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email wajib diisi');
  }

  if (!otp || typeof otp !== 'string' || otp.length !== 6) {
    errors.push('Kode OTP wajib diisi');
  }

  if (!password_baru || typeof password_baru !== 'string') {
    errors.push('Password baru wajib diisi');
  } else if (password_baru.length < 8) {
    errors.push('Password baru minimal 8 karakter');
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

module.exports = { validasiLogin, validasiForgotPassword, validasiVerifyOtp, validasiResetPassword };
