const express = require('express');
const router = express.Router();
const importController = require('./import.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { izinkanRole } = require('../../middlewares/role.middleware');
const multer = require('multer');
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx, .xls) atau CSV yang diizinkan.'));
    }
  },
});
const {
  validasiUploadImport,
  validasiModeImport,
  validasiKonfirmasiImport,
} = require('./import.validation');

router.use(authMiddleware);
router.use(izinkanRole('ADMIN_USAHA', 'PEMILIK_USAHA'));

router.post(
  '/preview',
  uploadExcel.single('file'),
  validasiModeImport,
  validasiUploadImport,
  importController.previewImport
);

router.post(
  '/eksekusi',
  validasiModeImport,
  validasiKonfirmasiImport,
  importController.eksekusiImport
);

module.exports = router;
