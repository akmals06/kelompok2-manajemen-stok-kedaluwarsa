const notifikasiRepo = require('../repositories/notifikasi.repository');

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

module.exports = {
  ambilSemuaNotifikasi,
  hitungBelumDibaca,
  tandaiSudahDibaca,
  tandaiSemuaDibaca,
};
