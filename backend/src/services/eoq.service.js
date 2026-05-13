const eoqRepo = require('../repositories/eoq.repository');
const produkRepo = require('../repositories/produk.repository');

const hitungEoq = async (data) => {
  const idProduk = parseInt(data.id_produk, 10);
  const kebutuhanTahunan = parseFloat(data.kebutuhan_tahunan);
  const biayaPesan = parseFloat(data.biaya_pesan);
  const biayaSimpan = parseFloat(data.biaya_simpan);

  const produk = await produkRepo.ambilProdukById(idProduk);
  if (!produk) {
    throw Object.assign(new Error('Produk tidak ditemukan'), { statusCode: 404 });
  }

  // Rumus EOQ = sqrt((2 * D * S) / H)
  const nilaiEoq = Math.sqrt((2 * kebutuhanTahunan * biayaPesan) / biayaSimpan);
  const frekuensiPemesanan = kebutuhanTahunan / nilaiEoq;
  const biayaPesanTahunan = frekuensiPemesanan * biayaPesan;

  const hasilAnalisis = {
    id_produk: idProduk,
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
