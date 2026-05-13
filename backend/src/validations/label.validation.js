const validasiLabelRequest = (req, res, next) => {
  const idList = req.body.id_produk || req.body.id_batch;
  const { jumlah_per_item } = req.body;
  const errors = [];

  if (!idList || !Array.isArray(idList) || idList.length === 0) {
    errors.push('id_produk atau id_batch wajib berupa array dengan minimal 1 ID');
  } else {
    const adaInvalid = idList.some((id) => isNaN(parseInt(id, 10)));
    if (adaInvalid) {
      errors.push('Semua ID harus berupa angka');
    }
  }

  if (jumlah_per_item !== undefined && jumlah_per_item !== null) {
    const jml = parseInt(jumlah_per_item, 10);
    if (isNaN(jml) || jml < 1 || jml > 100) {
      errors.push('jumlah_per_item harus antara 1 sampai 100');
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

module.exports = { validasiLabelRequest };
