const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stok.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const { validasiStokMasuk, validasiStokKeluar } = require('../validations/stok.validation');

router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.get('/masuk', stokController.ambilDaftarStokMasuk);
router.post('/masuk', validasiStokMasuk, stokController.buatStokMasuk);

router.get('/keluar', stokController.ambilDaftarStokKeluar);
router.post('/keluar', validasiStokKeluar, stokController.buatStokKeluar);

module.exports = router;
