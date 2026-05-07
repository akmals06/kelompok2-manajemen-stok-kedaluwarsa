const produkService = require('../services/produk.service');
const { successResponse, errorResponse } = require('../utils/response');

const getProduk = async (req, res, next) => {
  try {
    const produk = await produkService.getAllProduk();
    return successResponse(res, 'Produk berhasil diambil', produk);
  } catch (error) {
    next(error);
  }
};

const getProdukById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const produk = await produkService.getProdukById(id);
    return successResponse(res, 'Produk berhasil diambil', produk);
  } catch (error) {
    next(error);
  }
};

const createProduk = async (req, res, next) => {
  try {
    const { id_kategori, nama_produk, satuan, stok_minimum, status_aktif } = req.body;
    const gambar_url = req.file ? req.file.path : null;

    const produkData = {
      id_kategori,
      nama_produk,
      satuan,
      stok_minimum,
      status_aktif: status_aktif === 'true' || status_aktif === true,
    };
    if (gambar_url) {
      produkData.gambar_url = gambar_url;
    }

    const newProduk = await produkService.tambahProduk(produkData);
    return successResponse(res, 'Produk berhasil dibuat', newProduk, 201);
  } catch (error) {
    next(error);
  }
};

const updateProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_kategori, nama_produk, satuan, stok_minimum, status_aktif } = req.body;
    const gambar_url = req.file ? req.file.path : null;

    const produkData = {
      id_kategori,
      nama_produk,
      satuan,
      stok_minimum,
    };
    if (status_aktif !== undefined) {
      produkData.status_aktif = status_aktif === 'true' || status_aktif === true;
    }
    if (gambar_url) {
      produkData.gambar_url = gambar_url;
    }

    // Hapus field yang tidak dikirim agar tidak menimpa data lama dengan undefined
    Object.keys(produkData).forEach(key => produkData[key] === undefined && delete produkData[key]);

    const updatedProduk = await produkService.updateProduk(id, produkData);
    return successResponse(res, 'Produk berhasil diperbarui', updatedProduk);
  } catch (error) {
    next(error);
  }
};

const nonaktifkanProduk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nonaktifProduk = await produkService.nonaktifkanProduk(id);
    return successResponse(res, 'Produk berhasil dinonaktifkan', nonaktifProduk);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  nonaktifkanProduk,
};
