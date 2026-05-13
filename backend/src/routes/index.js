const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const kategoriRoutes = require('./kategori.routes');
const produkRoutes = require('./produk.routes');

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is healthy',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/kategori', kategoriRoutes);
router.use('/produk', produkRoutes);

module.exports = router;
