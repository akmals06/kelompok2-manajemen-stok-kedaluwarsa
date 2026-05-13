const stokMasukService = require('../services/stokMasuk.service');
const stokKeluarService = require('../services/stokKeluar.service');

const buatStokMasuk = async (req, res, next) => {
  try {
    const hasil = await stokMasukService.buatStokMasuk(req.user.id_pengguna, req.body);

    res.status(201).json({
      success: true,
      message: 'Stok masuk berhasil dicatat',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilDaftarStokMasuk = async (req, res, next) => {
  try {
    const hasil = await stokMasukService.ambilDaftarStokMasuk();

    res.status(200).json({
      success: true,
      message: 'Daftar stok masuk berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const buatStokKeluar = async (req, res, next) => {
  try {
    const hasil = await stokKeluarService.buatStokKeluar(req.user.id_pengguna, req.body);

    res.status(201).json({
      success: true,
      message: 'Stok keluar berhasil dicatat',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilDaftarStokKeluar = async (req, res, next) => {
  try {
    const hasil = await stokKeluarService.ambilDaftarStokKeluar();

    res.status(200).json({
      success: true,
      message: 'Daftar stok keluar berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  buatStokMasuk,
  ambilDaftarStokMasuk,
  buatStokKeluar,
  ambilDaftarStokKeluar,
};
