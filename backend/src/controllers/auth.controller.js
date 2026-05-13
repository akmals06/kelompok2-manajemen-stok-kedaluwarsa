const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hasil = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: hasil,
    });
  } catch (err) {
    next(err);
  }
};

const ambilProfil = async (req, res, next) => {
  try {
    const pengguna = await authService.ambilProfil(req.user.id_pengguna);

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diambil',
      data: pengguna,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, ambilProfil };
