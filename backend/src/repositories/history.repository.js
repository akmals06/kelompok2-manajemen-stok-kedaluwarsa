const prisma = require('../config/prisma');

const ambilSemuaRiwayat = async () => {
  return prisma.riwayat_pergerakan_stok.findMany({
    take: 100,
    include: {
      transaksi: {
        select: {
          id_transaksi: true,
          jenis_transaksi: true,
          jumlah: true,
          tanggal_transaksi: true,
          sumber_masuk: true,
          tujuan_keluar: true,
          produk: { 
            select: { 
              id_produk: true,
              nama_produk: true, 
              satuan: true,
              gambar_produk: true,
              kategori: { select: { nama_kategori: true } }
            } 
          },
          pengguna: { select: { nama: true } },
        },
      },
    },
    orderBy: { waktu_catat: 'desc' },
  });
};

module.exports = { ambilSemuaRiwayat };
