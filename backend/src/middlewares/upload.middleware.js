const multer = require('multer');
const AppError = require('../utils/appError');

const simpan_di_memori = multer.memoryStorage();

const filter_gambar = (req, file, cb) => {
  const tipe_valid = ['image/jpeg', 'image/png', 'image/webp'];

  if (!tipe_valid.includes(file.mimetype)) {
    return cb(
      new AppError('File harus berupa gambar JPG, PNG, atau WEBP.', 400),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage: simpan_di_memori,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: filter_gambar,
});

const uploadProdukImage = upload.single('gambar');

module.exports = {
  upload,
  uploadProdukImage,
};