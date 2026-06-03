const express = require('express');
const router = express.Router();
const batchController = require('./batch.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { izinkanRole } = require('../../middlewares/role.middleware');
const { validasiIdParam, validasiUpdateBatch } = require('./batch.validation');

router.use(authMiddleware);

router.get('/', izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), batchController.ambilSemuaBatch);
router.post('/refresh-status', izinkanRole('ADMIN_USAHA'), batchController.refreshStatusBatch);
router.get('/:id', validasiIdParam, izinkanRole('PEMILIK_USAHA', 'ADMIN_USAHA'), batchController.ambilBatchById);
router.put('/:id', validasiIdParam, izinkanRole('ADMIN_USAHA'), validasiUpdateBatch, batchController.updateBatch);
router.patch('/:id/arsip', validasiIdParam, izinkanRole('ADMIN_USAHA'), batchController.arsipkanBatch);

module.exports = router;
