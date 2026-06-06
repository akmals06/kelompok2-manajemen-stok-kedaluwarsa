const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const { validasiLaporanPeriode } = require('../validations/report.validation');

router.use(authMiddleware);


router.get('/dashboard', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), laporanController.ambilRingkasanDashboard);
router.get('/ringkasan-stok', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), laporanController.ambilRingkasanStok);


router.get('/', izinkanRole('PEMILIK_USAHA'), laporanController.ambilSemuaLaporan);
router.get('/:id', izinkanRole('PEMILIK_USAHA'), laporanController.ambilLaporanById);
router.post('/', izinkanRole('PEMILIK_USAHA'), validasiLaporanPeriode, laporanController.buatLaporanInventaris);

module.exports = router;
