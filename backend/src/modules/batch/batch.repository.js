const prisma = require('../../config/prisma');

const ambilSemuaBatch = async () => {
  return prisma.batch_produk.findMany({
    include: {
      produk: { select: { nama_produk: true, satuan: true, gambar_produk: true } },
    },
    orderBy: { tanggal_kedaluwarsa: 'asc' },
  });
};

const ambilBatchById = async (idBatch) => {
  return prisma.batch_produk.findUnique({
    where: { id_batch: parseInt(idBatch, 10) },
    include: {
      produk: { select: { nama_produk: true, satuan: true, gambar_produk: true } },
    },
  });
};

const updateBatch = async (idBatch, data) => {
  return prisma.batch_produk.update({
    where: { id_batch: parseInt(idBatch, 10) },
    data,
  });
};

const updateStatusBatch = async (idBatch, status) => {
  return prisma.batch_produk.update({
    where: { id_batch: parseInt(idBatch, 10) },
    data: { status_batch: status },
  });
};

const ambilBatchUntukRefresh = async () => {
  return prisma.batch_produk.findMany({
    where: { status_batch: { not: 'DIARSIPKAN' } },
    select: {
      id_batch: true,
      status_batch: true,
      tanggal_kedaluwarsa: true,
    },
  });
};

module.exports = {
  ambilSemuaBatch,
  ambilBatchById,
  updateBatch,
  updateStatusBatch,
  ambilBatchUntukRefresh,
};
