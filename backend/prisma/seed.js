const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordPemilik = process.env.SEED_PASSWORD_PEMILIK;
  const passwordAdmin = process.env.SEED_PASSWORD_ADMIN;

  if (!passwordPemilik || !passwordAdmin) {
    throw new Error(
      'SEED_PASSWORD_PEMILIK dan SEED_PASSWORD_ADMIN wajib diisi di file .env sebelum menjalankan seed.'
    );
  }

  const hashPemilik = await bcrypt.hash(passwordPemilik, 10);
  const hashAdmin = await bcrypt.hash(passwordAdmin, 10);

  const pemilik = await prisma.pengguna.upsert({
    where: { email: 'pemilik@abahandi.com' },
    update: { password_hash: hashPemilik },
    create: {
      nama: 'Abah Andi',
      email: 'pemilik@abahandi.com',
      password_hash: hashPemilik,
      peran: 'PEMILIK_USAHA',
      status_aktif: true,
    },
  });

  const admin = await prisma.pengguna.upsert({
    where: { email: 'admin@abahandi.com' },
    update: { password_hash: hashAdmin },
    create: {
      nama: 'Admin Warung',
      email: 'admin@abahandi.com',
      password_hash: hashAdmin,
      peran: 'ADMIN_USAHA',
      status_aktif: true,
    },
  });

  const cekKategori = await prisma.kategori_produk.count();
  if (cekKategori > 0) {
    console.log(`Seed pengguna selesai. Kategori sudah ada (${cekKategori}), skip seed data.`);
    return;
  }

  const kategoriData = [
    { nama_kategori: 'Beras & Tepung', deskripsi: 'Beras, tepung terigu, tepung beras, dll' },
    { nama_kategori: 'Minyak Goreng', deskripsi: 'Minyak goreng sawit dan kelapa' },
    { nama_kategori: 'Gula & Garam', deskripsi: 'Gula pasir, gula merah, garam dapur' },
    { nama_kategori: 'Susu & Olahan', deskripsi: 'Susu kental, susu bubuk, susu UHT' },
    { nama_kategori: 'Bumbu Dapur', deskripsi: 'Kecap, saus, sambal, penyedap rasa' },
    { nama_kategori: 'Minuman', deskripsi: 'Kopi, teh, sirup, minuman sachet' },
    { nama_kategori: 'Mie Instan', deskripsi: 'Mie instan berbagai merek dan rasa' },
    { nama_kategori: 'Sabun & Deterjen', deskripsi: 'Sabun mandi, sabun cuci, deterjen' },
  ];

  const kategoriList = [];
  for (const kat of kategoriData) {
    const k = await prisma.kategori_produk.create({ data: kat });
    kategoriList.push(k);
  }

  const now = new Date();
  const hari = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const produkData = [
    { id_kategori: kategoriList[0].id_kategori, nama_produk: 'Beras Premium 5kg', satuan: 'karung', stok_minimum: 10 },
    { id_kategori: kategoriList[0].id_kategori, nama_produk: 'Tepung Terigu Segitiga Biru 1kg', satuan: 'bungkus', stok_minimum: 15 },
    { id_kategori: kategoriList[1].id_kategori, nama_produk: 'Minyak Goreng Bimoli 2L', satuan: 'botol', stok_minimum: 12 },
    { id_kategori: kategoriList[1].id_kategori, nama_produk: 'Minyak Goreng Tropical 1L', satuan: 'pouch', stok_minimum: 20 },
    { id_kategori: kategoriList[2].id_kategori, nama_produk: 'Gula Pasir 1kg', satuan: 'bungkus', stok_minimum: 20 },
    { id_kategori: kategoriList[2].id_kategori, nama_produk: 'Garam Dapur Cap Kapal 250g', satuan: 'bungkus', stok_minimum: 25 },
    { id_kategori: kategoriList[3].id_kategori, nama_produk: 'Susu Kental Frisian Flag 370g', satuan: 'kaleng', stok_minimum: 15 },
    { id_kategori: kategoriList[3].id_kategori, nama_produk: 'Susu UHT Indomilk 1L', satuan: 'kotak', stok_minimum: 10 },
    { id_kategori: kategoriList[4].id_kategori, nama_produk: 'Kecap Manis ABC 600ml', satuan: 'botol', stok_minimum: 8 },
    { id_kategori: kategoriList[4].id_kategori, nama_produk: 'Saus Sambal Indofood 335ml', satuan: 'botol', stok_minimum: 10 },
    { id_kategori: kategoriList[4].id_kategori, nama_produk: 'Royco Ayam 230g', satuan: 'bungkus', stok_minimum: 12 },
    { id_kategori: kategoriList[5].id_kategori, nama_produk: 'Kopi Kapal Api Special 165g', satuan: 'bungkus', stok_minimum: 10 },
    { id_kategori: kategoriList[5].id_kategori, nama_produk: 'Teh Sariwangi Isi 25', satuan: 'kotak', stok_minimum: 8 },
    { id_kategori: kategoriList[6].id_kategori, nama_produk: 'Indomie Goreng', satuan: 'bungkus', stok_minimum: 50 },
    { id_kategori: kategoriList[6].id_kategori, nama_produk: 'Mie Sedaap Soto', satuan: 'bungkus', stok_minimum: 30 },
    { id_kategori: kategoriList[7].id_kategori, nama_produk: 'Deterjen Rinso Anti Noda 800g', satuan: 'bungkus', stok_minimum: 10 },
    { id_kategori: kategoriList[7].id_kategori, nama_produk: 'Sabun Mandi Lifebuoy 100g', satuan: 'batang', stok_minimum: 20 },
  ];

  const produkList = [];
  for (const p of produkData) {
    const prod = await prisma.produk.create({ data: p });
    produkList.push(prod);
  }

  // Batch & stok masuk per produk
  const stokEntries = [
    { idx: 0, jumlah: 30, expHari: 180, sumber: 'Supplier Padi Jaya' },
    { idx: 1, jumlah: 40, expHari: 120, sumber: 'Distributor Bogasari' },
    { idx: 2, jumlah: 24, expHari: 90, sumber: 'Agen Bimoli' },
    { idx: 3, jumlah: 36, expHari: 60, sumber: 'Distributor Tropical' },
    { idx: 4, jumlah: 50, expHari: 365, sumber: 'Supplier Gula Nusantara' },
    { idx: 5, jumlah: 60, expHari: 365, sumber: 'Supplier Garam Kapal' },
    { idx: 6, jumlah: 30, expHari: 5, sumber: 'Agen Frisian Flag' },       // mendekati kedaluwarsa
    { idx: 7, jumlah: 20, expHari: -2, sumber: 'Distributor Indomilk' },    // sudah kedaluwarsa
    { idx: 8, jumlah: 15, expHari: 150, sumber: 'Distributor ABC' },
    { idx: 9, jumlah: 20, expHari: 120, sumber: 'Distributor Indofood' },
    { idx: 10, jumlah: 25, expHari: 90, sumber: 'Distributor Unilever' },
    { idx: 11, jumlah: 20, expHari: 180, sumber: 'Agen Kapal Api' },
    { idx: 12, jumlah: 15, expHari: 3, sumber: 'Distributor Sariwangi' },   // mendekati kedaluwarsa
    { idx: 13, jumlah: 120, expHari: 150, sumber: 'Distributor Indofood' },
    { idx: 14, jumlah: 80, expHari: 150, sumber: 'Distributor Wings Food' },
    { idx: 15, jumlah: 18, expHari: 365, sumber: 'Distributor Unilever' },
    { idx: 16, jumlah: 40, expHari: 365, sumber: 'Distributor Unilever' },
  ];

  for (const entry of stokEntries) {
    const produk = produkList[entry.idx];
    const kodeBatch = `BATCH-${produk.nama_produk.substring(0, 3).toUpperCase()}-${Date.now()}-${entry.idx}`;

    const statusBatch = entry.expHari <= 0 ? 'KEDALUWARSA'
      : entry.expHari <= 7 ? 'MENDEKATI_KEDALUWARSA'
      : 'AKTIF';

    const batch = await prisma.batch_produk.create({
      data: {
        id_produk: produk.id_produk,
        kode_batch: kodeBatch,
        tanggal_masuk: now,
        tanggal_kedaluwarsa: hari(entry.expHari),
        jumlah_batch: entry.jumlah,
        status_batch: statusBatch,
      },
    });

    await prisma.transaksi_stok.create({
      data: {
        id_pengguna: pemilik.id_pengguna,
        id_produk: produk.id_produk,
        id_batch: batch.id_batch,
        jenis_transaksi: 'MASUK',
        jumlah: entry.jumlah,
        sumber_masuk: entry.sumber,
        keterangan: `Stok awal ${produk.nama_produk}`,
      },
    });

    await prisma.produk.update({
      where: { id_produk: produk.id_produk },
      data: { stok_tersedia: entry.jumlah },
    });
  }

  // Stok keluar untuk beberapa produk agar stok berkurang
  const keluarEntries = [
    { idx: 0, jumlah: 5, tujuan: 'Penjualan harian' },
    { idx: 2, jumlah: 8, tujuan: 'Penjualan harian' },
    { idx: 4, jumlah: 15, tujuan: 'Penjualan harian' },
    { idx: 6, jumlah: 20, tujuan: 'Penjualan harian' },
    { idx: 7, jumlah: 12, tujuan: 'Penjualan harian' },
    { idx: 13, jumlah: 30, tujuan: 'Penjualan harian' },
    { idx: 14, jumlah: 20, tujuan: 'Penjualan harian' },
    { idx: 16, jumlah: 10, tujuan: 'Penjualan harian' },
  ];

  for (const kel of keluarEntries) {
    const produk = produkList[kel.idx];

    await prisma.transaksi_stok.create({
      data: {
        id_pengguna: admin.id_pengguna,
        id_produk: produk.id_produk,
        jenis_transaksi: 'KELUAR',
        jumlah: kel.jumlah,
        tujuan_keluar: kel.tujuan,
        keterangan: `Keluar ${produk.nama_produk}`,
      },
    });

    await prisma.produk.update({
      where: { id_produk: produk.id_produk },
      data: { stok_tersedia: { decrement: kel.jumlah } },
    });

    // Kurangi batch terkait
    const batchProduk = await prisma.batch_produk.findFirst({
      where: { id_produk: produk.id_produk },
      orderBy: { tanggal_kedaluwarsa: 'asc' },
    });
    if (batchProduk) {
      await prisma.batch_produk.update({
        where: { id_batch: batchProduk.id_batch },
        data: { jumlah_batch: { decrement: kel.jumlah } },
      });
    }
  }

  // Notifikasi kedaluwarsa
  const batchMendekati = await prisma.batch_produk.findMany({
    where: { status_batch: { in: ['MENDEKATI_KEDALUWARSA', 'KEDALUWARSA'] } },
    include: { produk: true },
  });

  for (const b of batchMendekati) {
    const isExpired = b.status_batch === 'KEDALUWARSA';
    await prisma.notifikasi.create({
      data: {
        judul: isExpired ? 'Batch Kedaluwarsa' : 'Batch Mendekati Kedaluwarsa',
        pesan: `${b.produk.nama_produk} (${b.kode_batch}) ${isExpired ? 'sudah kedaluwarsa' : 'akan kedaluwarsa dalam beberapa hari'}. Segera lakukan pengecekan.`,
        tipe: 'KEDALUWARSA',
      },
    });
  }

  console.log(`Seed selesai:`);
  console.log(`  Pengguna: ${pemilik.email}, ${admin.email}`);
  console.log(`  Kategori: ${kategoriList.length}`);
  console.log(`  Produk: ${produkList.length}`);
  console.log(`  Batch: ${stokEntries.length}`);
  console.log(`  Stok masuk: ${stokEntries.length}`);
  console.log(`  Stok keluar: ${keluarEntries.length}`);
  console.log(`  Notifikasi: ${batchMendekati.length}`);
}

main()
  .catch((e) => {
    console.error('Seed gagal:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
