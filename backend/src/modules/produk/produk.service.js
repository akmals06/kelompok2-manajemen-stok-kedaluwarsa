const produkRepository = require('./produk.repository');
const AppError = require('../../utils/appError');

const getAllProduk = async (options = {}) => {
  return produkRepository.findAllProduk(options);
};

const countProduk = async (where = {}) => {
  return produkRepository.countProduk(where);
};

const getProdukById = async (id) => {
  const produk = await produkRepository.findProdukById(parseInt(id));
  if (!produk) {
    throw new AppError('Produk tidak ditemukan.', 404);
  }
  return produk;
};

const tambahProduk = async (data) => {
  const dataToCreate = {
    nama_produk: data.nama_produk,
    id_kategori: parseInt(data.id_kategori),
    satuan: data.satuan,
    stok_minimum: data.stok_minimum !== undefined ? parseInt(data.stok_minimum) : 0,
    status_aktif: data.status_aktif !== undefined ? data.status_aktif : true,
  };

  if (data.gambar_url) {
    dataToCreate.gambar_url = data.gambar_url;
  }

  return produkRepository.createProduk(dataToCreate);
};

const updateProduk = async (id, data) => {
  await getProdukById(id);

  const dataToUpdate = {};

  if (data.nama_produk !== undefined) dataToUpdate.nama_produk = data.nama_produk;
  if (data.id_kategori !== undefined) dataToUpdate.id_kategori = parseInt(data.id_kategori);
  if (data.satuan !== undefined) dataToUpdate.satuan = data.satuan;
  if (data.stok_minimum !== undefined) dataToUpdate.stok_minimum = parseInt(data.stok_minimum);
  if (data.status_aktif !== undefined) dataToUpdate.status_aktif = data.status_aktif;
  if (data.gambar_url !== undefined) dataToUpdate.gambar_url = data.gambar_url;

  return produkRepository.updateProduk(parseInt(id), dataToUpdate);
};

const nonaktifkanProduk = async (id) => {
  await getProdukById(id);
  return produkRepository.updateProduk(parseInt(id), { status_aktif: false });
};

module.exports = {
  getAllProduk,
  countProduk,
  getProdukById,
  tambahProduk,
  updateProduk,
  nonaktifkanProduk,
};
