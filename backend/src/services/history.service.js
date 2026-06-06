const riwayatRepo = require('../repositories/history.repository');

const ambilSemuaRiwayat = async () => {
  return riwayatRepo.ambilSemuaRiwayat();
};

module.exports = { ambilSemuaRiwayat };
