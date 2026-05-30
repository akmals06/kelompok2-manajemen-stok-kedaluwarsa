const prisma = require('../../config/prisma');

const ambilProdukUntukLabel = async (idList) => {
  return prisma.produk.findMany({
    where: { id_produk: { in: idList.map((id) => parseInt(id, 10)) } },
    include: {
      kategori: { select: { nama_kategori: true } },
    },
  });
};

const ambilBatchUntukLabel = async (idList) => {
  return prisma.batch_produk.findMany({
    where: { id_batch: { in: idList.map((id) => parseInt(id, 10)) } },
    include: {
      produk: { select: { nama_produk: true } },
    },
  });
};

module.exports = { ambilProdukUntukLabel, ambilBatchUntukLabel };
