const penggunaRepository = require('../pengguna/pengguna.repository');
const { comparePassword } = require('../../utils/password');
const { signToken } = require('../../utils/token');
const AppError = require('../../utils/appError');

const loginUser = async (email, password) => {
  const user = await penggunaRepository.findByEmail(email);

  if (!user || !user.status_aktif) {
    throw new AppError('Email atau password salah.', 401);
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Email atau password salah.', 401);
  }

  const token = signToken({
    id: user.id_pengguna,
    email: user.email,
    role: user.peran,
  });

  return {
    token,
    user: {
      id: user.id_pengguna,
      nama: user.nama,
      email: user.email,
      peran: user.peran,
    },
  };
};

module.exports = { loginUser };
