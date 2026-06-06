const notifikasiService = require('../services/notification.service');

const ambilSemuaNotifikasi = async (req, res, next) => {
  try {
    const notifikasi = await notifikasiService.ambilSemuaNotifikasi();
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil notifikasi',
      data: notifikasi,
    });
  } catch (err) {
    next(err);
  }
};

const hitungBelumDibaca = async (req, res, next) => {
  try {
    const jumlah = await notifikasiService.hitungBelumDibaca();
    res.status(200).json({
      success: true,
      data: { belum_dibaca: jumlah },
    });
  } catch (err) {
    next(err);
  }
};

const tandaiSudahDibaca = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notifikasiService.tandaiSudahDibaca(id);
    res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca',
    });
  } catch (err) {
    next(err);
  }
};

const tandaiSemuaDibaca = async (req, res, next) => {
  try {
    await notifikasiService.tandaiSemuaDibaca();
    res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai sudah dibaca',
    });
  } catch (err) {
    next(err);
  }
};

const hapusNotifikasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notifikasiService.hapusNotifikasi(id);
    res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil dihapus',
    });
  } catch (err) {
    next(err);
  }
};

const hapusBeberapaNotifikasi = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs tidak valid' });
    }
    await notifikasiService.hapusBeberapaNotifikasi(ids);
    res.status(200).json({
      success: true,
      message: 'Notifikasi terpilih berhasil dihapus',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ambilSemuaNotifikasi,
  hitungBelumDibaca,
  tandaiSudahDibaca,
  tandaiSemuaDibaca,
  hapusNotifikasi,
  hapusBeberapaNotifikasi,
};
