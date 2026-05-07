const prisma = require('../config/db');

const findAllProducts = async () => {
  return await prisma.produk.findMany({
    include: {
      kategori: true,
    },
  });
};

const findProductById = async (id_produk) => {
  return await prisma.produk.findUnique({
    where: { id_produk: parseInt(id_produk) },
    include: {
      kategori: true,
    },
  });
};

const createProduct = async (data) => {
  return await prisma.produk.create({
    data,
  });
};

const updateProduct = async (id_produk, data) => {
  return await prisma.produk.update({
    where: { id_produk: parseInt(id_produk) },
    data,
  });
};

const updateStatusProduct = async (id_produk, status_aktif) => {
  return await prisma.produk.update({
    where: { id_produk: parseInt(id_produk) },
    data: { status_aktif },
  });
};

module.exports = {
  findAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  updateStatusProduct,
};
