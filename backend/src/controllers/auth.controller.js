const authService = require('../services/auth.service');
const { verifikasiRefreshToken } = require('../utils/jwt');
const config = require('../config/env');

const cookieOpsRefreshToken = () => {
  const production = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hasil = await authService.login(email, password);

    res.cookie('refreshToken', hasil.refreshToken, cookieOpsRefreshToken());

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        accessToken: hasil.accessToken,
        pengguna: hasil.pengguna,
      },
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak ditemukan',
      });
    }

    let decoded;
    try {
      decoded = verifikasiRefreshToken(token);
    } catch (err) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Refresh token tidak valid atau sudah kedaluwarsa',
      });
    }

    const hasil = await authService.refreshSession(decoded.id_pengguna);

    res.status(200).json({
      success: true,
      message: 'Token diperbarui',
      data: {
        accessToken: hasil.accessToken,
        pengguna: hasil.pengguna,
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      path: '/api/auth',
    });

    res.status(200).json({
      success: true,
      message: 'Logout berhasil',
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

module.exports = { login, refresh, logout, ambilProfil };
