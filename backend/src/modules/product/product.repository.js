const prisma = require('../../config/prisma');

const ambilSemuaProduk = async () => {
  return prisma.produk.findMany({
    include: {
      kategori: {
        select: {
          nama_kategori: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

const ambilProdukById = async (idProduk) => {
  return prisma.produk.findUnique({
    where: { id_produk: parseInt(idProduk, 10) },
    include: {
      kategori: {
        select: {
          nama_kategori: true,
        },
      },
    },
  });
};

const cariProdukByNama = async (namaProduk) => {
  return prisma.produk.findFirst({
    where: {
      nama_produk: {
        equals: namaProduk,
        mode: 'insensitive',
      },
    },
  });
};

const buatProduk = async (dataProduk) => {
  return prisma.produk.create({
    data: dataProduk,
  });
};

const updateProduk = async (idProduk, dataProduk) => {
  return prisma.produk.update({
    where: { id_produk: parseInt(idProduk, 10) },
    data: dataProduk,
  });
};

const ubahStatusProduk = async (idProduk, status) => {
  return prisma.produk.update({
    where: { id_produk: parseInt(idProduk, 10) },
    data: { status_aktif: status },
  });
};

const cekKategoriAda = async (idKategori) => {
  return prisma.kategori_produk.findUnique({
    where: { id_kategori: parseInt(idKategori, 10) },
  });
};

module.exports = {
  ambilSemuaProduk,
  ambilProdukById,
  cariProdukByNama,
  buatProduk,
  updateProduk,
  ubahStatusProduk,
  cekKategoriAda,
};
