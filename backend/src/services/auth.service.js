const bcrypt = require('bcrypt');
const { buatAccessToken, buatRefreshToken } = require('../utils/jwt');
const penggunaRepo = require('../repositories/pengguna.repository');

const login = async (email, password) => {
  const pengguna = await penggunaRepo.cariPenggunaByEmail(email);

  if (!pengguna) {
    const error = new Error('Email atau password salah');
    error.statusCode = 401;
    throw error;
  }

  if (!pengguna.status_aktif) {
    const error = new Error('Akun tidak aktif');
    error.statusCode = 401;
    throw error;
  }

  const cocok = await bcrypt.compare(password, pengguna.password_hash);

  if (!cocok) {
    const error = new Error('Email atau password salah');
    error.statusCode = 401;
    throw error;
  }

  const payloadAccess = {
    id_pengguna: pengguna.id_pengguna,
    email: pengguna.email,
    peran: pengguna.peran,
  };

  const accessToken = buatAccessToken(payloadAccess);
  const refreshToken = buatRefreshToken({ id_pengguna: pengguna.id_pengguna });

  return {
    accessToken,
    refreshToken,
    pengguna: {
      id_pengguna: pengguna.id_pengguna,
      nama: pengguna.nama,
      email: pengguna.email,
      peran: pengguna.peran,
    },
  };
};

const refreshSession = async (idPengguna) => {
  const pengguna = await penggunaRepo.ambilPenggunaById(idPengguna);

  if (!pengguna) {
    const error = new Error('Pengguna tidak ditemukan');
    error.statusCode = 401;
    throw error;
  }

  if (!pengguna.status_aktif) {
    const error = new Error('Akun tidak aktif');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = buatAccessToken({
    id_pengguna: pengguna.id_pengguna,
    email: pengguna.email,
    peran: pengguna.peran,
  });

  return {
    accessToken,
    pengguna: {
      id_pengguna: pengguna.id_pengguna,
      nama: pengguna.nama,
      email: pengguna.email,
      peran: pengguna.peran,
    },
  };
};

const ambilProfil = async (idPengguna) => {
  const pengguna = await penggunaRepo.ambilPenggunaById(idPengguna);

  if (!pengguna) {
    const error = new Error('Pengguna tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return pengguna;
};

module.exports = { login, refreshSession, ambilProfil };
