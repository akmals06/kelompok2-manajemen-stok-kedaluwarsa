const stokRepo = require('../repositories/stok.repository');

const buatStokKeluar = async (idPengguna, data) => {
  const idProduk = parseInt(data.id_produk, 10);
  const jumlah = parseInt(data.jumlah, 10);
  const idBatch = data.id_batch ? parseInt(data.id_batch, 10) : null;

  const produk = await stokRepo.ambilProdukAktifById(idProduk);

  if (!produk) {
    throw Object.assign(new Error('Produk tidak ditemukan'), { statusCode: 404 });
  }

  if (!produk.status_aktif) {
    throw Object.assign(new Error('Produk tidak aktif, tidak bisa melakukan stok keluar'), { statusCode: 422 });
  }

  if (produk.stok_tersedia < jumlah) {
    throw Object.assign(new Error('Stok produk tidak mencukupi'), { statusCode: 422 });
  }

  if (idBatch) {
    const batch = await stokRepo.ambilBatchById(idBatch);
    if (!batch) {
      throw Object.assign(new Error('Batch tidak ditemukan'), { statusCode: 404 });
    }
    if (batch.id_produk !== idProduk) {
      throw Object.assign(new Error('Batch tidak sesuai dengan produk'), { statusCode: 422 });
    }
    if (batch.jumlah_batch < jumlah) {
      throw Object.assign(new Error('Jumlah batch tidak mencukupi'), { statusCode: 422 });
    }
  }

  const dataTransaksi = {
    id_pengguna: idPengguna,
    id_produk: idProduk,
    jumlah,
    tujuan_keluar: data.tujuan_keluar.trim(),
    keterangan: data.keterangan || null,
  };

  return stokRepo.prosesStokKeluar(dataTransaksi, idBatch);
};

const ambilDaftarStokKeluar = async () => {
  return stokRepo.ambilTransaksiKeluar();
};

module.exports = { buatStokKeluar, ambilDaftarStokKeluar };
