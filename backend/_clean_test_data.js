const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function clean() {
  await prisma.notifikasi.deleteMany();
  await prisma.riwayat_pergerakan_stok.deleteMany();
  await prisma.transaksi_stok.deleteMany();
  await prisma.analisis_eoq.deleteMany();
  await prisma.laporan_inventaris.deleteMany();
  await prisma.batch_produk.deleteMany();
  await prisma.produk.deleteMany();
  await prisma.kategori_produk.deleteMany();
  console.log('Data test lama dihapus');
  await prisma.$disconnect();
}

clean().catch((e) => { console.error(e); process.exit(1); });
