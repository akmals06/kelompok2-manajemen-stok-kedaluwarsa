const laporanService = require('../services/laporan.service');

const ambilRingkasanStok = async (req, res, next) => {
  try {
    const hasil = await laporanService.ambilRingkasanStok();

    res.status(200).json({
      success: true,
      message: 'Ringkasan stok berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const buatLaporanInventaris = async (req, res, next) => {
  try {
    const hasil = await laporanService.buatLaporanInventaris(req.body);

    res.status(201).json({
      success: true,
      message: 'Laporan inventaris berhasil dibuat',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilSemuaLaporan = async (req, res, next) => {
  try {
    const hasil = await laporanService.ambilSemuaLaporan();

    res.status(200).json({
      success: true,
      message: 'Daftar laporan berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilLaporanById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const hasil = await laporanService.ambilLaporanById(id);

    res.status(200).json({
      success: true,
      message: 'Detail laporan berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilRingkasanDashboard = async (req, res, next) => {
  try {
    const hasil = await laporanService.ambilRingkasanDashboard();

    res.status(200).json({
      success: true,
      message: 'Ringkasan dashboard berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { ambilRingkasanStok, buatLaporanInventaris, ambilSemuaLaporan, ambilRingkasanDashboard, ambilLaporanById };
