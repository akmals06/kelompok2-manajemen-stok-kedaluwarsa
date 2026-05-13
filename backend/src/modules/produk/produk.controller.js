const produkService = require('./produk.service');
const { successResponse } = require('../../utils/response');


const getProduk = async (req, res) => {
  const produk = await produkService.getAllProduk();
  return successResponse(res, 'Data produk berhasil diambil.', produk);
};

const getProdukById = async (req, res) => {
  const produk = await produkService.getProdukById(req.params.id);
  return successResponse(res, 'Detail produk berhasil diambil.', produk);
};

const createProduk = async (req, res) => {
  const data = {
    nama_produk: req.body.nama_produk,
    id_kategori: req.body.id_kategori,
    satuan: req.body.satuan,
    stok_minimum: req.body.stok_minimum,
    status_aktif: req.body.status_aktif === 'true' || req.body.status_aktif === true,
  };

  if (req.file) {
    data.gambar_url = req.file.path;
  }

  const produk = await produkService.tambahProduk(data);
  return successResponse(res, 'Produk berhasil ditambahkan.', produk, 201);
};

const updateProduk = async (req, res) => {
  const data = { ...req.body };
  if (data.status_aktif !== undefined) {
    data.status_aktif = data.status_aktif === 'true' || data.status_aktif === true;
  }
  if (req.file) {
    data.gambar_url = req.file.path;
  }

  const produk = await produkService.updateProduk(req.params.id, data);
  return successResponse(res, 'Produk berhasil diperbarui.', produk);
};

const nonaktifkanProduk = async (req, res) => {
  const produk = await produkService.nonaktifkanProduk(req.params.id);
  return successResponse(res, 'Produk berhasil dinonaktifkan.', produk);
};

module.exports = {
  getProduk,
  getProdukById,
  createProduk,
  updateProduk,
  nonaktifkanProduk,
};
