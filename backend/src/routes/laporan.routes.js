const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const { validasiLaporanPeriode } = require('../validations/laporan.validation');

router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.get('/dashboard', laporanController.ambilRingkasanDashboard);
router.get('/ringkasan-stok', laporanController.ambilRingkasanStok);
router.get('/', laporanController.ambilSemuaLaporan);
router.get('/:id', laporanController.ambilLaporanById);
router.post('/', validasiLaporanPeriode, laporanController.buatLaporanInventaris);

module.exports = router;
