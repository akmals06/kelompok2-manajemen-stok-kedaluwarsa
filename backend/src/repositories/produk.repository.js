const prisma = require('../config/db');

// Ambil semua data produk beserta kategorinya
const findAllProduk = async () => {
  return await prisma.produk.findMany({
    include: {
      kategori: true,
    },
  });
};

// Cari satu produk berdasarkan ID
const findProdukById = async (id_produk) => {
  return await prisma.produk.findUnique({
    where: { id_produk: parseInt(id_produk) },
    include: {
      kategori: true,
    },
  });
};

// Simpan produk baru ke database
const createProduk = async (data) => {
  return await prisma.produk.create({
    data,
  });
};

// Update data produk yang sudah ada
const updateProduk = async (id_produk, data) => {
  return await prisma.produk.update({
    where: { id_produk: parseInt(id_produk) },
    data,
  });
};

// Ubah status aktif/nonaktif produk
const updateStatusProduk = async (id_produk, status_aktif) => {
  return await prisma.produk.update({
    where: { id_produk: parseInt(id_produk) },
    data: { status_aktif },
  });
};

module.exports = {
  findAllProduk,
  findProdukById,
  createProduk,
  updateProduk,
  updateStatusProduk,
};
