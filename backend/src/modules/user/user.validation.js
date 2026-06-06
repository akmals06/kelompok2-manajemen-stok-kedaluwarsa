const validasiPerbaruiProfil = (req, res, next) => {
  const { nama } = req.body;
  const errors = [];

  if (nama !== undefined) {
    if (typeof nama !== 'string' || nama.trim() === '') {
      errors.push('Nama tidak boleh kosong');
    }
    if (typeof nama === 'string' && nama.trim().length > 100) {
      errors.push('Nama maksimal 100 karakter');
    }
  }

  if (req.body.no_telepon !== undefined) {
    const no = req.body.no_telepon;
    if (typeof no !== 'string') {
      errors.push('Nomor telepon harus berupa string');
    }
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

const validasiGantiPassword = (req, res, next) => {
  const { passwordLama, passwordBaru } = req.body;
  const errors = [];

  if (!passwordLama || typeof passwordLama !== 'string' || passwordLama.trim() === '') {
    errors.push('Password lama wajib diisi');
  }

  if (!passwordBaru || typeof passwordBaru !== 'string' || passwordBaru.trim() === '') {
    errors.push('Password baru wajib diisi');
  } else if (passwordBaru.trim().length < 6) {
    errors.push('Password baru minimal 6 karakter');
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

const validasiGantiEmail = (req, res, next) => {
  const { emailBaru, password } = req.body;
  const errors = [];

  if (!emailBaru || typeof emailBaru !== 'string' || emailBaru.trim() === '') {
    errors.push('Email baru wajib diisi');
  } else {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailBaru.trim())) {
      errors.push('Format email tidak valid');
    }
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Password wajib diisi untuk konfirmasi');
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

module.exports = { validasiPerbaruiProfil, validasiGantiPassword, validasiGantiEmail };
