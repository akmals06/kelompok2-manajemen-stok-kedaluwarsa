const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const validasiIdParam = [
  param('id')
    .notEmpty()
    .withMessage('ID produk harus diisi')
    .isInt()
    .withMessage('ID produk harus berupa angka valid'),
  handleValidationErrors,
];

const validasiBuatProduk = [
  body('id_kategori')
    .notEmpty()
    .withMessage('ID Kategori tidak boleh kosong')
    .isInt()
    .withMessage('ID Kategori harus berupa angka'),
  body('nama_produk')
    .notEmpty()
    .withMessage('Nama produk tidak boleh kosong')
    .isString()
    .withMessage('Nama produk harus berupa teks')
    .isLength({ max: 150 })
    .withMessage('Nama produk tidak boleh lebih dari 150 karakter'),
  body('satuan')
    .notEmpty()
    .withMessage('Satuan tidak boleh kosong')
    .isString()
    .withMessage('Satuan harus berupa teks'),
  body('stok_minimum')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stok minimum harus berupa angka 0 atau lebih'),
  handleValidationErrors,
];

const validasiUpdateProduk = [
  body('id_kategori')
    .optional()
    .isInt()
    .withMessage('ID Kategori harus berupa angka'),
  body('nama_produk')
    .optional()
    .isString()
    .withMessage('Nama produk harus berupa teks')
    .isLength({ max: 150 })
    .withMessage('Nama produk tidak boleh lebih dari 150 karakter'),
  body('satuan')
    .optional()
    .isString()
    .withMessage('Satuan harus berupa teks'),
  body('stok_minimum')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stok minimum harus berupa angka 0 atau lebih'),
  handleValidationErrors,
];

module.exports = {
  validasiIdParam,
  validasiBuatProduk,
  validasiUpdateProduk,
};
