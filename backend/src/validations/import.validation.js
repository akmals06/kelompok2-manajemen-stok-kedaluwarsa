const validasiUploadImport = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: ['File wajib diunggah'],
    });
  }

  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];

  if (!allowedMimes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: ['Tipe file tidak didukung. Gunakan file .xlsx, .xls, atau .csv'],
    });
  }

  const maxSize = 10 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: ['Ukuran file maksimal 10MB'],
    });
  }

  next();
};

const validasiModeImport = (req, res, next) => {
  const { mode } = req.body;
  const modeValid = ['MASTER_PRODUK', 'STOK_AWAL_BATCH'];

  if (!mode || !modeValid.includes(mode)) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: [`Mode import wajib diisi. Pilihan: ${modeValid.join(', ')}`],
    });
  }

  next();
};

const validasiKonfirmasiImport = (req, res, next) => {
  const { data_valid } = req.body;

  if (!data_valid || !Array.isArray(data_valid) || data_valid.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: ['Data valid untuk import wajib diisi'],
    });
  }

  next();
};

module.exports = { validasiUploadImport, validasiModeImport, validasiKonfirmasiImport };
