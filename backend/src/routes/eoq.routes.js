const express = require('express');
const router = express.Router();
const eoqController = require('../controllers/eoq.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const { validasiHitungEoq } = require('../validations/eoq.validation');

router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA'));

router.post('/', validasiHitungEoq, eoqController.hitungEoq);
router.get('/', eoqController.ambilRiwayatEoq);

module.exports = router;
