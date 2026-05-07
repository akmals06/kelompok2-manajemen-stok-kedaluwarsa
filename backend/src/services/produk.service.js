const produkRepository = require('../repositories/produk.repository');

const getAllProduk = async () => {
  return await produkRepository.findAllProduk();
};

const getProdukById = async (id_produk) => {
  const produk = await produkRepository.findProdukById(id_produk);
  if (!produk) {
    const error = new Error('Produk tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }
  return produk;
};

const tambahProduk = async (produkData) => {
  // Validasi input minimal sesuai skema database
  if (!produkData.nama_produk || !produkData.id_kategori || !produkData.satuan) {
    const error = new Error('nama_produk, id_kategori, dan satuan wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  // Pastikan tipe data angka benar sebelum masuk ke DB
  const dataToCreate = {
    ...produkData,
    id_kategori: parseInt(produkData.id_kategori),
    stok_minimum: produkData.stok_minimum ? parseInt(produkData.stok_minimum) : 0,
    status_aktif: produkData.status_aktif !== undefined ? produkData.status_aktif : true
  };

  return await produkRepository.createProduk(dataToCreate);
};

const updateProduk = async (id_produk, produkData) => {
  await getProdukById(id_produk); // Cek keberadaan produk

  const dataToUpdate = { ...produkData };
  if (dataToUpdate.id_kategori) dataToUpdate.id_kategori = parseInt(dataToUpdate.id_kategori);
  if (dataToUpdate.stok_minimum) dataToUpdate.stok_minimum = parseInt(dataToUpdate.stok_minimum);

  return await produkRepository.updateProduk(id_produk, dataToUpdate);
};

const nonaktifkanProduk = async (id_produk) => {
  await getProdukById(id_produk); // Cek keberadaan produk
  return await produkRepository.updateStatusProduk(id_produk, false);
};

module.exports = {
  getAllProduk,
  getProdukById,
  tambahProduk,
  updateProduk,
  nonaktifkanProduk,
};
