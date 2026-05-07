const express = require('express');
const router = express.Router();
const { 
  getProduk, 
  getProdukById, 
  createProduk, 
  updateProduk, 
  nonaktifkanProduk 
} = require('../controllers/produk.controller');
// Import middleware untuk proteksi route dan upload gambar

const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.get('/', verifyToken, getProduk);
router.get('/:id', verifyToken, getProdukById);
router.post('/', verifyToken, isAdmin, upload.single('image'), createProduk);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateProduk);
router.patch('/:id/nonaktifkan', verifyToken, isAdmin, nonaktifkanProduk);

module.exports = router;
