const prisma = require('../config/prisma');

const simpanAnalisisEoq = async (data) => {
  return prisma.analisis_eoq.create({
    data: {
      id_produk: data.id_produk,
      id_pengguna: data.id_pengguna || null,
      id_prediksi: data.id_prediksi || null,
      mode_input: data.mode_input || 'MANUAL',
      kebutuhan_tahunan: data.kebutuhan_tahunan,
      biaya_pesan: data.biaya_pesan,
      biaya_simpan: data.biaya_simpan,
      nilai_eoq: data.nilai_eoq,
      frekuensi_pemesanan: data.frekuensi_pemesanan,
      biaya_pesan_tahunan: data.biaya_pesan_tahunan,
    },
  });
};

const simpanPrediksiPermintaan = async (data) => {
  return prisma.prediksi_permintaan.create({
    data: {
      id_produk: data.id_produk,
      periode_awal: new Date(data.periode_awal),
      periode_akhir: new Date(data.periode_akhir),
      data_histori_permintaan: data.data_histori_permintaan,
      hasil_prediksi: data.hasil_prediksi,
      metode: data.metode,
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

const ambilHistoriKeluar = async (idProduk) => {
  return prisma.transaksi_stok.findMany({
    where: {
      id_produk: parseInt(idProduk, 10),
      jenis_transaksi: 'KELUAR',
    },
    select: {
      tanggal_transaksi: true,
      jumlah: true,
    },
  });
};

module.exports = {
  simpanAnalisisEoq,
  simpanPrediksiPermintaan,
  ambilRiwayatEoqByProduk,
  ambilSemuaRiwayatEoq,
  ambilHistoriKeluar,
};
