const prisma = require('../../config/prisma');

const buatLaporanInventaris = async (periodeAwal, periodeAkhir) => {
  return prisma.laporan_inventaris.create({
    data: {
      periode_awal: new Date(periodeAwal),
      periode_akhir: new Date(periodeAkhir),
    },
  });
};

const ambilSemuaLaporan = async () => {
  return prisma.laporan_inventaris.findMany({
    orderBy: { tanggal_dibuat: 'desc' },
  });
};

const ambilLaporanById = async (id) => {
  return prisma.laporan_inventaris.findUnique({
    where: { id_laporan: parseInt(id, 10) },
  });
};

const ambilRingkasanStok = async () => {
  return prisma.produk.findMany({
    where: { status_aktif: true },
    select: {
      id_produk: true,
      nama_produk: true,
      satuan: true,
      stok_tersedia: true,
      stok_minimum: true,
      status_aktif: true,
      kategori: { select: { nama_kategori: true } },
    },
    orderBy: { nama_produk: 'asc' },
  });
};

const ambilTransaksiByPeriode = async (periodeAwal, periodeAkhir) => {
  return prisma.transaksi_stok.findMany({
    where: {
      tanggal_transaksi: {
        gte: new Date(periodeAwal),
        lte: new Date(periodeAkhir),
      },
    },
    include: {
      produk: { select: { nama_produk: true } },
      pengguna: { select: { nama: true } },
    },
    orderBy: { tanggal_transaksi: 'desc' },
  });
};


const ambilTransaksiTerakhir = async (limit = 10) => {
  return prisma.transaksi_stok.findMany({
    take: limit,
    orderBy: { tanggal_transaksi: 'desc' },
    include: {
      produk: { select: { nama_produk: true } },
      pengguna: { select: { nama: true } },
      batch: { select: { kode_batch: true } },
    },
  });
};

const ambilBatchAkanExpiry = async (hariKedepan = 30) => {
  const sekarang = new Date();
  const batas = new Date();
  batas.setDate(batas.getDate() + hariKedepan);

  return prisma.batch_produk.findMany({
    where: {
      status_batch: { not: 'DIARSIPKAN' },
      tanggal_kedaluwarsa: { lte: batas },
    },
    include: {
      produk: { select: { nama_produk: true, satuan: true } },
    },
    orderBy: { tanggal_kedaluwarsa: 'asc' },
  });
};

const hitungPergerakanStok7Hari = async () => {
  const tujuhHariLalu = new Date();
  tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 6);
  tujuhHariLalu.setHours(0, 0, 0, 0);

  const transaksi = await prisma.transaksi_stok.findMany({
    where: { tanggal_transaksi: { gte: tujuhHariLalu } },
    select: { jenis_transaksi: true, jumlah: true, tanggal_transaksi: true },
    orderBy: { tanggal_transaksi: 'asc' },
  });

  const perHari = {};
  for (let i = 0; i < 7; i++) {
    const tgl = new Date(tujuhHariLalu);
    tgl.setDate(tgl.getDate() + i);
    const key = tgl.toISOString().split('T')[0];
    perHari[key] = { tanggal: key, masuk: 0, keluar: 0 };
  }

  transaksi.forEach((t) => {
    const key = new Date(t.tanggal_transaksi).toISOString().split('T')[0];
    if (perHari[key]) {
      if (t.jenis_transaksi === 'MASUK') perHari[key].masuk += t.jumlah;
      else perHari[key].keluar += t.jumlah;
    }
  });

  return Object.values(perHari);
};

module.exports = {
  buatLaporanInventaris,
  ambilSemuaLaporan,
  ambilRingkasanStok,
  ambilTransaksiByPeriode,
  ambilTransaksiTerakhir,
  ambilBatchAkanExpiry,
  hitungPergerakanStok7Hari,
  ambilLaporanById,
};
