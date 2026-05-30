const validasiIdParam = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi param gagal',
      errors: ['ID produk tidak valid'],
    });
  }
  next();
};

const validasiBuatProduk = (req, res, next) => {
  const { id_kategori, nama_produk, satuan, stok_minimum } = req.body;
  const errors = [];

  if (!id_kategori || isNaN(parseInt(id_kategori, 10))) {
    errors.push('ID Kategori wajib diisi dan harus berupa angka');
  }

  if (!nama_produk || typeof nama_produk !== 'string' || nama_produk.trim() === '') {
    errors.push('Nama produk wajib diisi');
  } else if (nama_produk.length > 150) {
    errors.push('Nama produk tidak boleh lebih dari 150 karakter');
  }

  if (!satuan || typeof satuan !== 'string' || satuan.trim() === '') {
    errors.push('Satuan wajib diisi');
  }

  if (stok_minimum !== undefined && stok_minimum !== null) {
    const stokMin = parseInt(stok_minimum, 10);
    if (isNaN(stokMin) || stokMin < 0) {
      errors.push('Stok minimum harus berupa angka 0 atau lebih');
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

const validasiUpdateProduk = (req, res, next) => {
  const { id_kategori, nama_produk, satuan, stok_minimum } = req.body;
  const errors = [];

  if (id_kategori !== undefined && isNaN(parseInt(id_kategori, 10))) {
    errors.push('ID Kategori harus berupa angka');
  }

  if (nama_produk !== undefined) {
    if (typeof nama_produk !== 'string' || nama_produk.trim() === '') {
      errors.push('Nama produk tidak boleh kosong jika diubah');
    } else if (nama_produk.length > 150) {
      errors.push('Nama produk tidak boleh lebih dari 150 karakter');
    }
  }

  if (satuan !== undefined && (typeof satuan !== 'string' || satuan.trim() === '')) {
    errors.push('Satuan tidak boleh kosong jika diubah');
  }

  if (stok_minimum !== undefined && stok_minimum !== null) {
    const stokMin = parseInt(stok_minimum, 10);
    if (isNaN(stokMin) || stokMin < 0) {
      errors.push('Stok minimum harus berupa angka 0 atau lebih');
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

module.exports = {
  validasiIdParam,
  validasiBuatProduk,
  validasiUpdateProduk,
};
