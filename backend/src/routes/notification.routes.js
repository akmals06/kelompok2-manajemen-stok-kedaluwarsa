const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const notifikasiController = require('../controllers/notification.controller');

router.use(authMiddleware);

router.get('/', notifikasiController.ambilSemuaNotifikasi);
router.get('/count', notifikasiController.hitungBelumDibaca);
router.patch('/:id/baca', notifikasiController.tandaiSudahDibaca);
router.patch('/baca-semua', notifikasiController.tandaiSemuaDibaca);
router.post('/delete-many', notifikasiController.hapusBeberapaNotifikasi);
router.delete('/:id', notifikasiController.hapusNotifikasi);

module.exports = router;
