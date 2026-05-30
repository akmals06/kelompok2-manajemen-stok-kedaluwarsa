const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const getProductSeedImage = (nama, kategori) => {
  const pName = (nama || '').toLowerCase();
  
  if (pName.includes('so klin') || pName.includes('soklin') || pName.includes('liquid')) {
    return 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=120&auto=format&fit=crop';
  }
  if (pName.includes('rinso') || pName.includes('daia')) {
    return 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=120&auto=format&fit=crop';
  }
  if (pName.includes('sunlight') || pName.includes('cuci piring') || pName.includes('lemon')) {
    return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=120&auto=format&fit=crop';
  }
  if (pName.includes('lux') || pName.includes('dettol') || pName.includes('giv') || pName.includes('lifebuoy')) {
    return 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=120&auto=format&fit=crop';
  }
  if (pName.includes('rejoice') || pName.includes('sampo') || pName.includes('shampoo') || pName.includes('sunsilk') || pName.includes('clear') || pName.includes('pantene')) {
    return 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=120&auto=format&fit=crop';
  }
  if (pName.includes('downy') || pName.includes('pelembut') || pName.includes('pewangi') || pName.includes('molto')) {
    return 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=120&auto=format&fit=crop';
  }
  if (pName.includes('wipol') || pName.includes('super pell') || pName.includes('karbol') || pName.includes('lantai') || pName.includes('cling')) {
    return 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=120&auto=format&fit=crop';
  }
  
  const cat = (kategori || '').toLowerCase();
  if (cat.includes('beras') || cat.includes('tepung')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('bumbu') || cat.includes('dapur')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('gula') || cat.includes('garam')) {
    return 'https://images.unsplash.com/photo-1622484211148-716598e04042?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('mie') || cat.includes('instan')) {
    return 'https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('minuman') || cat.includes('sachet') || cat.includes('botol')) {
    return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('minyak') || cat.includes('goreng')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('sabun') || cat.includes('deterjen')) {
    return 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=120&auto=format&fit=crop';
  }
  if (cat.includes('susu') || cat.includes('olahan')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=120&auto=format&fit=crop';
  }
  
  return 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=120&auto=format&fit=crop';
};

