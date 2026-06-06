const prisma = require('../config/prisma');

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
    batch: row.batch || null,
  };
};

let lastSyncTime = 0;
const SYNC_COOLDOWN = 60 * 1000; // Cooldown sync 1 menit untuk performance

const sinkronisasiNotifikasiKedaluwarsa = async () => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

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
    // Ambil SEMUA notifikasi (termasuk yang sudah dihapus) agar tidak bikin duplikat
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
      await prisma.notifikasi_kedaluwarsa.createMany({
        data: newNotifications.map(n => ({
          id_batch: n.id_batch,
          jenis_notifikasi: n.jenis_notifikasi,
          pesan: n.pesan,
          status_baca: false
        }))
      });
    }

    // Hapus notifikasi batch yang sudah diarsipkan/habis
    const activeBatchIds = activeBatches.map(b => b.id_batch);
    await prisma.notifikasi_kedaluwarsa.deleteMany({
      where: {
        jenis_notifikasi: { in: ['KEDALUWARSA', 'MENDEKATI_KEDALUWARSA'] },
        id_batch: { notIn: activeBatchIds }
      }
    });
  } catch (err) {
    console.error('Error synchronizing expiration notifications:', err);
  }
};

const sinkronisasiNotifikasiStokMenipis = async () => {
  try {
    const allProducts = await prisma.produk.findMany({
      where: { status_aktif: true }
    });

    const lowStockProducts = allProducts.filter(p => p.stok_tersedia < p.stok_minimum);
    const normalProductIds = allProducts.filter(p => p.stok_tersedia >= p.stok_minimum).map(p => p.id_produk);

    // Ambil SEMUA notifikasi stok menipis (termasuk yang sudah dihapus user)
    // agar tidak membuat ulang notifikasi yang sengaja dihapus
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

    // Hapus permanen notifikasi stok menipis untuk produk yang stoknya sudah normal
    // (hard delete agar bisa dibuat ulang nanti jika stok turun lagi)
    const toDeleteIds = existingNotifs
      .filter(n => normalProductIds.includes(n.id_produk))
      .map(n => n.id_notifikasi);

    if (toDeleteIds.length > 0) {
      await prisma.notifikasi_kedaluwarsa.deleteMany({
        where: { id_notifikasi: { in: toDeleteIds } }
      });
    }

    // Hapus notifikasi stok menipis untuk produk nonaktif
    const activeProductIds = allProducts.map(p => p.id_produk);
    await prisma.notifikasi_kedaluwarsa.deleteMany({
      where: {
        jenis_notifikasi: 'STOK_MENIPIS',
        id_produk: { notIn: activeProductIds }
      }
    });
  } catch (err) {
    console.error('Error synchronizing low stock notifications:', err);
  }
};

const sinkronisasiSemuaNotifikasi = async () => {
  const nowTime = Date.now();
  if (nowTime - lastSyncTime < SYNC_COOLDOWN) {
    return;
  }
  lastSyncTime = nowTime;

  await sinkronisasiNotifikasiKedaluwarsa();
  await sinkronisasiNotifikasiStokMenipis();
};

const ambilSemuaNotifikasi = async () => {
  await sinkronisasiSemuaNotifikasi();

  const dbRows = await prisma.notifikasi_kedaluwarsa.findMany({
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
  await sinkronisasiSemuaNotifikasi();

  const dbCount = await prisma.notifikasi_kedaluwarsa.count({
    where: { status_baca: false },
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
    where: { status_baca: false },
    data: { status_baca: true },
  });
};

const hapusNotifikasi = async (idNotifikasi) => {
  const idNum = parseInt(idNotifikasi, 10);
  return prisma.notifikasi_kedaluwarsa.delete({
    where: { id_notifikasi: idNum }
  });
};

const hapusBeberapaNotifikasi = async (ids) => {
  const realIds = ids.map(id => parseInt(id, 10));
  if (realIds.length === 0) return { count: 0 };

  return prisma.notifikasi_kedaluwarsa.deleteMany({
    where: { id_notifikasi: { in: realIds } }
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
