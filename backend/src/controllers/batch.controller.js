const batchService = require('../services/batch.service');

const ambilSemuaBatch = async (req, res, next) => {
  try {
    const hasil = await batchService.ambilSemuaBatch();

    res.status(200).json({
      success: true,
      message: 'Daftar batch berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilBatchById = async (req, res, next) => {
  try {
    const hasil = await batchService.ambilBatchById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Detail batch berhasil diambil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const hasil = await batchService.updateBatch(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Batch berhasil diperbarui',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const arsipkanBatch = async (req, res, next) => {
  try {
    const hasil = await batchService.arsipkanBatch(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Batch berhasil diarsipkan',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const refreshStatusBatch = async (req, res, next) => {
  try {
    const hasil = await batchService.refreshSemuaStatusBatch();

    res.status(200).json({
      success: true,
      message: 'Status batch diperbarui',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ambilSemuaBatch,
  ambilBatchById,
  updateBatch,
  arsipkanBatch,
  refreshStatusBatch,
};
