const express = require('express');
const router = express.Router();
const kategoriController = require('./category.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { izinkanRole } = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const {
  validasiBuatKategori,
  validasiUpdateKategori,
  validasiIdParam,
} = require('./category.validation');

// Semua endpoint kategori wajib auth dan role PEMILIK_USAHA atau ADMIN_USAHA
router.use(authMiddleware);
// Get list and details of categories (both roles)
router.get('/', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), kategoriController.ambilSemuaKategori);
router.get('/:id', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), validasiIdParam, kategoriController.ambilKategoriById);

// Create, Update, Delete categories (restricted to ADMIN_USAHA only)
router.post(
  '/',
  izinkanRole('ADMIN_USAHA'),
  upload.single('gambar_kategori'),
  validasiBuatKategori,
  kategoriController.buatKategori
);

router.put(
  '/:id',
  izinkanRole('ADMIN_USAHA'),
  upload.single('gambar_kategori'),
  validasiIdParam,
  validasiUpdateKategori,
  kategoriController.updateKategori
);

router.delete('/:id', izinkanRole('ADMIN_USAHA'), validasiIdParam, kategoriController.hapusKategori);

module.exports = router;
