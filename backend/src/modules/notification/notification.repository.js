const prisma = require('../../config/prisma');

// Mapping jenis_notifikasi → judul dan tipe untuk kompatibilitas frontend
const JUDUL_MAP = {
  MENDEKATI_KEDALUWARSA: 'Peringatan Mendekati Kedaluwarsa',
  KEDALUWARSA: 'Batch Kedaluwarsa',
};

const TIPE_MAP = {
  MENDEKATI_KEDALUWARSA: 'KEDALUWARSA',
  KEDALUWARSA: 'KEDALUWARSA',
};

// Map row notifikasi_kedaluwarsa → format kompatibel frontend
const mapToLegacyFormat = (row) => ({
  id_notifikasi: row.id_notifikasi,
  judul: JUDUL_MAP[row.jenis_notifikasi] || row.jenis_notifikasi,
  pesan: row.pesan,
  tipe: TIPE_MAP[row.jenis_notifikasi] || 'PERINGATAN',
  dibaca: row.status_baca,
  created_at: row.tanggal_notifikasi,
  // Data tambahan untuk konteks
  batch: row.batch || null,
});

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
        // Check if this notification already exists in the database
        const existing = await prisma.notifikasi_kedaluwarsa.findFirst({
          where: {
            id_batch: batch.id_batch,
            jenis_notifikasi: jenis
          }
        });

        if (!existing) {
          await prisma.notifikasi_kedaluwarsa.create({
            data: {
              id_batch: batch.id_batch,
              jenis_notifikasi: jenis,
              pesan: pesan,
              status_baca: false
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error synchronizing expiration notifications:', err);
  }
};

// Live scan and generate low stock warnings programmatically
const ambilNotifikasiStokMenipis = async () => {
  try {
    const allProducts = await prisma.produk.findMany({
      where: { status_aktif: true },
      include: { kategori: { select: { nama_kategori: true } } }
    });

    const lowStock = allProducts.filter(p => p.stok_tersedia <= p.stok_minimum);

    return lowStock.map(p => {
      const isHabis = p.stok_tersedia === 0;
      const pesan = isHabis
        ? `Stok produk ${p.nama_produk} telah HABIS (Stok: 0). Harap lakukan pengisian ulang barang secepatnya!`
        : `Stok produk ${p.nama_produk} saat ini tersisa ${p.stok_tersedia} ${p.satuan} (di bawah batas minimum ${p.stok_minimum} ${p.satuan}).`;

      return {
        id_notifikasi: 200000 + p.id_produk, // Generate a unique virtual ID to avoid UI collisions
        judul: isHabis ? 'Peringatan Stok Habis' : 'Peringatan Stok Menipis',
        pesan: pesan,
        tipe: 'PERINGATAN', // Uses warning alert indicator in UI
        dibaca: false, // Remains active until stock is refilled
        created_at: p.updated_at,
        batch: null
      };
    });
  } catch (err) {
    console.error('Error fetching low stock notifications:', err);
    return [];
  }
};

const ambilSemuaNotifikasi = async () => {
  // Sync expiration statuses live
  await sinkronisasiNotifikasiKedaluwarsa();

  // Fetch db-based notifications
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
  
  const dbNotifs = dbRows.map(mapToLegacyFormat);

  // Fetch live low-stock warnings
  const stockNotifs = await ambilNotifikasiStokMenipis();

  // Merge and sort by newest first
  const combined = [...stockNotifs, ...dbNotifs];
  combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return combined;
};

const hitungBelumDibaca = async () => {
  // Sync live first
  await sinkronisasiNotifikasiKedaluwarsa();

  // DB unread count
  const dbCount = await prisma.notifikasi_kedaluwarsa.count({
    where: { status_baca: false },
  });

  // Active low-stock alerts count
  const stockAlerts = await ambilNotifikasiStokMenipis();

  return dbCount + stockAlerts.length;
};

const tandaiSudahDibaca = async (idNotifikasi) => {
  const idNum = parseInt(idNotifikasi, 10);
  // Virtual IDs (low stock) cannot be marked as read because they depend on physical stock levels
  if (idNum >= 200000) return true;

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
  if (idNum >= 200000) return true;

  return prisma.notifikasi_kedaluwarsa.delete({
    where: { id_notifikasi: idNum },
  });
};

const hapusBeberapaNotifikasi = async (ids) => {
  const realIds = ids.map(id => parseInt(id, 10)).filter(id => id < 200000);
  if (realIds.length === 0) return { count: 0 };

  return prisma.notifikasi_kedaluwarsa.deleteMany({
    where: { id_notifikasi: { in: realIds } },
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
