const prisma = require('../../config/prisma');

// Mapping jenis_notifikasi → judul dan tipe untuk kompatibilitas frontend
const JUDUL_MAP = {
  MENDEKATI_KEDALUWARSA: 'Peringatan Mendekati Kedaluwarsa',
  KEDALUWARSA: 'Batch Kedaluwarsa',
  STOK_MENIPIS: 'Peringatan Stok Menipis',
};

const TIPE_MAP = {
  MENDEKATI_KEDALUWARSA: 'MENDEKATI_KEDALUWARSA',
  KEDALUWARSA: 'KEDALUWARSA',
  STOK_MENIPIS: 'STOK_MENIPIS',
};

// Map row notifikasi_kedaluwarsa → format kompatibel frontend
const mapToLegacyFormat = (row) => {
  let judul = JUDUL_MAP[row.jenis_notifikasi] || row.jenis_notifikasi;
  if (row.jenis_notifikasi === 'STOK_MENIPIS' && row.pesan.includes('HABIS')) {
    judul = 'Peringatan Stok Habis';
  }
  return {
    id_notifikasi: row.id_notifikasi,
    judul: judul,
    pesan: row.pesan,
    tipe: TIPE_MAP[row.jenis_notifikasi] || 'PERINGATAN',
    dibaca: row.status_baca,
    created_at: row.tanggal_notifikasi,
    // Data tambahan untuk konteks
    batch: row.batch || null,
  };
};

let lastSyncTime = 0;
const SYNC_COOLDOWN = 60 * 1000; // 1 minute

// Live scan and insert expiration alerts into database
const sinkronisasiNotifikasiKedaluwarsa = async () => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get active batches with sisa stock
    const activeBatches = await prisma.batch_produk.findMany({
      where: {
        status_batch: { not: 'DIARSIPKAN' },
        jumlah_sisa: { gt: 0 }
      },
      include: {
        produk: { select: { nama_produk: true } }
      }
    });

    const eligibleBatches = [];
    for (const batch of activeBatches) {
      const expDate = new Date(batch.tanggal_kedaluwarsa);
      let jenis = null;
      let pesan = '';

      if (expDate <= now) {
        jenis = 'KEDALUWARSA';
        pesan = `Batch ${batch.kode_batch} untuk produk ${batch.produk.nama_produk} telah kedaluwarsa sejak tanggal ${expDate.toLocaleDateString('id-ID')}.`;
      } else if (expDate <= thirtyDaysFromNow) {
        jenis = 'MENDEKATI_KEDALUWARSA';
        const sisaHari = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        pesan = `Batch ${batch.kode_batch} untuk produk ${batch.produk.nama_produk} mendekati kedaluwarsa! Tersisa ${sisaHari} hari lagi (${expDate.toLocaleDateString('id-ID')}).`;
      }

      if (jenis) {
        eligibleBatches.push({
          id_batch: batch.id_batch,
          jenis_notifikasi: jenis,
          pesan
        });
      }
    }

    if (eligibleBatches.length === 0) return;

    const batchIds = eligibleBatches.map(b => b.id_batch);
    // Find all existing notifications for these active batches in 1 query
    const existingNotifications = await prisma.notifikasi_kedaluwarsa.findMany({
      where: {
        id_batch: { in: batchIds }
      },
      select: {
        id_batch: true,
        jenis_notifikasi: true
      }
    });

    const existingSet = new Set(
      existingNotifications.map(n => `${n.id_batch}_${n.jenis_notifikasi}`)
    );

    const newNotifications = eligibleBatches.filter(
      b => !existingSet.has(`${b.id_batch}_${b.jenis_notifikasi}`)
    );

    if (newNotifications.length > 0) {
      // Bulk insert new notifications in 1 query
      await prisma.notifikasi_kedaluwarsa.createMany({
        data: newNotifications.map(n => ({
          id_batch: n.id_batch,
          jenis_notifikasi: n.jenis_notifikasi,
          pesan: n.pesan,
          status_baca: false
        }))
      });
    }
  } catch (err) {
    console.error('Error synchronizing expiration notifications:', err);
  }
};

