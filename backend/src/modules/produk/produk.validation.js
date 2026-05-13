const AppError = require('../../utils/appError');

const validateCreateProduk = (req, res, next) => {
  const { nama_produk, id_kategori, satuan } = req.body;

  if (!nama_produk || !id_kategori || !satuan) {
    throw new AppError('nama_produk, id_kategori, dan satuan wajib diisi.', 400);
  }

  const kategoriId = parseInt(id_kategori);
  if (isNaN(kategoriId) || kategoriId < 1) {
    throw new AppError('id_kategori harus angka positif.', 400);
  }

  if (req.body.stok_minimum !== undefined) {
    const min = parseInt(req.body.stok_minimum);
    if (isNaN(min) || min < 0) {
      throw new AppError('stok_minimum harus angka >= 0.', 400);
    }
  }

  next();
};

const validateUpdateProduk = (req, res, next) => {
  if (req.body.id_kategori !== undefined) {
    const kategoriId = parseInt(req.body.id_kategori);
    if (isNaN(kategoriId) || kategoriId < 1) {
      throw new AppError('id_kategori harus angka positif.', 400);
    }
  }

  if (req.body.stok_minimum !== undefined) {
    const min = parseInt(req.body.stok_minimum);
    if (isNaN(min) || min < 0) {
      throw new AppError('stok_minimum harus angka >= 0.', 400);
    }
  }

  next();
};

module.exports = { validateCreateProduk, validateUpdateProduk };
