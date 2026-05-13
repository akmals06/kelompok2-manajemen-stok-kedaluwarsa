const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { izinkanRole } = require('../middlewares/role.middleware');
const { validasiIdParam, validasiUpdateBatch } = require('../validations/batch.validation');

router.use(authMiddleware);
router.use(izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'));

router.get('/', batchController.ambilSemuaBatch);
router.get('/:id', validasiIdParam, batchController.ambilBatchById);
router.put('/:id', validasiIdParam, validasiUpdateBatch, batchController.updateBatch);
router.patch('/:id/arsip', validasiIdParam, batchController.arsipkanBatch);

module.exports = router;
