const riwayatRepo = require('../repositories/riwayat.repository');

const ambilSemuaRiwayat = async () => {
  return riwayatRepo.ambilSemuaRiwayat();
};

module.exports = { ambilSemuaRiwayat };
