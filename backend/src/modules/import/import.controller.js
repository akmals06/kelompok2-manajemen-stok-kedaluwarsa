const importService = require('./import.service');

const previewImport = async (req, res, next) => {
  try {
    const { mode } = req.body;
    const fileBuffer = req.file.buffer;

    const hasil = await importService.previewImport(fileBuffer, mode);

    res.status(200).json({
      success: true,
      message: 'Preview import berhasil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const eksekusiImport = async (req, res, next) => {
  try {
    const { mode, data_valid } = req.body;
    let hasil;

    if (mode === 'MASTER_PRODUK') {
      hasil = await importService.eksekusiImportMasterProduk(data_valid);
    } else if (mode === 'STOK_AWAL_BATCH') {
      hasil = await importService.eksekusiImportStokAwal(data_valid, req.user.id_pengguna);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Mode import tidak valid',
        errors: ['Pilih MASTER_PRODUK atau STOK_AWAL_BATCH'],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Import berhasil dijalankan',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { previewImport, eksekusiImport };
