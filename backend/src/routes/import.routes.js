const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  validasiUploadImport,
  validasiModeImport,
  validasiKonfirmasiImport,
} = require('../validations/import.validation');

router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.post(
  '/preview',
  upload.single('file'),
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
