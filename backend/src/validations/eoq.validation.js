const validasiHitungEoq = (req, res, next) => {
  const { id_produk, kebutuhan_tahunan, biaya_pesan, biaya_simpan, mode_input } = req.body;
  const errors = [];

  const mode = mode_input || 'MANUAL';

  if (!['MANUAL', 'PREDIKSI'].includes(mode)) {
    errors.push('Mode input harus MANUAL atau PREDIKSI');
  }

  if (!id_produk || isNaN(parseInt(id_produk, 10))) {
    errors.push('ID produk wajib diisi dan harus berupa angka');
  }

  if (mode === 'MANUAL') {
    if (kebutuhan_tahunan === undefined || kebutuhan_tahunan === null || isNaN(parseFloat(kebutuhan_tahunan)) || parseFloat(kebutuhan_tahunan) <= 0) {
      errors.push('Kebutuhan tahunan wajib diisi dan harus lebih dari 0');
    }
  }

  if (!biaya_pesan || isNaN(parseFloat(biaya_pesan)) || parseFloat(biaya_pesan) <= 0) {
    errors.push('Biaya pesan wajib diisi dan harus lebih dari 0');
  }

  if (!biaya_simpan || isNaN(parseFloat(biaya_simpan)) || parseFloat(biaya_simpan) <= 0) {
    errors.push('Biaya simpan wajib diisi dan harus lebih dari 0');
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

module.exports = { validasiHitungEoq };
