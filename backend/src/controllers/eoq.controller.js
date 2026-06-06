const eoqService = require('../services/eoq.service');

const hitungEoq = async (req, res, next) => {
  try {
    const idPengguna = req.user ? req.user.id_pengguna : null;
    const hasil = await eoqService.hitungEoq(req.body, idPengguna);

    res.status(201).json({
      success: true,
      message: 'Analisis EOQ berhasil dihitung',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilRiwayatEoq = async (req, res, next) => {
  try {
    const idProduk = req.query.id_produk || null;
    const hasil = await eoqService.ambilRiwayatEoq(idProduk);

    res.status(200).json({
      success: true,
      message: 'Riwayat analisis EOQ berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { hitungEoq, ambilRiwayatEoq };
