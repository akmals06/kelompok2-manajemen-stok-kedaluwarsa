const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategori.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const {
  validasiBuatKategori,
  validasiUpdateKategori,
  validasiIdParam,
} = require('../validations/kategori.validation');

// Semua endpoint kategori wajib auth dan role PEMILIK_USAHA atau ADMIN_USAHA
router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.get('/', kategoriController.ambilSemuaKategori);
router.get('/:id', validasiIdParam, kategoriController.ambilKategoriById);
router.post('/', validasiBuatKategori, kategoriController.buatKategori);
router.put('/:id', validasiIdParam, validasiUpdateKategori, kategoriController.updateKategori);
router.delete('/:id', validasiIdParam, kategoriController.hapusKategori);

module.exports = router;
