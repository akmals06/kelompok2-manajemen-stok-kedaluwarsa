const prisma = require('../config/prisma');

const simpanAnalisisEoq = async (data) => {
  return prisma.analisis_eoq.create({
    data: {
      id_produk: data.id_produk,
      kebutuhan_tahunan: data.kebutuhan_tahunan,
      biaya_pesan: data.biaya_pesan,
      biaya_simpan: data.biaya_simpan,
      nilai_eoq: data.nilai_eoq,
      frekuensi_pemesanan: data.frekuensi_pemesanan,
      biaya_pesan_tahunan: data.biaya_pesan_tahunan,
    },
  });
};

const ambilRiwayatEoqByProduk = async (idProduk) => {
  return prisma.analisis_eoq.findMany({
    where: { id_produk: parseInt(idProduk, 10) },
    include: {
      produk: { select: { nama_produk: true } },
    },
    orderBy: { created_at: 'desc' },
  });
};

const ambilSemuaRiwayatEoq = async () => {
  return prisma.analisis_eoq.findMany({
    include: {
      produk: { select: { nama_produk: true } },
    },
    orderBy: { created_at: 'desc' },
  });
};

module.exports = { simpanAnalisisEoq, ambilRiwayatEoqByProduk, ambilSemuaRiwayatEoq };
