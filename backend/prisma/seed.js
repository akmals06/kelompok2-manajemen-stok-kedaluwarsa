const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Mulai seeding...');

  // Hapus data lama secara urut (foreign key safe)
  await prisma.riwayatPergerakanStok.deleteMany();
  await prisma.transaksiStok.deleteMany();
  await prisma.analisisEoq.deleteMany();
  await prisma.batchProduk.deleteMany();
  await prisma.produk.deleteMany();
  await prisma.kategoriProduk.deleteMany();
  await prisma.laporanInventaris.deleteMany();
  await prisma.pengguna.deleteMany();

  console.log('Data lama dihapus.');

  // Seed pengguna
  const hashedPassword = await bcrypt.hash('password123', 10);

  const pemilik = await prisma.pengguna.create({
    data: {
      nama: 'Abah Andi',
      email: 'pemilik@warung.com',
      password_hash: hashedPassword,
      peran: 'PEMILIK_USAHA',
      status_aktif: true,
    },
  });

  const admin = await prisma.pengguna.create({
    data: {
      nama: 'Admin Warung',
      email: 'admin@warung.com',
      password_hash: hashedPassword,
      peran: 'ADMIN_USAHA',
      status_aktif: true,
    },
  });

  console.log('Pengguna dibuat:', pemilik.email, admin.email);

  // Seed kategori
  const kategoriSembako = await prisma.kategoriProduk.create({
    data: { nama_kategori: 'Sembako', deskripsi: 'Bahan pokok kebutuhan sehari-hari' },
  });

  const kategoriMinuman = await prisma.kategoriProduk.create({
    data: { nama_kategori: 'Minuman', deskripsi: 'Minuman kemasan dan sachet' },
  });

  const kategoriSnack = await prisma.kategoriProduk.create({
    data: { nama_kategori: 'Snack', deskripsi: 'Makanan ringan kemasan' },
  });

  console.log('Kategori dibuat:', kategoriSembako.nama_kategori, kategoriMinuman.nama_kategori, kategoriSnack.nama_kategori);

  // Seed produk
  const beras = await prisma.produk.create({
    data: {
      nama_produk: 'Beras Premium 5kg',
      id_kategori: kategoriSembako.id_kategori,
      satuan: 'karung',
      stok_tersedia: 50,
      stok_minimum: 10,
      status_aktif: true,
    },
  });

  const minyak = await prisma.produk.create({
    data: {
      nama_produk: 'Minyak Goreng 1L',
      id_kategori: kategoriSembako.id_kategori,
      satuan: 'botol',
      stok_tersedia: 30,
      stok_minimum: 5,
      status_aktif: true,
    },
  });

  const tehKotak = await prisma.produk.create({
    data: {
      nama_produk: 'Teh Kotak 250ml',
      id_kategori: kategoriMinuman.id_kategori,
      satuan: 'pcs',
      stok_tersedia: 100,
      stok_minimum: 20,
      status_aktif: true,
    },
  });

  const chiki = await prisma.produk.create({
    data: {
      nama_produk: 'Chiki Balls 15g',
      id_kategori: kategoriSnack.id_kategori,
      satuan: 'pcs',
      stok_tersedia: 3,
      stok_minimum: 10,
      status_aktif: true,
    },
  });

  console.log('Produk dibuat:', beras.nama_produk, minyak.nama_produk, tehKotak.nama_produk, chiki.nama_produk);

  // Seed batch untuk teh kotak (mendekati kedaluwarsa demo)
  const today = new Date();
  const nearExpiry = new Date();
  nearExpiry.setDate(today.getDate() + 5);

  const farExpiry = new Date();
  farExpiry.setDate(today.getDate() + 90);

  await prisma.batchProduk.create({
    data: {
      id_produk: tehKotak.id_produk,
      kode_batch: 'BTH-TEH-001',
      tanggal_masuk: today,
      tanggal_kedaluwarsa: nearExpiry,
      jumlah_batch: 40,
      status_batch: 'MENDEKATI_KEDALUWARSA',
    },
  });

  await prisma.batchProduk.create({
    data: {
      id_produk: tehKotak.id_produk,
      kode_batch: 'BTH-TEH-002',
      tanggal_masuk: today,
      tanggal_kedaluwarsa: farExpiry,
      jumlah_batch: 60,
      status_batch: 'AKTIF',
    },
  });

  console.log('Batch dibuat untuk:', tehKotak.nama_produk);

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
