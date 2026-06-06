const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const {
  validasiBuatKategori,
  validasiUpdateKategori,
  validasiIdParam,
} = require('../validations/category.validation');


router.use(authMiddleware);

router.get('/', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), kategoriController.ambilSemuaKategori);
router.get('/:id', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), validasiIdParam, kategoriController.ambilKategoriById);


router.post(
  '/',
  izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'),
  upload.single('gambar_kategori'),
  validasiBuatKategori,
  kategoriController.buatKategori
);

router.put(
  '/:id',
  izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'),
  upload.single('gambar_kategori'),
  validasiIdParam,
  validasiUpdateKategori,
  kategoriController.updateKategori
);

router.delete('/:id', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), validasiIdParam, kategoriController.hapusKategori);

module.exports = router;
