const penggunaService = require('./user.service');

const ambilProfil = async (req, res, next) => {
  try {
    const data = await penggunaService.ambilProfil(req.user.id_pengguna);
    res.status(200).json({ success: true, message: 'Profil berhasil diambil', data });
  } catch (err) { next(err); }
};

const perbaruiProfil = async (req, res, next) => {
  try {
    const { nama, no_telepon } = req.body;
    const data = await penggunaService.perbaruiProfil(req.user.id_pengguna, { nama, no_telepon });
    res.status(200).json({ success: true, message: 'Profil berhasil diperbarui', data });
  } catch (err) { next(err); }
};

const gantiPassword = async (req, res, next) => {
  try {
    const { passwordLama, passwordBaru } = req.body;
    await penggunaService.gantiPassword(req.user.id_pengguna, { passwordLama, passwordBaru });
    res.status(200).json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) { next(err); }
};

const gantiEmail = async (req, res, next) => {
  try {
    const { emailBaru, password } = req.body;
    await penggunaService.gantiEmail(req.user.id_pengguna, { emailBaru, password });
    res.status(200).json({ success: true, message: 'Email berhasil diubah. Silakan login ulang.' });
  } catch (err) { next(err); }
};

const uploadFoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
    }
    const fotoUrl = await penggunaService.uploadFotoProfil(
      req.user.id_pengguna,
      req.file.buffer,
      req.file.mimetype
    );
    res.status(200).json({ success: true, message: 'Foto profil berhasil diperbarui', data: { foto_profil: fotoUrl } });
  } catch (err) { next(err); }
};

module.exports = { ambilProfil, perbaruiProfil, gantiPassword, gantiEmail, uploadFoto };