const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

// Menangani pendaftaran pengguna baru
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.registerUser(email, password, name);
    return successResponse(res, 'Akun berhasil didaftarkan. Silakan login.', result, 201);
  } catch (error) {
    next(error);
  }
};

// Menangani proses login dan pemberian token
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return successResponse(res, 'Login berhasil. Selamat datang kembali!', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
