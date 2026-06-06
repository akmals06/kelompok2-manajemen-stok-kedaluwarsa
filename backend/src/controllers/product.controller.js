const produkService = require('../services/product.service');

const ambilSemuaProduk = async (req, res, next) => {
  try {
    const produk = await produkService.ambilSemuaProduk();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar produk',
      data: produk,
    });
  } catch (error) {
    next(error);
  }
};

const ambilProdukById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produk = await produkService.ambilProdukById(id);
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail produk',
      data: produk,
    });
  } catch (error) {
    next(error);
  }
};

const buatProduk = async (req, res, next) => {
  try {
    const dataProduk = req.body;
    const fileBuffer = req.file ? req.file.buffer : null;
    
    const produkBaru = await produkService.buatProduk(dataProduk, fileBuffer);
    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: produkBaru,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dataProduk = req.body;
    const fileBuffer = req.file ? req.file.buffer : null;

    const produkDiperbarui = await produkService.updateProduk(id, dataProduk, fileBuffer);
    res.status(200).json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: produkDiperbarui,
    });
  } catch (error) {
    next(error);
  }
};

const nonaktifkanProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produk = await produkService.nonaktifkanProduk(id);
    res.status(200).json({
      success: true,
      message: 'Produk berhasil dinonaktifkan',
      data: produk,
    });
  } catch (error) {
    next(error);
  }
};

const aktifkanProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produk = await produkService.aktifkanProduk(id);
    res.status(200).json({
      success: true,
      message: 'Produk berhasil diaktifkan kembali',
      data: produk,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ambilSemuaProduk,
  ambilProdukById,
  buatProduk,
  updateProduk,
  nonaktifkanProduk,
  aktifkanProduk,
};
