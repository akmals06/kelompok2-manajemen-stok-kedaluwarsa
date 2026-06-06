const kategoriService = require('../services/category.service');

const buatKategori = async (req, res, next) => {
  try {
    const fileBuffer = req.file ? req.file.buffer : null;
    const hasil = await kategoriService.buatKategori(req.body, fileBuffer);
    res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilSemuaKategori = async (req, res, next) => {
  try {
    const hasil = await kategoriService.ambilSemuaKategori();
    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilKategoriById = async (req, res, next) => {
  try {
    const hasil = await kategoriService.ambilKategoriById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const updateKategori = async (req, res, next) => {
  try {
    const fileBuffer = req.file ? req.file.buffer : null;
    const hasil = await kategoriService.updateKategori(req.params.id, req.body, fileBuffer);
    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const hapusKategori = async (req, res, next) => {
  try {
    const hasil = await kategoriService.hapusKategori(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  buatKategori,
  ambilSemuaKategori,
  ambilKategoriById,
  updateKategori,
  hapusKategori,
};