async function main() {
  const passwordPemilik = process.env.SEED_PASSWORD_PEMILIK || 'Pemilik123!';
  const passwordAdmin = process.env.SEED_PASSWORD_ADMIN || 'Admin123!';

  console.log('=== MEMULAI SEEDING DATABASE (WARUNG ABAH ANDI) ===');
  console.log('Menggunakan native Prisma Client...');

  const hashPemilik = await bcrypt.hash(passwordPemilik, 10);
  const hashAdmin = await bcrypt.hash(passwordAdmin, 10);

  // 1. Seed Pengguna (Upsert)
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

  console.log('✓ Pengguna berhasil disemai.');

  // Bersihkan data lama jika ada untuk menghindari constraint key violation
  console.log('Pembersihan data transaksi, batch, produk, dan kategori lama...');
  await prisma.analisis_eoq.deleteMany({});
  await prisma.prediksi_permintaan.deleteMany({});
  await prisma.laporan_inventaris_detail.deleteMany({});
  await prisma.laporan_inventaris.deleteMany({});

  await prisma.riwayat_pergerakan_stok.deleteMany({});
  await prisma.detail_transaksi_stok.deleteMany({});
  await prisma.notifikasi_kedaluwarsa.deleteMany({});

  await prisma.transaksi_stok.deleteMany({});
  await prisma.batch_produk.deleteMany({});
  await prisma.produk.deleteMany({});
  await prisma.kategori_produk.deleteMany({});
  console.log('✓ Pembersihan selesai.');


  // 2. Seed Kategori Produk
  const kategoriData = [
    { nama_kategori: 'Beras & Tepung', deskripsi: 'Beras, tepung terigu, tepung beras, tepung kanji' },
    { nama_kategori: 'Minyak Goreng', deskripsi: 'Minyak goreng sawit, minyak kelapa, margarin' },
    { nama_kategori: 'Gula & Garam', deskripsi: 'Gula pasir, gula merah, garam halus, garam kasar' },
    { nama_kategori: 'Susu & Olahan', deskripsi: 'Susu kental, susu bubuk, susu kotak, keju, mentega' },
    { nama_kategori: 'Bumbu Dapur', deskripsi: 'Kecap manis, saus sambal, royco, masako, bumbu instan' },
    { nama_kategori: 'Minuman sachet & Botol', deskripsi: 'Kopi sachet, teh celup, sirup marjan, air mineral' },
    { nama_kategori: 'Mie Instan', deskripsi: 'Indomie, Mie Sedaap, Sarimi, mie telur' },
    { nama_kategori: 'Sabun & Deterjen', deskripsi: 'Sabun cuci piring, deterjen bubuk, sabun mandi' },
  ];

  const kategoriList = [];
  for (const kat of kategoriData) {
    const k = await prisma.kategori_produk.create({ data: kat });
    kategoriList.push(k);
  }
  console.log(`✓ ${kategoriList.length} Kategori produk berhasil disemai.`);

  // 3. Menghasilkan Tepat 200 Produk Secara Dinamis per Kategori (25 produk per kategori x 8 kategori)
  const namaProdukTemplate = [
    // Kategori 0: Beras & Tepung (25 Item)
    [
      { nama: 'Beras Premium Rojo Lele', satuan: 'karung', min: 10 },
      { nama: 'Beras Pandan Wangi', satuan: 'karung', min: 8 },
      { nama: 'Beras Sentra Ramos', satuan: 'karung', min: 12 },
      { nama: 'Beras Merah Organik', satuan: 'bungkus', min: 5 },
      { nama: 'Beras Ketan Putih', satuan: 'bungkus', min: 6 },
      { nama: 'Tepung Terigu Segitiga Biru 1kg', satuan: 'bungkus', min: 20 },
      { nama: 'Tepung Terigu Cakra Kembar 1kg', satuan: 'bungkus', min: 15 },
      { nama: 'Tepung Terigu Kunci Biru 1kg', satuan: 'bungkus', min: 10 },
      { nama: 'Tepung Beras Rose Brand 500g', satuan: 'bungkus', min: 15 },
      { nama: 'Tepung Ketan Rose Brand 500g', satuan: 'bungkus', min: 12 },
      { nama: 'Tepung Tapioka Gunung Agung 500g', satuan: 'bungkus', min: 10 },
      { nama: 'Tepung Maizenaaku 150g', satuan: 'bungkus', min: 8 },
      { nama: 'Beras Cianjur Slip Super', satuan: 'karung', min: 10 },
      { nama: 'Tepung Bumbu Sajiku 250g', satuan: 'bungkus', min: 25 },
      { nama: 'Tepung Roti MamaSuka 200g', satuan: 'bungkus', min: 12 },
      { nama: 'Tepung Hunkwe Cap Tiga Kelinci', satuan: 'bungkus', min: 8 },
      { nama: 'Beras Premium Sania 5kg', satuan: 'karung', min: 8 },
      { nama: 'Beras Premium Maknyuss 5kg', satuan: 'karung', min: 10 },
      { nama: 'Beras Premium LPHP 5kg', satuan: 'karung', min: 5 },
      { nama: 'Tepung Beras Ketan Hitam', satuan: 'bungkus', min: 4 },
      { nama: 'Tepung Bumbu Kobe Crispy', satuan: 'bungkus', min: 15 },
      { nama: 'Tepung Bakwan Sajiku', satuan: 'bungkus', min: 20 },
      { nama: 'Tepung Pisang Goreng Sasa', satuan: 'bungkus', min: 18 },
      { nama: 'Tepung Tapioka Pak Tani 1kg', satuan: 'bungkus', min: 10 },
      { nama: 'Premiks Donat Pondan', satuan: 'kotak', min: 5 }
    ],
    // Kategori 1: Minyak Goreng (25 Item)
    [
      { nama: 'Minyak Goreng Bimoli 2L', satuan: 'pouch', min: 15 },
      { nama: 'Minyak Goreng Bimoli 1L', satuan: 'pouch', min: 20 },
      { nama: 'Minyak Goreng Tropical 2L', satuan: 'botol', min: 12 },
      { nama: 'Minyak Goreng Tropical 1L', satuan: 'pouch', min: 15 },
      { nama: 'Minyak Goreng Sania 2L', satuan: 'pouch', min: 18 },
      { nama: 'Minyak Goreng Sania 1L', satuan: 'pouch', min: 22 },
      { nama: 'Minyak Goreng Fortune 2L', satuan: 'pouch', min: 15 },
      { nama: 'Minyak Goreng Fortune 1L', satuan: 'pouch', min: 20 },
      { nama: 'Minyak Goreng Filma 2L', satuan: 'pouch', min: 10 },
      { nama: 'Minyak Goreng Sunco 2L', satuan: 'pouch', min: 15 },
      { nama: 'Minyak Goreng Sunco 1L', satuan: 'botol', min: 12 },
      { nama: 'Minyak Goreng Kunci Mas 2L', satuan: 'pouch', min: 10 },
      { nama: 'Minyak Kelapa Barco 1L', satuan: 'botol', min: 5 },
      { nama: 'Minyak Goreng Sovia 2L', satuan: 'pouch', min: 12 },
      { nama: 'Margarin Blue Band Serbaguna 200g', satuan: 'bungkus', min: 30 },
      { nama: 'Margarin Blue Band Cake & Cookie', satuan: 'bungkus', min: 15 },
      { nama: 'Mentega Simas Margarin 200g', satuan: 'bungkus', min: 20 },
      { nama: 'Minyak Goreng Resto 1L', satuan: 'pouch', min: 25 },
      { nama: 'Minyak Goreng Hemart 2L', satuan: 'pouch', min: 10 },
      { nama: 'Minyak Wijen ABC 195ml', satuan: 'botol', min: 8 },
      { nama: 'Minyak Zaitun Borges 250ml', satuan: 'botol', min: 4 },
      { nama: 'Margarin Royal Palmia 200g', satuan: 'bungkus', min: 15 },
      { nama: 'Minyak Goreng Fitri Botol 1L', satuan: 'botol', min: 15 },
      { nama: 'Minyak Goreng Sabrina 1L', satuan: 'pouch', min: 20 },
      { nama: 'Minyak Goreng Camar 2L', satuan: 'pouch', min: 10 }
    ],
    // Kategori 2: Gula & Garam (25 Item)
    [
      { nama: 'Gula Pasir Gulaku Premium 1kg', satuan: 'bungkus', min: 25 },
      { nama: 'Gula Pasir Gulaku Tebu 1kg', satuan: 'bungkus', min: 20 },
      { nama: 'Gula Pasir Rose Brand 1kg', satuan: 'bungkus', min: 20 },
      { nama: 'Gula Pasir Lokal Warung 1kg', satuan: 'bungkus', min: 30 },
      { nama: 'Gula Merah Aren Premium 500g', satuan: 'bungkus', min: 12 },
      { nama: 'Gula Merah Kelapa Cetak 1kg', satuan: 'bungkus', min: 10 },
      { nama: 'Gula Batu Mas 250g', satuan: 'bungkus', min: 8 },
      { nama: 'Gula Halus Claris 500g', satuan: 'bungkus', min: 10 },
      { nama: 'Pemanis Rendah Kalori Tropicana Slim', satuan: 'kotak', min: 5 },
      { nama: 'Garam Dapur Refina Halus 500g', satuan: 'bungkus', min: 20 },
      { nama: 'Garam Dapur Cap Kapal 250g', satuan: 'bungkus', min: 40 },
      { nama: 'Garam Dapur Garena Rendah Natrium', satuan: 'bungkus', min: 8 },
      { nama: 'Garam Kasar Lokal 1kg', satuan: 'bungkus', min: 15 },
      { nama: 'Gula Semut Aren Organik 250g', satuan: 'bungkus', min: 8 },
      { nama: 'Gula Singkong Cair 500ml', satuan: 'botol', min: 5 },
      { nama: 'Garam Himalaya Organik 200g', satuan: 'bungkus', min: 6 },
      { nama: 'Garam Meja Beriodium Dolpin 500g', satuan: 'bungkus', min: 20 },
      { nama: 'Gula Jawa Gandu Super 1kg', satuan: 'bungkus', min: 10 },
      { nama: 'Gula Bubuk Donat Rose Brand', satuan: 'bungkus', min: 8 },
      { nama: 'Garam Acar Kasar 500g', satuan: 'bungkus', min: 10 },
      { nama: 'Gula Kelapa Bubuk Organik', satuan: 'bungkus', min: 6 },
      { nama: 'Gula Merah Aren Cair ABC', satuan: 'botol', min: 12 },
      { nama: 'Garam Gurih Penyedap Rasa 100g', satuan: 'bungkus', min: 15 },
      { nama: 'Gulaku Sachet Isi 100', satuan: 'kotak', min: 4 },
      { nama: 'Garam Laut Kasar Bali Sea Salt', satuan: 'bungkus', min: 5 }
    ],
    // Kategori 3: Susu & Olahan (25 Item)
    [
      { nama: 'Susu Kental Manis Frisian Flag Emas', satuan: 'kaleng', min: 15 },
      { nama: 'Susu Kental Manis Indomilk Putih', satuan: 'kaleng', min: 20 },
      { nama: 'Susu Kental Manis Carnation 370g', satuan: 'kaleng', min: 25 },
      { nama: 'Susu UHT Ultra Milk Cokelat 1L', satuan: 'kotak', min: 12 },
      { nama: 'Susu UHT Ultra Milk Full Cream 1L', satuan: 'kotak', min: 15 },
      { nama: 'Susu UHT Indomilk Cokelat 950ml', satuan: 'kotak', min: 10 },
      { nama: 'Susu Steril Bear Brand 189ml', satuan: 'kaleng', min: 30 },
      { nama: 'Susu Bubuk Dancow Fortigro 800g', satuan: 'kotak', min: 8 },
      { nama: 'Susu Bubuk Dancow Cokelat 400g', satuan: 'kotak', min: 10 },
      { nama: 'Susu Bubuk Frisian Flag Instan 400g', satuan: 'kotak', min: 10 },
      { nama: 'Keju Kraft Cheddar 165g', satuan: 'kotak', min: 15 },
      { nama: 'Keju Prochiz Cheddar 170g', satuan: 'kotak', min: 20 },
      { nama: 'Keju Prochiz Spready 160g', satuan: 'box', min: 12 },
      { nama: 'Susu Cair Milo Active-Go Kotak', satuan: 'kotak', min: 24 },
      { nama: 'Susu Bubuk Milo 3in1 400g', satuan: 'bungkus', min: 12 },
      { nama: 'Yogurt Cimory Squeeze 120g', satuan: 'pouch', min: 15 },
      { nama: 'Mentega Wijsman 200g', satuan: 'kaleng', min: 5 },
      { nama: 'Susu UHT Frisian Flag Cokelat 225ml', satuan: 'kotak', min: 20 },
      { nama: 'Susu Kental Manis Omela Kaleng', satuan: 'kaleng', min: 30 },
      { nama: 'Keju Slice Kraft Quick Melt', satuan: 'kotak', min: 10 },
      { nama: 'Susu Bubuk Ovaltine 3-in-1 400g', satuan: 'bungkus', min: 10 },
      { nama: 'Yogurt Yakult Isi 5 Botol', satuan: 'pack', min: 15 },
      { nama: 'Susu UHT Cimory Fresh Milk 950ml', satuan: 'kotak', min: 8 },
      { nama: 'Susu Bubuk Anlene Gold 250g', satuan: 'kotak', min: 6 },
      { nama: 'Susu Kambing Etawa bubuk 200g', satuan: 'kotak', min: 5 }
    ],
    // Kategori 4: Bumbu Dapur (25 Item)
    [
      { nama: 'Kecap Manis Bango 520ml', satuan: 'pouch', min: 20 },
      { nama: 'Kecap Manis Bango 220ml', satuan: 'pouch', min: 25 },
      { nama: 'Kecap Manis ABC 520ml', satuan: 'pouch', min: 15 },
      { nama: 'Kecap Asin ABC 135ml', satuan: 'botol', min: 10 },
      { nama: 'Saus Sambal ABC Asli 335ml', satuan: 'botol', min: 15 },
      { nama: 'Saus Tomat ABC 335ml', satuan: 'botol', min: 12 },
      { nama: 'Penyedap Rasa Royco Sapi 230g', satuan: 'bungkus', min: 30 },
      { nama: 'Penyedap Rasa Royco Ayam 230g', satuan: 'bungkus', min: 30 },
      { nama: 'Penyedap Rasa Masako Sapi 250g', satuan: 'bungkus', min: 25 },
      { nama: 'Penyedap Rasa Masako Ayam 250g', satuan: 'bungkus', min: 25 },
      { nama: 'Sasa MSG Moto Penyedap 250g', satuan: 'bungkus', min: 30 },
      { nama: 'Lada Bubuk Ladaku 1 Renceng', satuan: 'pack', min: 15 },
      { nama: 'Ketumbar Bubuk Desaku 1 Renceng', satuan: 'pack', min: 15 },
      { nama: 'Kunyit Bubuk Desaku 1 Renceng', satuan: 'pack', min: 12 },
      { nama: 'Saus Tiram Saori Saus Tiram 270ml', satuan: 'botol', min: 15 },
      { nama: 'Minyak Wijen Lee Kum Kee 207ml', satuan: 'botol', min: 6 },
      { nama: 'Terasi Udang ABC Sachet Isi 20', satuan: 'pack', min: 10 },
      { nama: 'Saus Teriyaki Saori 270ml', satuan: 'botol', min: 10 },
      { nama: 'Cuka Dapur DIXI 150ml', satuan: 'botol', min: 15 },
      { nama: 'Bumbu Racik Sayur Sop Indofood', satuan: 'pack', min: 25 },
      { nama: 'Bumbu Racik Nasi Goreng Indofood', satuan: 'pack', min: 30 },
      { nama: 'Bumbu Racik Ayam Goreng Indofood', satuan: 'pack', min: 25 },
      { nama: 'Saus Sambal Indofood Pedas Dahsyat', satuan: 'botol', min: 15 },
      { nama: 'Kecap Inggris ABC 135ml', satuan: 'botol', min: 8 },
      { nama: 'Bawang Merah Goreng Botol 150g', satuan: 'botol', min: 10 }
    ],
    // Kategori 5: Minuman sachet & Botol (25 Item)
    [
      { nama: 'Kopi Kapal Api Special Mix Renceng', satuan: 'pack', min: 20 },
      { nama: 'Kopi Kapal Api Tanpa Gula 165g', satuan: 'bungkus', min: 15 },
      { nama: 'Teh Celup Sariwangi Isi 25', satuan: 'kotak', min: 25 },
      { nama: 'Teh Celup Sariwangi Isi 50', satuan: 'kotak', min: 15 },
      { nama: 'Teh Wangi Cap Sosro Isi 30', satuan: 'kotak', min: 20 },
      { nama: 'Sirup Marjan Boudoin Cocopandan', satuan: 'botol', min: 15 },
      { nama: 'Sirup Marjan Boudoin Melon', satuan: 'botol', min: 15 },
      { nama: 'Sirup ABC Squash Delight Jeruk', satuan: 'botol', min: 20 },
      { nama: 'Kopi Torabika Duo Renceng', satuan: 'pack', min: 15 },
      { nama: 'Kopi Luwak White Koffie 3in1', satuan: 'pack', min: 20 },
      { nama: 'Minuman Cokelat Milo Sachet', satuan: 'pack', min: 18 },
      { nama: 'Air Mineral Aqua Botol 600ml', satuan: 'dus', min: 10 },
      { nama: 'Air Mineral Aqua Galon 19L', satuan: 'galon', min: 15 },
      { nama: 'Air Mineral Le Minerale 600ml', satuan: 'dus', min: 8 },
      { nama: 'Teh Pucuk Harum Botol 350ml', satuan: 'dus', min: 10 },
      { nama: 'Minuman Pocari Sweat Botol 500ml', satuan: 'botol', min: 24 },
      { nama: 'Minuman Bear Brand Susu Steril', satuan: 'kaleng', min: 20 },
      { nama: 'Kopi Good Day Mochacinno Sachet', satuan: 'pack', min: 15 },
      { nama: 'Susu Kacang Kedelai V-Soy 1L', satuan: 'kotak', min: 5 },
      { nama: 'Minuman Cincau Cap Panda Kaleng', satuan: 'kaleng', min: 24 },
      { nama: 'Sirup Freiss Cocopandan Indofood', satuan: 'botol', min: 10 },
      { nama: 'Kopi Indocafe Coffeemix Renceng', satuan: 'pack', min: 15 },
      { nama: 'Teh Kotak Sosro Melati 300ml', satuan: 'dus', min: 8 },
      { nama: 'Minuman Floridina Orange 350ml', satuan: 'dus', min: 10 },
      { nama: 'Minuman Kratingdaeng Botol 150ml', satuan: 'botol', min: 20 }
    ],
    // Kategori 6: Mie Instan (25 Item)
    [
      { nama: 'Indomie Goreng Spesial', satuan: 'bungkus', min: 100 },
      { nama: 'Indomie Kuah Rasa Ayam Bawang', satuan: 'bungkus', min: 80 },
      { nama: 'Indomie Kuah Rasa Soto Mie', satuan: 'bungkus', min: 80 },
      { nama: 'Indomie Kuah Rasa Kari Ayam', satuan: 'bungkus', min: 90 },
      { nama: 'Indomie Goreng Rasa Rendang', satuan: 'bungkus', min: 50 },
      { nama: 'Indomie Goreng Ayam Geprek', satuan: 'bungkus', min: 40 },
      { nama: 'Mie Sedaap Goreng', satuan: 'bungkus', min: 80 },
      { nama: 'Mie Sedaap Kuah Soto', satuan: 'bungkus', min: 70 },
      { nama: 'Mie Sedaap Ayam Bawang', satuan: 'bungkus', min: 60 },
      { nama: 'Mie Sedaap Kari Kental Spesial', satuan: 'bungkus', min: 75 },
      { nama: 'Mie Sedaap Goreng Korean Spicy', satuan: 'bungkus', min: 40 },
      { nama: 'Sarimi Isi 2 Ayam Bawang', satuan: 'bungkus', min: 50 },
      { nama: 'Sarimi Isi 2 Goreng Kecap', satuan: 'bungkus', min: 50 },
      { nama: 'Supermi Rasa Kaldu Ayam', satuan: 'bungkus', min: 40 },
      { nama: 'Mie Telur Cap 3 Ayam Lebar', satuan: 'bungkus', min: 30 },
      { nama: 'Mie Telur Cap 3 Ayam Keriting', satuan: 'bungkus', min: 30 },
      { nama: 'Bihun Jagung Padamu 350g', satuan: 'bungkus', min: 20 },
      { nama: 'Soun Naga Putih Premium 250g', satuan: 'bungkus', min: 15 },
      { nama: 'Indomie Goreng Aceh', satuan: 'bungkus', min: 50 },
      { nama: 'Indomie Kuah Kaldu Ayam', satuan: 'bungkus', min: 40 },
      { nama: 'Mie Sedaap Singapore Spicy Laksa', satuan: 'bungkus', min: 30 },
      { nama: 'Mie Sedaap Kuah Baso Spesial', satuan: 'bungkus', min: 40 },
      { nama: 'Pop Mie Rasa Ayam Bawang Cup', satuan: 'dus', min: 5 },
      { nama: 'Pop Mie Rasa Baso Cup', satuan: 'dus', min: 5 },
      { nama: 'Pop Mie Goreng Spesial Cup', satuan: 'dus', min: 4 }
    ],
    // Kategori 7: Sabun & Deterjen (25 Item)
    [
      { nama: 'Deterjen Rinso Anti Noda 800g', satuan: 'bungkus', min: 15 },
      { nama: 'Deterjen Rinso Cair Molto 750ml', satuan: 'pouch', min: 15 },
      { nama: 'Deterjen So Klin Pewangi 800g', satuan: 'bungkus', min: 20 },
      { nama: 'Deterjen Daia Putih Ekstrak 850g', satuan: 'bungkus', min: 20 },
      { nama: 'Sabun Mandi Lifebuoy Merah 100g', satuan: 'batang', min: 40 },
      { nama: 'Sabun Mandi Lifebuoy Biru 100g', satuan: 'batang', min: 30 },
      { nama: 'Sabun Mandi Lux White Velvet 100g', satuan: 'batang', min: 20 },
      { nama: 'Sabun Mandi Giv White Sakura 80g', satuan: 'batang', min: 25 },
      { nama: 'Sabun Cair Dettol Original 410ml', satuan: 'pouch', min: 12 },
      { nama: 'Sabun Cair Lifebuoy Total 10 400ml', satuan: 'pouch', min: 15 },
      { nama: 'Sampo Sunsilk Black Shine 170ml', satuan: 'botol', min: 10 },
      { nama: 'Sampo Clear Men Active 160ml', satuan: 'botol', min: 10 },
      { nama: 'Sampo Pantene Anti Dandruff 150ml', satuan: 'botol', min: 12 },
      { nama: 'Sabun Cuci Piring Sunlight Lime 755ml', satuan: 'pouch', min: 20 },
      { nama: 'Sabun Cuci Piring Mama Lemon 780ml', satuan: 'pouch', min: 15 },
      { nama: 'Pembersih Lantai Super Pell Apple 780ml', satuan: 'pouch', min: 15 },
      { nama: 'Pakar Karbol Wipol Cemara 750ml', satuan: 'pouch', min: 15 },
      { nama: 'Pewangi Pakaian Molto Sekali Bilas', satuan: 'pouch', min: 20 },
      { nama: 'Pelembut Pakaian Downy Sunrise 700ml', satuan: 'pouch', min: 15 },
      { nama: 'Pembersih Kaca Cling Apple 450ml', satuan: 'pouch', min: 12 },
      { nama: 'Sabun Mandi Detol Batang Cool', satuan: 'batang', min: 30 },
      { nama: 'Sampo Rejoice Rich Soft 150ml', satuan: 'botol', min: 10 },
      { nama: 'Sabun Cair Lux Soft Rose 400ml', satuan: 'pouch', min: 15 },
      { nama: 'Sabun Cuci Piring Sunlight 210ml', satuan: 'pouch', min: 30 },
      { nama: 'Deterjen So Klin Liquid 750ml', satuan: 'pouch', min: 15 }
    ]
  ];

  const produkList = [];
  let totalSeededProducts = 0;

  for (let i = 0; i < kategoriList.length; i++) {
    const kat = kategoriList[i];
    const items = namaProdukTemplate[i];

    console.log(`Menyemai produk untuk kategori: "${kat.nama_kategori}"...`);

    for (const item of items) {
      const prod = await prisma.produk.create({
        data: {
          id_kategori: kat.id_kategori,
          nama_produk: item.nama,
          satuan: item.satuan,
          stok_minimum: item.min,
          stok_tersedia: 0, // Inisialisasi stok tersedia default
          gambar_produk: getProductSeedImage(item.nama, kat.nama_kategori),
        },
      });
      produkList.push(prod);
      totalSeededProducts++;
    }
  }

  console.log(`✓ Sukses menyemai ${totalSeededProducts} produk.`);

  const now = new Date();
  const hari = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  // 4. Seed Batch & Transaksi Masuk untuk 20 produk pertama untuk inisialisasi visual dashboard yang keren
  console.log('Menyemai data batch dan transaksi untuk inisialisasi dasbor...');
  
  // Ambil sampel 25 produk acak untuk diberi stok awal dan pergerakan
  const sampleIndices = [
    0, 2, 5, 8, 12, 14, 25, 27, 30, 42, 50, 52, 55, 63, 75, 77, 80, 100, 103, 112, 125, 128, 150, 153, 175
  ];

  const batchMap = new Map();

  // Konfigurasi stok awal untuk produk sampel
  const stokEntries = [
    { sIdx: 0, jumlah: 30, expHari: 180, sumber: 'Supplier Padi Jaya' },
    { sIdx: 1, jumlah: 40, expHari: 120, sumber: 'Distributor Bogasari' },
    { sIdx: 2, jumlah: 24, expHari: 90, sumber: 'Agen Tepung Terigu' },
    { sIdx: 3, jumlah: 36, expHari: 60, sumber: 'Distributor Tepung Rose' },
    { sIdx: 4, jumlah: 50, expHari: 365, sumber: 'Supplier Bogasari Jaya' },
    { sIdx: 5, jumlah: 60, expHari: 365, sumber: 'Supplier Tepung Cianjur' },
    { sIdx: 6, jumlah: 30, expHari: 5, sumber: 'Agen Bimoli' },       // mendekati kedaluwarsa
    { sIdx: 7, jumlah: 20, expHari: -2, sumber: 'Distributor Bimoli' },    // sudah kedaluwarsa
    { sIdx: 8, jumlah: 15, expHari: 150, sumber: 'Distributor Tropical' },
    { sIdx: 9, jumlah: 20, expHari: 120, sumber: 'Distributor Sania' },
    { sIdx: 10, jumlah: 25, expHari: 90, sumber: 'Distributor Fortune' },
    { sIdx: 11, jumlah: 20, expHari: 180, sumber: 'Agen Gulaku' },
    { sIdx: 12, jumlah: 15, expHari: 3, sumber: 'Distributor Garam Kapal' },   // mendekati kedaluwarsa
    { sIdx: 13, jumlah: 120, expHari: 150, sumber: 'Distributor Susu Frisian' },
    { sIdx: 14, jumlah: 80, expHari: 150, sumber: 'Distributor Susu UHT Ultra' },
    { sIdx: 15, jumlah: 18, expHari: 365, sumber: 'Distributor Bear Brand' },
    { sIdx: 16, jumlah: 40, expHari: 365, sumber: 'Distributor Kraft' },
    { sIdx: 17, jumlah: 55, expHari: 200, sumber: 'Distributor Kecap Bango' },
    { sIdx: 18, jumlah: 30, expHari: 180, sumber: 'Agen Royco Dapur' },
    { sIdx: 19, jumlah: 45, expHari: 210, sumber: 'Distributor Kopi Kapal Api' },
    { sIdx: 20, jumlah: 150, expHari: 180, sumber: 'Distributor Indomie Utama' },
    { sIdx: 21, jumlah: 120, expHari: 180, sumber: 'Distributor Mie Sedaap' },
    { sIdx: 22, jumlah: 30, expHari: 300, sumber: 'Distributor Rinso Deterjen' },
    { sIdx: 23, jumlah: 50, expHari: 300, sumber: 'Distributor Lifebuoy Mandi' },
    { sIdx: 24, jumlah: 60, expHari: 240, sumber: 'Distributor Sunlight Piring' }
  ];

  for (let entryIdx = 0; entryIdx < stokEntries.length; entryIdx++) {
    const entry = stokEntries[entryIdx];
    const produkIndex = sampleIndices[entry.sIdx];
    const produk = produkList[produkIndex];

    const kodeBatch = `BATCH-${produk.nama_produk.substring(0, 3).toUpperCase()}-${Date.now() % 100000}-${entryIdx}`;

    const statusBatch = entry.expHari <= 0 ? 'KEDALUWARSA'
      : entry.expHari <= 7 ? 'MENDEKATI_KEDALUWARSA'
      : 'AKTIF';

    // Buat Batch
    const batch = await prisma.batch_produk.create({
      data: {
        id_produk: produk.id_produk,
        kode_batch: kodeBatch,
        tanggal_masuk: now,
        tanggal_kedaluwarsa: hari(entry.expHari),
        jumlah_awal: entry.jumlah,
        jumlah_sisa: entry.jumlah,
        status_batch: statusBatch,
      },
    });

    batchMap.set(produk.id_produk, batch);

    // Buat Transaksi Stok (MASUK)
    const transaksi = await prisma.transaksi_stok.create({
      data: {
        id_pengguna: pemilik.id_pengguna,
        id_produk: produk.id_produk,
        id_batch: batch.id_batch,
        jenis_transaksi: 'MASUK',
        jumlah: entry.jumlah,
        sumber_masuk: entry.sumber,
        status_validasi: 'VALID',
        status_transaksi: 'BERHASIL',
        keterangan: `Stok awal ${produk.nama_produk}`,
      },
    });

    // Buat Detail Transaksi Stok
    await prisma.detail_transaksi_stok.create({
      data: {
        id_transaksi: transaksi.id_transaksi,
        id_batch: batch.id_batch,
        jumlah_batch: entry.jumlah,
      },
    });

    // Buat Riwayat Pergerakan Stok
    await prisma.riwayat_pergerakan_stok.create({
      data: {
        id_transaksi: transaksi.id_transaksi,
        id_produk: produk.id_produk,
        jenis_pergerakan: 'PENAMBAHAN',
        jumlah_perubahan: entry.jumlah,
        stok_sebelum: 0,
        stok_sesudah: entry.jumlah,
        catatan: `Stok awal ${produk.nama_produk} dimasukkan`,
      },
    });

    // Update stok produk
    await prisma.produk.update({
      where: { id_produk: produk.id_produk },
      data: { stok_tersedia: entry.jumlah },
    });
  }

  console.log('✓ Batch & Transaksi Masuk awal berhasil disemai.');

  // 5. Seed Stok Keluar (Simulasi Penjualan)
  console.log('Menyemai data transaksi keluar (penjualan)...');
  const keluarEntries = [
    { sIdx: 0, jumlah: 5, tujuan: 'Penjualan toko harian' },
    { sIdx: 2, jumlah: 8, tujuan: 'Penjualan retail warung' },
    { sIdx: 4, jumlah: 15, tujuan: 'Penjualan retail warung' },
    { sIdx: 6, jumlah: 12, tujuan: 'Penjualan toko harian' },
    { sIdx: 7, jumlah: 5, tujuan: 'Penjualan toko harian' },
    { sIdx: 13, jumlah: 30, tujuan: 'Penjualan eceran' },
    { sIdx: 14, jumlah: 20, tujuan: 'Penjualan eceran' },
    { sIdx: 20, jumlah: 40, tujuan: 'Penjualan grosir sembako' },
    { sIdx: 21, jumlah: 30, tujuan: 'Penjualan grosir sembako' },
    { sIdx: 24, jumlah: 10, tujuan: 'Penjualan retail warung' }
  ];

  for (const kel of keluarEntries) {
    const produkIndex = sampleIndices[kel.sIdx];
    const produk = produkList[produkIndex];
    const batch = batchMap.get(produk.id_produk);

    if (!batch) continue;

    // Buat Transaksi Stok (KELUAR)
    const transaksi = await prisma.transaksi_stok.create({
      data: {
        id_pengguna: admin.id_pengguna,
        id_produk: produk.id_produk,
        id_batch: batch.id_batch,
        jenis_transaksi: 'KELUAR',
        jumlah: kel.jumlah,
        tujuan_keluar: kel.tujuan,
        status_validasi: 'VALID',
        status_transaksi: 'BERHASIL',
        keterangan: `Keluar ${produk.nama_produk} untuk penjualan`,
      },
    });

    // Buat Detail Transaksi Stok
    await prisma.detail_transaksi_stok.create({
      data: {
        id_transaksi: transaksi.id_transaksi,
        id_batch: batch.id_batch,
        jumlah_batch: kel.jumlah,
      },
    });

    // Ambil stok sebelum update
    const prodTerbaru = await prisma.produk.findUnique({
      where: { id_produk: produk.id_produk },
    });
    const stokSebelum = prodTerbaru ? prodTerbaru.stok_tersedia : 0;
    const stokSesudah = stokSebelum - kel.jumlah;

    // Buat Riwayat Pergerakan Stok
    await prisma.riwayat_pergerakan_stok.create({
      data: {
        id_transaksi: transaksi.id_transaksi,
        id_produk: produk.id_produk,
        jenis_pergerakan: 'PENGURANGAN',
        jumlah_perubahan: -kel.jumlah,
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSesudah,
        catatan: `Keluar ${produk.nama_produk} untuk penjualan`,
      },
    });

    // Update produk stok
    await prisma.produk.update({
      where: { id_produk: produk.id_produk },
      data: { stok_tersedia: stokSesudah },
    });

    // Update sisa batch
    await prisma.batch_produk.update({
      where: { id_batch: batch.id_batch },
      data: { jumlah_sisa: { decrement: kel.jumlah } },
    });
  }

  console.log('✓ Transaksi Keluar berhasil disemai.');

  // 6. Seed Notifikasi Kedaluwarsa
  console.log('Menyemai notifikasi peringatan kedaluwarsa...');
  const batchMendekati = await prisma.batch_produk.findMany({
    where: { status_batch: { in: ['MENDEKATI_KEDALUWARSA', 'KEDALUWARSA'] } },
    include: { produk: true },
  });

  for (const b of batchMendekati) {
    const isExpired = b.status_batch === 'KEDALUWARSA';
    const jenis = isExpired ? 'KEDALUWARSA' : 'MENDEKATI_KEDALUWARSA';



    await prisma.notifikasi_kedaluwarsa.create({
      data: {
        id_batch: b.id_batch,
        jenis_notifikasi: jenis,
        pesan: `${b.produk.nama_produk} (${b.kode_batch}) ${isExpired ? 'sudah kedaluwarsa' : 'akan kedaluwarsa dalam beberapa hari'}.`,
        status_baca: false,
      },
    });
  }

  console.log('✓ Notifikasi kedaluwarsa berhasil disemai.');
  console.log('=== SEEDING SELESAI DENGAN SUKSES 100% ===');
  console.log(`  - Total Pengguna: 2 (${pemilik.email}, ${admin.email})`);
  console.log(`  - Total Kategori: ${kategoriList.length}`);
  console.log(`  - Total Produk: ${produkList.length} (Tepat 200 produk!)`);
  console.log(`  - Total Batch Aktif: ${stokEntries.length}`);
}

main()
  .catch((e) => {
    console.error('❌ SEEDING GAGAL:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
