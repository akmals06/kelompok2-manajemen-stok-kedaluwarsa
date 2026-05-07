const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  disableProduct 
} = require('../controllers/product.controller');
// Placeholder for middleware
// const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
// const upload = require('../middleware/upload');

// Currently bypassing auth/upload for basic setup verification if they don't exist yet,
// Wait, they exist, I saw them imported in the previous file. Let's keep them if they exist.
// Let me just import them as they were.

const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProductById);
router.post('/', verifyToken, isAdmin, upload.single('image'), createProduct);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateProduct);
router.patch('/:id/nonaktifkan', verifyToken, isAdmin, disableProduct);

module.exports = router;
