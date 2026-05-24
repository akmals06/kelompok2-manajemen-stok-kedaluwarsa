const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.pengguna.findFirst({ where: { peran: 'ADMIN_USAHA' } });
  const pemilik = await prisma.pengguna.findFirst({ where: { peran: 'PEMILIK_USAHA' } });
  const produks = await prisma.produk.findMany();

  if (!admin || !produks.length) {
    console.log("Database requires initial seed first. Run seed.js before seed_chart.js");
    return;
  }

  const now = new Date();
  let totalMasuk = 0;
  let totalKeluar = 0;

  // Generate for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Generate 3-8 random transactions per day
    const numTx = Math.floor(Math.random() * 6) + 3;
    
    for (let j = 0; j < numTx; j++) {
      const isMasuk = Math.random() > 0.6; // 40% masuk, 60% keluar
      const produk = produks[Math.floor(Math.random() * produks.length)];
      const amount = Math.floor(Math.random() * 50) + 5;

      await prisma.transaksi_stok.create({
        data: {
          id_pengguna: isMasuk ? pemilik.id_pengguna : admin.id_pengguna,
          id_produk: produk.id_produk,
          jenis_transaksi: isMasuk ? 'MASUK' : 'KELUAR',
          jumlah: amount,
          sumber_masuk: isMasuk ? 'Supplier ' + Math.floor(Math.random()*100) : null,
          tujuan_keluar: !isMasuk ? 'Penjualan Toko' : null,
          keterangan: (isMasuk ? 'Restock ' : 'Jual ') + produk.nama_produk,
          tanggal_transaksi: date,
        }
      });

      if (isMasuk) {
        totalMasuk++;
      } else {
        totalKeluar++;
      }
    }
  }

  // Also make sure some products are definitely low stock so they appear in Stok Rendah
  // We'll set 8 random products to have stok_tersedia < stok_minimum
  const shuffledProduks = produks.sort(() => 0.5 - Math.random());
  for (let i = 0; i < 8 && i < shuffledProduks.length; i++) {
    const p = shuffledProduks[i];
    await prisma.produk.update({
      where: { id_produk: p.id_produk },
      data: { stok_tersedia: Math.max(1, p.stok_minimum - 2) } // definitely low stock
    });
  }

  console.log(`Berhasil menambahkan ${totalMasuk} transaksi MASUK dan ${totalKeluar} transaksi KELUAR untuk 7 hari terakhir.`);
  console.log(`Mengatur 8 produk menjadi stok rendah.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
