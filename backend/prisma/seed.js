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
    update: {},
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
    update: {},
    create: {
      nama: 'Admin Warung',
      email: 'admin@abahandi.com',
      password_hash: hashAdmin,
      peran: 'ADMIN_USAHA',
      status_aktif: true,
    },
  });

  console.log(`Seed selesai: Pemilik (${pemilik.email}), Admin (${admin.email})`);
}

main()
  .catch((e) => {
    console.error('Seed gagal:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
