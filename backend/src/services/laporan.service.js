const laporanRepo = require('../repositories/laporan.repository');

const ambilRingkasanStok = async () => {
  const produkList = await laporanRepo.ambilRingkasanStok();

  return produkList.map((produk) => ({
    ...produk,
    status_stok: produk.stok_tersedia <= produk.stok_minimum ? 'STOK_RENDAH' : 'NORMAL',
  }));
};

const buatLaporanInventaris = async (data) => {
  const periodeAwal = new Date(data.periode_awal);
  const periodeAkhir = new Date(data.periode_akhir);

  if (periodeAkhir < periodeAwal) {
    throw Object.assign(
      new Error('Periode akhir tidak boleh lebih awal dari periode awal'),
      { statusCode: 422 }
    );
  }

  const laporan = await laporanRepo.buatLaporanInventaris(data.periode_awal, data.periode_akhir);
  const transaksi = await laporanRepo.ambilTransaksiByPeriode(data.periode_awal, data.periode_akhir);

  let totalMasuk = 0;
  let totalKeluar = 0;
  transaksi.forEach((t) => {
    if (t.jenis_transaksi === 'MASUK') totalMasuk += t.jumlah;
    if (t.jenis_transaksi === 'KELUAR') totalKeluar += t.jumlah;
  });

  return {
    laporan,
    ringkasan: {
      total_transaksi: transaksi.length,
      total_masuk: totalMasuk,
      total_keluar: totalKeluar,
    },
    transaksi,
  };
};

const ambilSemuaLaporan = async () => {
  return laporanRepo.ambilSemuaLaporan();
};

module.exports = { ambilRingkasanStok, buatLaporanInventaris, ambilSemuaLaporan };
