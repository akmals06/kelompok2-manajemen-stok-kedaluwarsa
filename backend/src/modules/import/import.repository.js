const prisma = require('../../config/prisma');

const cariKategoriByNama = async (namaKategori) => {
  return prisma.kategori_produk.findUnique({
    where: { nama_kategori: namaKategori },
  });
};

const buatKategori = async (data) => {
  return prisma.kategori_produk.create({ data });
};

const cariProdukByNama = async (namaProduk) => {
  return prisma.produk.findFirst({
    where: { nama_produk: { equals: namaProduk, mode: 'insensitive' } },
  });
};

const cariProdukById = async (idProduk) => {
  return prisma.produk.findUnique({
    where: { id_produk: parseInt(idProduk, 10) },
  });
};

const importMasterProduk = async (dataList) => {
  return prisma.$transaction(async (tx) => {
    const hasil = [];

    for (const item of dataList) {
      let kategori = await tx.kategori_produk.findUnique({
        where: { nama_kategori: item.nama_kategori },
      });

      if (!kategori) {
        kategori = await tx.kategori_produk.create({
          data: {
            nama_kategori: item.nama_kategori,
            deskripsi: item.deskripsi_kategori || null,
          },
        });
      }

      const produkAda = await tx.produk.findFirst({
        where: { nama_produk: { equals: item.nama_produk, mode: 'insensitive' } },
      });

      if (produkAda) {
        hasil.push({ nama_produk: item.nama_produk, status: 'DILEWATI', alasan: 'Produk sudah ada' });
        continue;
      }

      const produkBaru = await tx.produk.create({
        data: {
          id_kategori: kategori.id_kategori,
          nama_produk: item.nama_produk,
          satuan: item.satuan,
          stok_minimum: parseInt(item.stok_minimum, 10) || 0,
          status_aktif: item.status_aktif !== undefined ? Boolean(item.status_aktif) : true,
        },
      });

      hasil.push({ nama_produk: produkBaru.nama_produk, status: 'DIBUAT', id_produk: produkBaru.id_produk });
    }

    return hasil;
  });
};

const importStokAwalBatch = async (dataList, idPengguna) => {
  return prisma.$transaction(async (tx) => {
    const hasil = [];

    for (const item of dataList) {
      let produk;
      if (item.id_produk) {
        produk = await tx.produk.findUnique({ where: { id_produk: parseInt(item.id_produk, 10) } });
      } else {
        produk = await tx.produk.findFirst({
          where: { nama_produk: { equals: item.nama_produk, mode: 'insensitive' } },
        });
      }

      if (!produk) {
        hasil.push({ nama_produk: item.nama_produk || item.id_produk, status: 'GAGAL', alasan: 'Produk tidak ditemukan' });
        continue;
      }

      const jumlah = parseInt(item.jumlah, 10);

      const transaksi = await tx.transaksi_stok.create({
        data: {
          id_pengguna: idPengguna,
          id_produk: produk.id_produk,
          jenis_transaksi: 'MASUK',
          jumlah,
          sumber_masuk: item.sumber_masuk || 'Import Stok Awal',
          keterangan: item.catatan || 'Import stok awal batch',
        },
      });

      await tx.produk.update({
        where: { id_produk: produk.id_produk },
        data: { stok_tersedia: { increment: jumlah } },
      });

      const batchBaru = await tx.batch_produk.create({
        data: {
          id_produk: produk.id_produk,
          kode_batch: item.kode_batch,
          tanggal_masuk: new Date(item.tanggal_masuk),
          tanggal_kedaluwarsa: new Date(item.tanggal_kedaluwarsa),
          jumlah_awal: jumlah,
          jumlah_sisa: jumlah,
          status_batch: 'AKTIF',
        },
      });

      await tx.transaksi_stok.update({
        where: { id_transaksi: transaksi.id_transaksi },
        data: { id_batch: batchBaru.id_batch },
      });

      await tx.riwayat_pergerakan_stok.create({
        data: {
          id_transaksi: transaksi.id_transaksi,
          id_produk: produk.id_produk,
          jenis_pergerakan: 'PENAMBAHAN',
          jumlah_perubahan: jumlah,
          stok_sebelum: produk.stok_tersedia,
          stok_sesudah: produk.stok_tersedia + jumlah,
          catatan: item.catatan || `Import stok awal: ${item.kode_batch}`,
        },
      });

      hasil.push({
        nama_produk: produk.nama_produk,
        kode_batch: item.kode_batch,
        jumlah,
        status: 'BERHASIL',
      });
    }

    return hasil;
  });
};

module.exports = {
  cariKategoriByNama,
  buatKategori,
  cariProdukByNama,
  cariProdukById,
  importMasterProduk,
  importStokAwalBatch,
};
