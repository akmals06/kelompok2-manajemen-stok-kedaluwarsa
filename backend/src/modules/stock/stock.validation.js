const validasiStokMasuk = (req, res, next) => {
  const { id_produk, jumlah, sumber_masuk, batch } = req.body;
  const errors = [];

  if (!id_produk || isNaN(parseInt(id_produk, 10))) {
    errors.push('ID produk wajib diisi dan harus berupa angka');
  }

  if (!jumlah || isNaN(parseInt(jumlah, 10)) || parseInt(jumlah, 10) <= 0) {
    errors.push('Jumlah wajib diisi dan harus lebih dari 0');
  }

  if (!sumber_masuk || typeof sumber_masuk !== 'string' || sumber_masuk.trim() === '') {
    errors.push('Sumber masuk wajib diisi');
  }

  if (batch) {
    if (!batch.kode_batch || typeof batch.kode_batch !== 'string' || batch.kode_batch.trim() === '') {
      errors.push('Kode batch wajib diisi jika batch dipakai');
    }

    if (!batch.tanggal_masuk) {
      errors.push('Tanggal masuk batch wajib diisi');
    } else if (isNaN(Date.parse(batch.tanggal_masuk))) {
      errors.push('Tanggal masuk batch tidak valid');
    }

    if (!batch.tanggal_kedaluwarsa) {
      errors.push('Tanggal kedaluwarsa batch wajib diisi');
    } else if (isNaN(Date.parse(batch.tanggal_kedaluwarsa))) {
      errors.push('Tanggal kedaluwarsa batch tidak valid');
    }

    if (batch.tanggal_masuk && batch.tanggal_kedaluwarsa) {
      const tglMasuk = new Date(batch.tanggal_masuk);
      const tglExp = new Date(batch.tanggal_kedaluwarsa);
      if (tglExp < tglMasuk) {
        errors.push('Tanggal kedaluwarsa tidak boleh lebih awal dari tanggal masuk');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors,
    });
  }

  next();
};

const validasiStokKeluar = (req, res, next) => {
  const { id_produk, jumlah, tujuan_keluar, id_batch } = req.body;
  const errors = [];

  if (!id_produk || isNaN(parseInt(id_produk, 10))) {
    errors.push('ID produk wajib diisi dan harus berupa angka');
  }

  if (!tujuan_keluar || typeof tujuan_keluar !== 'string' || tujuan_keluar.trim() === '') {
    errors.push('Tujuan keluar wajib diisi');
  }

  if (id_batch !== undefined && id_batch !== null && isNaN(parseInt(id_batch, 10))) {
    errors.push('ID batch harus berupa angka jika diisi');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors,
    });
  }

  if (jumlah === undefined || jumlah === null || isNaN(parseInt(jumlah, 10))) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: ['Jumlah wajib diisi dan harus berupa angka'],
    });
  }

  if (parseInt(jumlah, 10) <= 0) {
    return res.status(422).json({
      success: false,
      message: 'Jumlah keluar tidak boleh nol atau negatif',
      errors: ['Jumlah keluar tidak boleh nol atau negatif'],
    });
  }

  next();
};

module.exports = { validasiStokMasuk, validasiStokKeluar };
