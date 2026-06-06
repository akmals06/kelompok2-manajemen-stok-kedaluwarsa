const validasiBuatKategori = (req, res, next) => {
  const { nama_kategori } = req.body;
  const errors = [];

  if (!nama_kategori || typeof nama_kategori !== 'string' || nama_kategori.trim() === '') {
    errors.push('Nama kategori wajib diisi');
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

const validasiUpdateKategori = (req, res, next) => {
  const { nama_kategori } = req.body;
  const errors = [];

  if (nama_kategori !== undefined && (typeof nama_kategori !== 'string' || nama_kategori.trim() === '')) {
    errors.push('Nama kategori tidak boleh kosong jika diubah');
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

const validasiIdParam = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi param gagal',
      errors: ['ID kategori tidak valid'],
    });
  }
  next();
};

module.exports = {
  validasiBuatKategori,
  validasiUpdateKategori,
  validasiIdParam,
};
