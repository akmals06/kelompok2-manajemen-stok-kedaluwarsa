const express = require('express');
const router = express.Router();
const labelController = require('./label.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { izinkanRole } = require('../../middlewares/role.middleware');
const { validasiLabelRequest } = require('./label.validation');

router.use(authMiddleware);
router.use(izinkanRole('ADMIN_USAHA'));

router.post('/produk', validasiLabelRequest, labelController.buatLabelProduk);
router.post('/batch', validasiLabelRequest, labelController.buatLabelBatch);

module.exports = router;
