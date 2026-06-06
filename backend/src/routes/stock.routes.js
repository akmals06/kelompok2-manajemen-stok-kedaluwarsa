const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stock.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const { validasiStokMasuk, validasiStokKeluar } = require('../validations/stock.validation');

router.use(authMiddleware);


router.get('/masuk', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), stokController.ambilDaftarStokMasuk);
router.get('/keluar', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), stokController.ambilDaftarStokKeluar);


router.post('/masuk', izinkanRole('ADMIN_USAHA'), validasiStokMasuk, stokController.buatStokMasuk);
router.post('/keluar', izinkanRole('ADMIN_USAHA'), validasiStokKeluar, stokController.buatStokKeluar);

module.exports = router;
