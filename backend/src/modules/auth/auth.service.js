const bcrypt = require('bcrypt');
const { buatAccessToken, buatRefreshToken } = require('../../utils/jwt');
const penggunaRepo = require('./auth.repository');

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

// ═══ Forgot Password — In-Memory OTP Store ═══
const crypto = require('crypto');
const otpStore = new Map(); // key: email, value: { otp, expiresAt }
const OTP_TTL_MS = 5 * 60 * 1000; // 5 menit

const requestResetPassword = async (email) => {
  const pengguna = await penggunaRepo.cariPenggunaByEmail(email);

  // Jangan ungkap apakah email terdaftar atau tidak (anti-enumeration)
  if (!pengguna || !pengguna.status_aktif) {
    return { message: 'Jika email terdaftar, kode OTP akan dikirim.' };
  }

  const otp = String(crypto.randomInt(100000, 999999));
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  // Log OTP ke console untuk keperluan demo (pengganti email service)
  console.log(`[RESET PASSWORD] OTP untuk ${email}: ${otp} (berlaku 5 menit)`);

  return { message: 'Jika email terdaftar, kode OTP akan dikirim.' };
};

const verifyOtp = async (email, otp) => {
  const emailLower = email.toLowerCase();
  const record = otpStore.get(emailLower);

  if (!record) {
    const error = new Error('Kode OTP tidak valid atau sudah kedaluwarsa.');
    error.statusCode = 400;
    throw error;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(emailLower);
    const error = new Error('Kode OTP tidak valid atau sudah kedaluwarsa.');
    error.statusCode = 400;
    throw error;
  }

  if (record.otp !== otp) {
    const error = new Error('Kode OTP tidak valid atau sudah kedaluwarsa.');
    error.statusCode = 400;
    throw error;
  }

  // OTP valid — jangan hapus dulu, akan dipakai di step reset
  return { message: 'Kode OTP berhasil diverifikasi.' };
};

const resetPassword = async (email, otp, passwordBaru) => {
  // Verifikasi ulang OTP untuk keamanan
  const emailLower = email.toLowerCase();
  const record = otpStore.get(emailLower);

  if (!record || Date.now() > record.expiresAt || record.otp !== otp) {
    otpStore.delete(emailLower);
    const error = new Error('Sesi reset password tidak valid. Silakan ulangi proses.');
    error.statusCode = 400;
    throw error;
  }

  const pengguna = await penggunaRepo.cariPenggunaByEmail(emailLower);
  if (!pengguna) {
    const error = new Error('Pengguna tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const hash = await bcrypt.hash(passwordBaru, 10);
  await penggunaRepo.perbaruiPengguna(pengguna.id_pengguna, { password_hash: hash });

  // Hapus OTP setelah berhasil reset
  otpStore.delete(emailLower);

  return { message: 'Password berhasil diperbarui.' };
};

module.exports = { login, refreshSession, ambilProfil, requestResetPassword, verifyOtp, resetPassword };
