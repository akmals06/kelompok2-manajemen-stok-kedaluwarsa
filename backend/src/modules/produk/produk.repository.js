const prisma = require('../../config/prisma');

const findAllProduk = async (options = {}) => {
  return prisma.produk.findMany({
    where: options.where,
    include: { kategori: true },
    skip: options.skip,
    take: options.take,
    orderBy: options.orderBy || { id_produk: 'desc' },
  });
};

const countProduk = async (where = {}) => {
  return prisma.produk.count({ where });
};

const findProdukById = async (id) => {
  return prisma.produk.findUnique({
    where: { id_produk: id },
    include: { kategori: true },
  });
};

const createProduk = async (data) => {
  return prisma.produk.create({ data });
};

const updateProduk = async (id, data) => {
  return prisma.produk.update({
    where: { id_produk: id },
    data,
  });
};

module.exports = {
  findAllProduk,
  countProduk,
  findProdukById,
  createProduk,
  updateProduk,
};
