const validasiIdParam = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi param gagal',
      errors: ['ID batch tidak valid'],
    });
  }
  next();
};

const validasiUpdateBatch = (req, res, next) => {
  const { kode_batch, tanggal_masuk, tanggal_kedaluwarsa } = req.body;
  const errors = [];

  if (kode_batch !== undefined && (typeof kode_batch !== 'string' || kode_batch.trim() === '')) {
    errors.push('Kode batch tidak boleh kosong jika diubah');
  }

  if (tanggal_masuk !== undefined && isNaN(Date.parse(tanggal_masuk))) {
    errors.push('Tanggal masuk tidak valid');
  }

  if (tanggal_kedaluwarsa !== undefined && isNaN(Date.parse(tanggal_kedaluwarsa))) {
    errors.push('Tanggal kedaluwarsa tidak valid');
  }

  if (tanggal_masuk && tanggal_kedaluwarsa) {
    if (new Date(tanggal_kedaluwarsa) < new Date(tanggal_masuk)) {
      errors.push('Tanggal kedaluwarsa tidak boleh lebih awal dari tanggal masuk');
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

module.exports = { validasiIdParam, validasiUpdateBatch };
