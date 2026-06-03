const batchRepo = require('./batch.repository');
const { BATCH_STATUS, NEAR_EXPIRY_DAYS } = require('../../constants/batch.constant');
const { isExpired, isNearExpiry } = require('../../utils/date');

const hitungStatusBatch = (tanggalKedaluwarsa) => {
  if (isExpired(tanggalKedaluwarsa)) return BATCH_STATUS.KEDALUWARSA;
  if (isNearExpiry(tanggalKedaluwarsa, NEAR_EXPIRY_DAYS)) return BATCH_STATUS.MENDEKATI_KEDALUWARSA;
  return BATCH_STATUS.AKTIF;
};

const ambilSemuaBatch = async () => {
  const daftarBatch = await batchRepo.ambilSemuaBatch();

  return daftarBatch.map((batch) => {
    if ([BATCH_STATUS.DIARSIPKAN, BATCH_STATUS.DITOLAK].includes(batch.status_batch)) return batch;

    const statusTerhitung = hitungStatusBatch(batch.tanggal_kedaluwarsa);
    return { ...batch, status_batch: statusTerhitung };
  });
};

const ambilBatchById = async (idBatch) => {
  const batch = await batchRepo.ambilBatchById(idBatch);

  if (!batch) {
    throw Object.assign(new Error('Batch tidak ditemukan'), { statusCode: 404 });
  }

  if (![BATCH_STATUS.DIARSIPKAN, BATCH_STATUS.DITOLAK].includes(batch.status_batch)) {
    batch.status_batch = hitungStatusBatch(batch.tanggal_kedaluwarsa);
  }

  return batch;
};

const updateBatch = async (idBatch, data) => {
  const batch = await batchRepo.ambilBatchById(idBatch);

  if (!batch) {
    throw Object.assign(new Error('Batch tidak ditemukan'), { statusCode: 404 });
  }

  const payload = {};
  if (data.kode_batch !== undefined) payload.kode_batch = data.kode_batch;
  if (data.tanggal_masuk !== undefined) payload.tanggal_masuk = new Date(data.tanggal_masuk);
  if (data.tanggal_kedaluwarsa !== undefined) payload.tanggal_kedaluwarsa = new Date(data.tanggal_kedaluwarsa);

  if (payload.tanggal_masuk && payload.tanggal_kedaluwarsa) {
    if (payload.tanggal_kedaluwarsa < payload.tanggal_masuk) {
      throw Object.assign(
        new Error('Tanggal kedaluwarsa tidak boleh lebih awal dari tanggal masuk'),
        { statusCode: 422 }
      );
    }
  }

  return batchRepo.updateBatch(idBatch, payload);
};

const arsipkanBatch = async (idBatch) => {
  const batch = await batchRepo.ambilBatchById(idBatch);

  if (!batch) {
    throw Object.assign(new Error('Batch tidak ditemukan'), { statusCode: 404 });
  }

  const statusSekarang = hitungStatusBatch(batch.tanggal_kedaluwarsa);

  if (batch.status_batch === BATCH_STATUS.DIARSIPKAN) {
    throw Object.assign(new Error('Batch sudah diarsipkan'), { statusCode: 422 });
  }

  // Hanya batch kedaluwarsa dengan jumlah 0 yang boleh diarsipkan
  if (statusSekarang !== BATCH_STATUS.KEDALUWARSA) {
    throw Object.assign(new Error('Hanya batch kedaluwarsa yang dapat diarsipkan'), { statusCode: 422 });
  }

  if (batch.jumlah_sisa > 0) {
    throw Object.assign(
      new Error('Batch kedaluwarsa yang masih memiliki jumlah tidak dapat diarsipkan'),
      { statusCode: 422 }
    );
  }

  return batchRepo.updateStatusBatch(idBatch, BATCH_STATUS.DIARSIPKAN);
};

const refreshSemuaStatusBatch = async () => {
  const daftarBatch = await batchRepo.ambilBatchUntukRefresh();
  let diperbarui = 0;

  for (const batch of daftarBatch) {
    const statusBaru = hitungStatusBatch(batch.tanggal_kedaluwarsa);

    if (statusBaru !== batch.status_batch) {
      await batchRepo.updateStatusBatch(batch.id_batch, statusBaru);
      diperbarui++;
    }
  }

  return { diperbarui };
};

module.exports = {
  ambilSemuaBatch,
  ambilBatchById,
  updateBatch,
  arsipkanBatch,
  hitungStatusBatch,
  refreshSemuaStatusBatch,
};
