const express = require('express');
const router = express.Router();
const riwayatController = require('../controllers/riwayat.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');

router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.get('/', riwayatController.ambilSemuaRiwayat);

module.exports = router;
