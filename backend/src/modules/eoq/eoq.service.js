const eoqRepo = require('./eoq.repository');
const produkRepo = require('../product/product.repository');

const hitungEoq = async (data, idPengguna = null) => {
  const idProduk = parseInt(data.id_produk, 10);
  const biayaPesan = parseFloat(data.biaya_pesan);
  const biayaSimpan = parseFloat(data.biaya_simpan);
  const mode = data.mode_input || 'MANUAL';

  const produk = await produkRepo.ambilProdukById(idProduk);
  if (!produk) {
    throw Object.assign(new Error('Produk tidak ditemukan'), { statusCode: 404 });
  }

  let kebutuhanTahunan = 0;
  let idPrediksi = null;

  if (mode === 'PREDIKSI') {
    const histori = await eoqRepo.ambilHistoriKeluar(idProduk);

    // Group by month YYYY-MM
    const groupedData = {};
    histori.forEach((item) => {
      const date = new Date(item.tanggal_transaksi);
      const monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      groupedData[monthStr] = (groupedData[monthStr] || 0) + item.jumlah;
    });

    const sortedMonths = Object.keys(groupedData).sort();
    if (sortedMonths.length < 3) {
      throw Object.assign(
        new Error('Histori data transaksi stok keluar tidak mencukupi untuk melakukan prediksi permintaan (minimal 3 bulan data transaksi berbeda)'),
        { statusCode: 422 }
      );
    }

    // Regresi Linear
    const x = [];
    const y = [];
    sortedMonths.forEach((month, index) => {
      x.push(index + 1);
      y.push(groupedData[month]);
    });

    const N = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / N;

    let predictedNextMonth = slope * (N + 1) + intercept;
    if (predictedNextMonth < 0) {
      predictedNextMonth = 0;
    }

    kebutuhanTahunan = predictedNextMonth * 12;

    const firstMonthStr = sortedMonths[0];
    const lastMonthStr = sortedMonths[sortedMonths.length - 1];

    const prediksi = await eoqRepo.simpanPrediksiPermintaan({
      id_produk: idProduk,
      periode_awal: new Date(firstMonthStr + '-01'),
      periode_akhir: new Date(lastMonthStr + '-01'),
      data_histori_permintaan: JSON.stringify(groupedData),
      hasil_prediksi: kebutuhanTahunan,
      metode: 'REGRESI_LINEAR',
    });

    idPrediksi = prediksi.id_prediksi;
  } else {
    kebutuhanTahunan = parseFloat(data.kebutuhan_tahunan);
  }

  // Rumus EOQ = sqrt((2 * D * S) / H)
  const nilaiEoq = Math.sqrt((2 * kebutuhanTahunan * biayaPesan) / biayaSimpan);
  const frekuensiPemesanan = kebutuhanTahunan / nilaiEoq;
  const biayaPesanTahunan = frekuensiPemesanan * biayaPesan;

  const hasilAnalisis = {
    id_produk: idProduk,
    id_pengguna: idPengguna,
    id_prediksi: idPrediksi,
    mode_input: mode,
    kebutuhan_tahunan: kebutuhanTahunan,
    biaya_pesan: biayaPesan,
    biaya_simpan: biayaSimpan,
    nilai_eoq: Math.round(nilaiEoq * 100) / 100,
    frekuensi_pemesanan: Math.round(frekuensiPemesanan * 100) / 100,
    biaya_pesan_tahunan: Math.round(biayaPesanTahunan * 100) / 100,
  };

  const disimpan = await eoqRepo.simpanAnalisisEoq(hasilAnalisis);

  return {
    ...disimpan,
    nama_produk: produk.nama_produk,
  };
};

const ambilRiwayatEoq = async (idProduk) => {
  if (idProduk) {
    return eoqRepo.ambilRiwayatEoqByProduk(idProduk);
  }
  return eoqRepo.ambilSemuaRiwayatEoq();
};

module.exports = { hitungEoq, ambilRiwayatEoq };
