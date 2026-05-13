const prisma = require('../config/prisma');

const ambilProdukAktifById = async (idProduk) => {
  return prisma.produk.findUnique({
    where: { id_produk: parseInt(idProduk, 10) },
  });
};

const ambilBatchById = async (idBatch) => {
  return prisma.batch_produk.findUnique({
    where: { id_batch: parseInt(idBatch, 10) },
  });
};

const prosesStokMasuk = async (dataTransaksi, dataBatch) => {
  return prisma.$transaction(async (tx) => {
    const transaksi = await tx.transaksi_stok.create({
      data: {
        id_pengguna: dataTransaksi.id_pengguna,
        id_produk: dataTransaksi.id_produk,
        jenis_transaksi: 'MASUK',
        jumlah: dataTransaksi.jumlah,
        sumber_masuk: dataTransaksi.sumber_masuk,
        keterangan: dataTransaksi.keterangan || null,
      },
    });

    await tx.produk.update({
      where: { id_produk: dataTransaksi.id_produk },
      data: { stok_tersedia: { increment: dataTransaksi.jumlah } },
    });

    let batchBaru = null;
    if (dataBatch) {
      batchBaru = await tx.batch_produk.create({
        data: {
          id_produk: dataTransaksi.id_produk,
          kode_batch: dataBatch.kode_batch,
          tanggal_masuk: new Date(dataBatch.tanggal_masuk),
          tanggal_kedaluwarsa: new Date(dataBatch.tanggal_kedaluwarsa),
          jumlah_batch: dataTransaksi.jumlah,
          status_batch: 'AKTIF',
        },
      });

      await tx.transaksi_stok.update({
        where: { id_transaksi: transaksi.id_transaksi },
        data: { id_batch: batchBaru.id_batch },
      });
    }

    const riwayat = await tx.riwayat_pergerakan_stok.create({
      data: {
        id_transaksi: transaksi.id_transaksi,
        jenis_pergerakan: 'PENAMBAHAN',
        jumlah_perubahan: dataTransaksi.jumlah,
        catatan: dataTransaksi.keterangan || `Stok masuk dari ${dataTransaksi.sumber_masuk}`,
      },
    });

    return { transaksi, batch: batchBaru, riwayat };
  });
};

const prosesStokKeluar = async (dataTransaksi, idBatch) => {
  return prisma.$transaction(async (tx) => {
    const produk = await tx.produk.findUnique({
      where: { id_produk: dataTransaksi.id_produk },
    });

    // Cek stok di dalam transaction untuk menghindari race condition
    if (produk.stok_tersedia < dataTransaksi.jumlah) {
      throw Object.assign(new Error('Stok produk tidak mencukupi'), { statusCode: 422 });
    }

    const dataCreate = {
      id_pengguna: dataTransaksi.id_pengguna,
      id_produk: dataTransaksi.id_produk,
      jenis_transaksi: 'KELUAR',
      jumlah: dataTransaksi.jumlah,
      tujuan_keluar: dataTransaksi.tujuan_keluar,
      keterangan: dataTransaksi.keterangan || null,
    };

    if (idBatch) {
      dataCreate.id_batch = parseInt(idBatch, 10);
    }

    const transaksi = await tx.transaksi_stok.create({ data: dataCreate });

    await tx.produk.update({
      where: { id_produk: dataTransaksi.id_produk },
      data: { stok_tersedia: { decrement: dataTransaksi.jumlah } },
    });

    if (idBatch) {
      const batch = await tx.batch_produk.findUnique({
        where: { id_batch: parseInt(idBatch, 10) },
      });

      if (!batch || batch.jumlah_batch < dataTransaksi.jumlah) {
        throw Object.assign(new Error('Jumlah batch tidak mencukupi'), { statusCode: 422 });
      }

      await tx.batch_produk.update({
        where: { id_batch: parseInt(idBatch, 10) },
        data: { jumlah_batch: { decrement: dataTransaksi.jumlah } },
      });
    }

    const riwayat = await tx.riwayat_pergerakan_stok.create({
      data: {
        id_transaksi: transaksi.id_transaksi,
        jenis_pergerakan: 'PENGURANGAN',
        jumlah_perubahan: dataTransaksi.jumlah,
        catatan: dataTransaksi.keterangan || `Stok keluar ke ${dataTransaksi.tujuan_keluar}`,
      },
    });

    return { transaksi, riwayat };
  });
};

const ambilTransaksiMasuk = async () => {
  return prisma.transaksi_stok.findMany({
    where: { jenis_transaksi: 'MASUK' },
    include: {
      produk: { select: { nama_produk: true, satuan: true } },
      pengguna: { select: { nama: true } },
      batch: { select: { kode_batch: true } },
    },
    orderBy: { tanggal_transaksi: 'desc' },
  });
};

const ambilTransaksiKeluar = async () => {
  return prisma.transaksi_stok.findMany({
    where: { jenis_transaksi: 'KELUAR' },
    include: {
      produk: { select: { nama_produk: true, satuan: true } },
      pengguna: { select: { nama: true } },
      batch: { select: { kode_batch: true } },
    },
    orderBy: { tanggal_transaksi: 'desc' },
  });
};

module.exports = {
  ambilProdukAktifById,
  ambilBatchById,
  prosesStokMasuk,
  prosesStokKeluar,
  ambilTransaksiMasuk,
  ambilTransaksiKeluar,
};