// Live scan and insert low stock alerts into database
const sinkronisasiNotifikasiStokMenipis = async () => {
  try {
    const allProducts = await prisma.produk.findMany({
      where: { status_aktif: true }
    });

    const lowStockProducts = allProducts.filter(p => p.stok_tersedia <= p.stok_minimum);
    const normalProductIds = allProducts.filter(p => p.stok_tersedia > p.stok_minimum).map(p => p.id_produk);

    // Fetch existing low-stock notifications from database (active and soft-deleted)
    const existingNotifs = await prisma.notifikasi_kedaluwarsa.findMany({
      where: { jenis_notifikasi: 'STOK_MENIPIS' }
    });

    const existingMap = new Map();
    existingNotifs.forEach(n => {
      existingMap.set(n.id_produk, n);
    });

    const toInsert = [];
    for (const p of lowStockProducts) {
      if (!existingMap.has(p.id_produk)) {
        const isHabis = p.stok_tersedia === 0;
        const pesan = isHabis
          ? `Stok produk ${p.nama_produk} telah HABIS (Stok: 0). Harap lakukan pengisian ulang barang secepatnya!`
          : `Stok produk ${p.nama_produk} saat ini tersisa ${p.stok_tersedia} ${p.satuan} (di bawah batas minimum ${p.stok_minimum} ${p.satuan}).`;

        toInsert.push({
          id_produk: p.id_produk,
          jenis_notifikasi: 'STOK_MENIPIS',
          pesan: pesan,
          status_baca: false,
          status_hapus: false
        });
      }
    }

    if (toInsert.length > 0) {
      await prisma.notifikasi_kedaluwarsa.createMany({
        data: toInsert
      });
    }

    // If stock has been refilled (normal stock), physically delete the STOK_MENIPIS warnings from DB
    const toDeleteIds = existingNotifs
      .filter(n => normalProductIds.includes(n.id_produk))
      .map(n => n.id_notifikasi);

    if (toDeleteIds.length > 0) {
      await prisma.notifikasi_kedaluwarsa.deleteMany({
        where: { id_notifikasi: { in: toDeleteIds } }
      });
    }
  } catch (err) {
    console.error('Error synchronizing low stock notifications:', err);
  }
};

const sinkronisasiSemuaNotifikasi = async () => {
  const nowTime = Date.now();
  if (nowTime - lastSyncTime < SYNC_COOLDOWN) {
    return; // Skip sync if executed within the last minute
  }
  lastSyncTime = nowTime;

  await sinkronisasiNotifikasiKedaluwarsa();
  await sinkronisasiNotifikasiStokMenipis();
};

const ambilSemuaNotifikasi = async () => {
  // Sync live first
  await sinkronisasiSemuaNotifikasi();

  // Fetch db-based notifications
  const dbRows = await prisma.notifikasi_kedaluwarsa.findMany({
    where: {
      status_hapus: false
    },
    orderBy: { tanggal_notifikasi: 'desc' },
    take: 50,
    include: {
      batch: {
        select: {
          kode_batch: true,
          tanggal_kedaluwarsa: true,
          produk: { select: { nama_produk: true } },
        },
      },
    },
  });
  
  return dbRows.map(mapToLegacyFormat);
};

const hitungBelumDibaca = async () => {
  // Sync live first
  await sinkronisasiSemuaNotifikasi();

  // DB unread count
  const dbCount = await prisma.notifikasi_kedaluwarsa.count({
    where: { status_baca: false, status_hapus: false },
  });

  return dbCount;
};

const tandaiSudahDibaca = async (idNotifikasi) => {
  const idNum = parseInt(idNotifikasi, 10);
  return prisma.notifikasi_kedaluwarsa.update({
    where: { id_notifikasi: idNum },
    data: { status_baca: true },
  });
};

const tandaiSemuaDibaca = async () => {
  return prisma.notifikasi_kedaluwarsa.updateMany({
    where: { status_baca: false, status_hapus: false },
    data: { status_baca: true },
  });
};

const hapusNotifikasi = async (idNotifikasi) => {
  const idNum = parseInt(idNotifikasi, 10);
  return prisma.notifikasi_kedaluwarsa.update({
    where: { id_notifikasi: idNum },
    data: { status_hapus: true }
  });
};

const hapusBeberapaNotifikasi = async (ids) => {
  const realIds = ids.map(id => parseInt(id, 10));
  if (realIds.length === 0) return { count: 0 };

  return prisma.notifikasi_kedaluwarsa.updateMany({
    where: { id_notifikasi: { in: realIds } },
    data: { status_hapus: true }
  });
};

module.exports = {
  ambilSemuaNotifikasi,
  hitungBelumDibaca,
  tandaiSudahDibaca,
  tandaiSemuaDibaca,
  hapusNotifikasi,
  hapusBeberapaNotifikasi,
};
