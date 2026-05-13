const prisma = require('../config/prisma');

const buatLaporanInventaris = async (periodeAwal, periodeAkhir) => {
  return prisma.laporan_inventaris.create({
    data: {
      periode_awal: new Date(periodeAwal),
      periode_akhir: new Date(periodeAkhir),
    },
  });
};

const ambilSemuaLaporan = async () => {
  return prisma.laporan_inventaris.findMany({
    orderBy: { tanggal_generate: 'desc' },
  });
};

const ambilRingkasanStok = async () => {
  return prisma.produk.findMany({
    select: {
      id_produk: true,
      nama_produk: true,
      satuan: true,
      stok_tersedia: true,
      stok_minimum: true,
      status_aktif: true,
      kategori: { select: { nama_kategori: true } },
    },
    orderBy: { nama_produk: 'asc' },
  });
};

const ambilTransaksiByPeriode = async (periodeAwal, periodeAkhir) => {
  return prisma.transaksi_stok.findMany({
    where: {
      tanggal_transaksi: {
        gte: new Date(periodeAwal),
        lte: new Date(periodeAkhir),
      },
    },
    include: {
      produk: { select: { nama_produk: true } },
      pengguna: { select: { nama: true } },
    },
    orderBy: { tanggal_transaksi: 'desc' },
  });
};

module.exports = {
  buatLaporanInventaris,
  ambilSemuaLaporan,
  ambilRingkasanStok,
  ambilTransaksiByPeriode,
};
