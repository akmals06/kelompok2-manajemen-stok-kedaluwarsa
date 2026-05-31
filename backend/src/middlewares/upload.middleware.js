const multer = require('multer');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 35 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format gambar harus JPG, PNG, atau WebP.'));
    }
  },
});

module.exports = upload;
