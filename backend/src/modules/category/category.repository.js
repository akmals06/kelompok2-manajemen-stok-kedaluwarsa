const prisma = require('../../config/prisma');

const cariKategoriByNama = async (namaKategori) => {
  return prisma.kategori_produk.findUnique({
    where: { nama_kategori: namaKategori },
  });
};

const buatKategori = async (data) => {
  return prisma.kategori_produk.create({
    data,
  });
};

const ambilSemuaKategori = async () => {
  return prisma.kategori_produk.findMany({
    include: {
      _count: {
        select: { produk: true },
      },
    },
    orderBy: { nama_kategori: 'asc' },
  });
};

const ambilKategoriById = async (idKategori) => {
  return prisma.kategori_produk.findUnique({
    where: { id_kategori: idKategori },
  });
};

const updateKategori = async (idKategori, data) => {
  return prisma.kategori_produk.update({
    where: { id_kategori: idKategori },
    data,
  });
};

const hapusKategori = async (idKategori) => {
  return prisma.kategori_produk.delete({
    where: { id_kategori: idKategori },
  });
};

module.exports = {
  cariKategoriByNama,
  buatKategori,
  ambilSemuaKategori,
  ambilKategoriById,
  updateKategori,
  hapusKategori,
};
