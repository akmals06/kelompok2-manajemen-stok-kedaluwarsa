const express = require('express');
const router = express.Router();
const produkController = require('./product.controller');
const {
  validasiIdParam,
  validasiBuatProduk,
  validasiUpdateProduk,
} = require('./product.validation');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');

router.use(authMiddleware);

// Get list and details of products (both roles)
router.get('/', roleMiddleware.izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), produkController.ambilSemuaProduk);
router.get('/:id', roleMiddleware.izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), validasiIdParam, produkController.ambilProdukById);

// Create, Update, Toggle Active products (restricted to ADMIN_USAHA only)
router.post(
  '/',
  roleMiddleware.izinkanRole('ADMIN_USAHA'),
  upload.single('gambar_produk'),
  validasiBuatProduk,
  produkController.buatProduk
);

router.put(
  '/:id',
  roleMiddleware.izinkanRole('ADMIN_USAHA'),
  upload.single('gambar_produk'),
  validasiIdParam,
  validasiUpdateProduk,
  produkController.updateProduk
);

router.patch('/:id/nonaktif', roleMiddleware.izinkanRole('ADMIN_USAHA'), validasiIdParam, produkController.nonaktifkanProduk);
router.patch('/:id/aktif', roleMiddleware.izinkanRole('ADMIN_USAHA'), validasiIdParam, produkController.aktifkanProduk);

module.exports = router;
