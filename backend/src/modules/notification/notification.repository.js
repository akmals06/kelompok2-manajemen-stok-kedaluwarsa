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

const ambilSemuaNotifikasi = async () => {
  const rows = await prisma.notifikasi_kedaluwarsa.findMany({
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
  return rows.map(mapToLegacyFormat);
};

const hitungBelumDibaca = async () => {
  return prisma.notifikasi_kedaluwarsa.count({
    where: { status_baca: false },
  });
};

const tandaiSudahDibaca = async (idNotifikasi) => {
  return prisma.notifikasi_kedaluwarsa.update({
    where: { id_notifikasi: parseInt(idNotifikasi, 10) },
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
  return prisma.notifikasi_kedaluwarsa.delete({
    where: { id_notifikasi: parseInt(idNotifikasi, 10) },
  });
};

const hapusBeberapaNotifikasi = async (ids) => {
  return prisma.notifikasi_kedaluwarsa.deleteMany({
    where: { id_notifikasi: { in: ids.map(id => parseInt(id, 10)) } },
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
