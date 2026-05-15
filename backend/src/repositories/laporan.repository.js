const prisma = require('../config/prisma');

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
    orderBy: { tanggal_generate: 'desc' },
  });
};

const ambilLaporanById = async (id) => {
  return prisma.laporan_inventaris.findUnique({
    where: { id_laporan: parseInt(id, 10) },
  });
};

const ambilRingkasanStok = async () => {
  return prisma.produk.findMany({
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

const hitungKeuanganHariIni = async () => {
  const awalHari = new Date();
  awalHari.setHours(0, 0, 0, 0);
  const akhirHari = new Date();
  akhirHari.setHours(23, 59, 59, 999);

  const [pemasukan, pengeluaran] = await Promise.all([
    prisma.keuangan.aggregate({
      where: { jenis_transaksi: 'PEMASUKAN', tanggal_transaksi: { gte: awalHari, lte: akhirHari } },
      _sum: { nominal: true },
      _count: true,
    }),
    prisma.keuangan.aggregate({
      where: { jenis_transaksi: 'PENGELUARAN', tanggal_transaksi: { gte: awalHari, lte: akhirHari } },
      _sum: { nominal: true },
      _count: true,
    }),
  ]);

  return {
    pemasukan: pemasukan._sum.nominal || 0,
    pengeluaran: pengeluaran._sum.nominal || 0,
    jumlah_transaksi_masuk: pemasukan._count,
    jumlah_transaksi_keluar: pengeluaran._count,
  };
};

const hitungKeuanganBulanIni = async () => {
  const sekarang = new Date();
  const awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1);
  const akhirBulan = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 0, 23, 59, 59, 999);

  const [pemasukan, pengeluaran] = await Promise.all([
    prisma.keuangan.aggregate({
      where: { jenis_transaksi: 'PEMASUKAN', tanggal_transaksi: { gte: awalBulan, lte: akhirBulan } },
      _sum: { nominal: true },
      _count: true,
    }),
    prisma.keuangan.aggregate({
      where: { jenis_transaksi: 'PENGELUARAN', tanggal_transaksi: { gte: awalBulan, lte: akhirBulan } },
      _sum: { nominal: true },
      _count: true,
    }),
  ]);

  return {
    pemasukan: pemasukan._sum.nominal || 0,
    pengeluaran: pengeluaran._sum.nominal || 0,
    jumlah_transaksi_masuk: pemasukan._count,
    jumlah_transaksi_keluar: pengeluaran._count,
  };
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
  hitungKeuanganHariIni,
  hitungKeuanganBulanIni,
  ambilTransaksiTerakhir,
  ambilBatchAkanExpiry,
  hitungPergerakanStok7Hari,
  ambilLaporanById,
};
