const riwayatService = require('./history.service');

const ambilSemuaRiwayat = async (req, res, next) => {
  try {
    const hasil = await riwayatService.ambilSemuaRiwayat();

    res.status(200).json({
      success: true,
      message: 'Riwayat pergerakan stok berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { ambilSemuaRiwayat };
