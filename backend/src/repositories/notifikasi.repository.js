const prisma = require('../config/prisma');

const ambilSemuaNotifikasi = async () => {
  return prisma.notifikasi.findMany({
    orderBy: { created_at: 'desc' },
    take: 50,
  });
};

const hitungBelumDibaca = async () => {
  return prisma.notifikasi.count({
    where: { dibaca: false },
  });
};

const tandaiSudahDibaca = async (idNotifikasi) => {
  return prisma.notifikasi.update({
    where: { id_notifikasi: parseInt(idNotifikasi, 10) },
    data: { dibaca: true },
  });
};

const tandaiSemuaDibaca = async () => {
  return prisma.notifikasi.updateMany({
    where: { dibaca: false },
    data: { dibaca: true },
  });
};

module.exports = {
  ambilSemuaNotifikasi,
  hitungBelumDibaca,
  tandaiSudahDibaca,
  tandaiSemuaDibaca,
};
