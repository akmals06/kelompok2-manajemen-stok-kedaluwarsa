const riwayatRepo = require('./history.repository');

const ambilSemuaRiwayat = async () => {
  return riwayatRepo.ambilSemuaRiwayat();
};

module.exports = { ambilSemuaRiwayat };
