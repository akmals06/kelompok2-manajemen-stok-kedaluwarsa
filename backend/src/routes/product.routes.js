const express = require('express');
const router = express.Router();
const { getProducts, createProduct } = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.post('/', verifyToken, isAdmin, upload.single('image'), createProduct);

module.exports = router;
