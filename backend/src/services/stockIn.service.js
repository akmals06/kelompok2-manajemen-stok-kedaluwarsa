const stokRepo = require('../repositories/stock.repository');

const buatStokMasuk = async (idPengguna, data) => {
  const idProduk = parseInt(data.id_produk, 10);
  const jumlah = parseInt(data.jumlah, 10);

  const produk = await stokRepo.ambilProdukAktifById(idProduk);

  if (!produk) {
    throw Object.assign(new Error('Produk tidak ditemukan'), { statusCode: 404 });
  }

  if (!produk.status_aktif) {
    throw Object.assign(new Error('Produk tidak aktif, tidak bisa menerima stok masuk'), { statusCode: 422 });
  }

  const dataTransaksi = {
    id_pengguna: idPengguna,
    id_produk: idProduk,
    jumlah,
    sumber_masuk: data.sumber_masuk.trim(),
    keterangan: data.keterangan || null,
  };

  const dataBatch = data.batch ? {
    kode_batch: data.batch.kode_batch.trim(),
    tanggal_masuk: data.batch.tanggal_masuk,
    tanggal_kedaluwarsa: data.batch.tanggal_kedaluwarsa,
  } : null;

  return stokRepo.prosesStokMasuk(dataTransaksi, dataBatch);
};

const ambilDaftarStokMasuk = async () => {
  return stokRepo.ambilTransaksiMasuk();
};

module.exports = { buatStokMasuk, ambilDaftarStokMasuk };
