const validasiLaporanPeriode = (req, res, next) => {
  const { periode_awal, periode_akhir } = req.body;
  const errors = [];

  if (!periode_awal) {
    errors.push('Periode awal wajib diisi');
  } else if (isNaN(Date.parse(periode_awal))) {
    errors.push('Periode awal tidak valid');
  }

  if (!periode_akhir) {
    errors.push('Periode akhir wajib diisi');
  } else if (isNaN(Date.parse(periode_akhir))) {
    errors.push('Periode akhir tidak valid');
  }

  if (periode_awal && periode_akhir) {
    if (new Date(periode_akhir) < new Date(periode_awal)) {
      errors.push('Periode akhir tidak boleh lebih awal dari periode awal');
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

module.exports = { validasiLaporanPeriode };
