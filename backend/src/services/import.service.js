const { parseExcelBuffer, normalisasiBaris } = require('../utils/excelParser');
const importRepo = require('../repositories/import.repository');

const KOLOM_MASTER_PRODUK = ['nama_kategori', 'nama_produk', 'satuan'];
const KOLOM_STOK_AWAL = ['kode_batch', 'tanggal_masuk', 'tanggal_kedaluwarsa', 'jumlah'];

const validasiBarisMasterProduk = (baris, index) => {
  const errors = [];
  const nomorBaris = index + 2;

  if (!baris.nama_kategori || String(baris.nama_kategori).trim() === '') {
    errors.push(`Baris ${nomorBaris}: nama_kategori wajib diisi`);
  }
  if (!baris.nama_produk || String(baris.nama_produk).trim() === '') {
    errors.push(`Baris ${nomorBaris}: nama_produk wajib diisi`);
  }
  if (!baris.satuan || String(baris.satuan).trim() === '') {
    errors.push(`Baris ${nomorBaris}: satuan wajib diisi`);
  }
  if (baris.stok_minimum !== undefined && baris.stok_minimum !== '') {
    const stokMin = parseInt(baris.stok_minimum, 10);
    if (isNaN(stokMin) || stokMin < 0) {
      errors.push(`Baris ${nomorBaris}: stok_minimum harus >= 0`);
    }
  }

  return errors;
};

const validasiBarisStokAwal = (baris, index) => {
  const errors = [];
  const nomorBaris = index + 2;

  if (!baris.nama_produk && !baris.id_produk) {
    errors.push(`Baris ${nomorBaris}: nama_produk atau id_produk wajib diisi`);
  }
  if (!baris.kode_batch || String(baris.kode_batch).trim() === '') {
    errors.push(`Baris ${nomorBaris}: kode_batch wajib diisi`);
  }
  if (!baris.tanggal_masuk || isNaN(Date.parse(baris.tanggal_masuk))) {
    errors.push(`Baris ${nomorBaris}: tanggal_masuk wajib dan harus valid`);
  }
  if (!baris.tanggal_kedaluwarsa || isNaN(Date.parse(baris.tanggal_kedaluwarsa))) {
    errors.push(`Baris ${nomorBaris}: tanggal_kedaluwarsa wajib dan harus valid`);
  }
  if (baris.tanggal_masuk && baris.tanggal_kedaluwarsa) {
    if (new Date(baris.tanggal_kedaluwarsa) < new Date(baris.tanggal_masuk)) {
      errors.push(`Baris ${nomorBaris}: tanggal_kedaluwarsa tidak boleh sebelum tanggal_masuk`);
    }
  }

  const jumlah = parseInt(baris.jumlah, 10);
  if (!baris.jumlah || isNaN(jumlah) || jumlah <= 0) {
    errors.push(`Baris ${nomorBaris}: jumlah wajib > 0`);
  }

  return errors;
};

const previewImport = async (fileBuffer, mode) => {
  const rawData = parseExcelBuffer(fileBuffer);
  const dataNormalisasi = normalisasiBaris(rawData);

  const kolomWajib = mode === 'MASTER_PRODUK' ? KOLOM_MASTER_PRODUK : KOLOM_STOK_AWAL;
  const validasiFn = mode === 'MASTER_PRODUK' ? validasiBarisMasterProduk : validasiBarisStokAwal;

  if (dataNormalisasi.length === 0) {
    throw Object.assign(new Error('File tidak memiliki data'), { statusCode: 422 });
  }

  const headerFile = Object.keys(dataNormalisasi[0]);
  const headerMissing = kolomWajib.filter((k) => !headerFile.includes(k));

  if (headerMissing.length > 0) {
    throw Object.assign(
      new Error(`Kolom wajib tidak ditemukan: ${headerMissing.join(', ')}`),
      { statusCode: 422 }
    );
  }

  const dataValid = [];
  const dataInvalid = [];
  const dataDuplikat = [];
  const semuaError = [];

  for (let i = 0; i < dataNormalisasi.length; i++) {
    const baris = dataNormalisasi[i];
    const errorBaris = validasiFn(baris, i);

    if (errorBaris.length > 0) {
      dataInvalid.push({ baris: i + 2, data: baris, errors: errorBaris });
      semuaError.push(...errorBaris);
      continue;
    }

    if (mode === 'MASTER_PRODUK') {
      const produkAda = await importRepo.cariProdukByNama(baris.nama_produk);
      if (produkAda) {
        dataDuplikat.push({ baris: i + 2, data: baris, alasan: 'Produk sudah ada' });
        continue;
      }
    }

    if (mode === 'STOK_AWAL_BATCH') {
      let produk;
      if (baris.id_produk) {
        produk = await importRepo.cariProdukById(baris.id_produk);
      } else {
        produk = await importRepo.cariProdukByNama(baris.nama_produk);
      }
      if (!produk) {
        dataInvalid.push({
          baris: i + 2,
          data: baris,
          errors: [`Baris ${i + 2}: Produk tidak ditemukan`],
        });
        continue;
      }
    }

    dataValid.push(baris);
  }

  return {
    total_baris: dataNormalisasi.length,
    jumlah_valid: dataValid.length,
    jumlah_invalid: dataInvalid.length,
    jumlah_duplikat: dataDuplikat.length,
    data_valid: dataValid,
    data_invalid: dataInvalid,
    data_duplikat: dataDuplikat,
    errors: semuaError,
  };
};

const eksekusiImportMasterProduk = async (dataValid) => {
  return importRepo.importMasterProduk(dataValid);
};

const eksekusiImportStokAwal = async (dataValid, idPengguna) => {
  return importRepo.importStokAwalBatch(dataValid, idPengguna);
};

module.exports = { previewImport, eksekusiImportMasterProduk, eksekusiImportStokAwal };
