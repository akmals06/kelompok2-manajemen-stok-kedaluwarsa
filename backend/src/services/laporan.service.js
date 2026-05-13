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

const ambilRingkasanDashboard = async () => {
  const [ringkasanStok, keuanganHariIni, keuanganBulanIni, transaksiTerakhir, batchAkanExpiry, pergerakanStok] = await Promise.all([
    ambilRingkasanStok(),
    laporanRepo.hitungKeuanganHariIni(),
    laporanRepo.hitungKeuanganBulanIni(),
    laporanRepo.ambilTransaksiTerakhir(10),
    laporanRepo.ambilBatchAkanExpiry(30),
    laporanRepo.hitungPergerakanStok7Hari(),
  ]);

  const totalProduk = ringkasanStok.length;
  const stokRendah = ringkasanStok.filter((p) => p.status_stok === 'STOK_RENDAH');

  const { isExpired, isNearExpiry } = require('../utils/date');
  const { NEAR_EXPIRY_DAYS } = require('../constants/batch.constant');

  const batchDenganStatus = batchAkanExpiry.map((b) => {
    let status = 'AKTIF';
    if (isExpired(b.tanggal_kedaluwarsa)) status = 'KEDALUWARSA';
    else if (isNearExpiry(b.tanggal_kedaluwarsa, NEAR_EXPIRY_DAYS)) status = 'MENDEKATI_KEDALUWARSA';
    return { ...b, status_terhitung: status };
  });

  return {
    stok: {
      total_produk: totalProduk,
      stok_rendah: stokRendah.length,
      daftar_stok_rendah: stokRendah.slice(0, 5),
    },
    keuangan: {
      hari_ini: keuanganHariIni,
      bulan_ini: keuanganBulanIni,
    },
    batch: {
      hampir_kedaluwarsa: batchDenganStatus.filter((b) => b.status_terhitung === 'MENDEKATI_KEDALUWARSA').length,
      kedaluwarsa: batchDenganStatus.filter((b) => b.status_terhitung === 'KEDALUWARSA').length,
      daftar: batchDenganStatus.slice(0, 10),
    },
    transaksi_terakhir: transaksiTerakhir,
    pergerakan_7_hari: pergerakanStok,
    waktu_server: new Date().toISOString(),
  };
};

module.exports = { ambilRingkasanStok, buatLaporanInventaris, ambilSemuaLaporan, ambilRingkasanDashboard };
