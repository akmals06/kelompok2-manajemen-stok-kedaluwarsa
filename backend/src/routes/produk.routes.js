const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produk.controller');
const {
  validasiIdParam,
  validasiBuatProduk,
  validasiUpdateProduk,
} = require('../validations/produk.validation');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authMiddleware);

router.get('/', produkController.ambilSemuaProduk);
router.get('/:id', validasiIdParam, produkController.ambilProdukById);

router.use(roleMiddleware.izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.post(
  '/',
  upload.single('gambar_produk'),
  validasiBuatProduk,
  produkController.buatProduk
);

router.put(
  '/:id',
  upload.single('gambar_produk'),
  validasiIdParam,
  validasiUpdateProduk,
  produkController.updateProduk
);

router.patch('/:id/nonaktif', validasiIdParam, produkController.nonaktifkanProduk);
router.patch('/:id/aktif', validasiIdParam, produkController.aktifkanProduk);

module.exports = router;
