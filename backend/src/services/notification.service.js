const notifikasiRepo = require('../repositories/notification.repository');

const ambilSemuaNotifikasi = async () => {
  return notifikasiRepo.ambilSemuaNotifikasi();
};

const hitungBelumDibaca = async () => {
  return notifikasiRepo.hitungBelumDibaca();
};

const tandaiSudahDibaca = async (idNotifikasi) => {
  return notifikasiRepo.tandaiSudahDibaca(idNotifikasi);
};

const tandaiSemuaDibaca = async () => {
  return notifikasiRepo.tandaiSemuaDibaca();
};

const hapusNotifikasi = async (idNotifikasi) => {
  return notifikasiRepo.hapusNotifikasi(idNotifikasi);
};

const hapusBeberapaNotifikasi = async (ids) => {
  return notifikasiRepo.hapusBeberapaNotifikasi(ids);
};

module.exports = {
  ambilSemuaNotifikasi,
  hitungBelumDibaca,
  tandaiSudahDibaca,
  tandaiSemuaDibaca,
  hapusNotifikasi,
  hapusBeberapaNotifikasi,
};
