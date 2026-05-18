const bcrypt = require('bcrypt');
const penggunaRepo = require('../repositories/pengguna.repository');
const cloudinary = require('../config/cloudinary');

const ambilProfil = async (idPengguna) => {
  const pengguna = await penggunaRepo.ambilPenggunaById(idPengguna);
  if (!pengguna) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return pengguna;
};

const perbaruiProfil = async (idPengguna, { nama, no_telepon }) => {
  return penggunaRepo.perbaruiPengguna(idPengguna, { nama, no_telepon });
};

const gantiPassword = async (idPengguna, { passwordLama, passwordBaru }) => {
  const pengguna = await penggunaRepo.cariPenggunaByIdDenganPassword(idPengguna);
  if (!pengguna) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const cocok = await bcrypt.compare(passwordLama, pengguna.password_hash);
  if (!cocok) {
    const err = new Error('Password lama salah');
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(passwordBaru, 10);
  await penggunaRepo.perbaruiPengguna(idPengguna, { password_hash: hash });
};

const gantiEmail = async (idPengguna, { emailBaru, password }) => {
  const pengguna = await penggunaRepo.cariPenggunaByIdDenganPassword(idPengguna);
  if (!pengguna) {
    const err = new Error('Pengguna tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const cocok = await bcrypt.compare(password, pengguna.password_hash);
  if (!cocok) {
    const err = new Error('Password salah');
    err.statusCode = 400;
    throw err;
  }

  const emailSudahAda = await penggunaRepo.cekEmailSudahAda(emailBaru, idPengguna);
  if (emailSudahAda) {
    const err = new Error('Email sudah digunakan akun lain');
    err.statusCode = 400;
    throw err;
  }

  await penggunaRepo.perbaruiPengguna(idPengguna, { email: emailBaru });
};

const uploadFotoProfil = async (idPengguna, fileBuffer, mimetype) => {
  // Upload ke Cloudinary pakai buffer (sesuai upload.middleware.js yang pakai memoryStorage)
  const hasil = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'stok-kedaluwarsa/avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

  await penggunaRepo.perbaruiPengguna(idPengguna, { foto_profil: hasil.secure_url });
  return hasil.secure_url;
};

module.exports = { ambilProfil, perbaruiProfil, gantiPassword, gantiEmail, uploadFotoProfil };