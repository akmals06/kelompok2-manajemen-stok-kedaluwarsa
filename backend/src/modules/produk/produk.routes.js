const express = require('express');
const router = express.Router();
const produkController = require('./produk.controller');
const { validateCreateProduk, validateUpdateProduk } = require('./produk.validation');
const authMiddleware = require('../../middlewares/auth.middleware');
const { isAdmin, isPemilikOrAdmin } = require('../../middlewares/role.middleware');
const { uploadProdukImage } = require('../../middlewares/upload.middleware');

router.get('/', authMiddleware, isPemilikOrAdmin, produkController.getProduk);
router.get('/:id', authMiddleware, isPemilikOrAdmin, produkController.getProdukById);
router.post('/', authMiddleware, isAdmin, uploadProdukImage, validateCreateProduk, produkController.createProduk);
router.put('/:id', authMiddleware, isAdmin, uploadProdukImage, validateUpdateProduk, produkController.updateProduk);
router.patch('/:id/status', authMiddleware, isAdmin, produkController.nonaktifkanProduk);

module.exports = router;
