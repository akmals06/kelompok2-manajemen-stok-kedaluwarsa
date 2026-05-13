const bcrypt = require('bcrypt');
const { buatToken } = require('../utils/jwt');
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

  const token = buatToken({
    id_pengguna: pengguna.id_pengguna,
    email: pengguna.email,
    peran: pengguna.peran,
  });

  return {
    token,
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

module.exports = { login, ambilProfil };
