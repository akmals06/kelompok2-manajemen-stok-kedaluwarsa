const prisma = require('../config/prisma');

const ambilSemuaRiwayat = async () => {
  return prisma.riwayat_pergerakan_stok.findMany({
    include: {
      transaksi: {
        select: {
          id_transaksi: true,
          jenis_transaksi: true,
          jumlah: true,
          tanggal_transaksi: true,
          sumber_masuk: true,
          tujuan_keluar: true,
          produk: { select: { nama_produk: true, satuan: true } },
          pengguna: { select: { nama: true } },
        },
      },
    },
    orderBy: { waktu_catat: 'desc' },
  });
};

module.exports = { ambilSemuaRiwayat };
