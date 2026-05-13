const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const kategoriRoutes = require('./kategori.routes');
const produkRoutes = require('./produk.routes');
const stokRoutes = require('./stok.routes');
const riwayatRoutes = require('./riwayat.routes');
const batchRoutes = require('./batch.routes');
const laporanRoutes = require('./laporan.routes');
const eoqRoutes = require('./eoq.routes');
const importRoutes = require('./import.routes');
const labelRoutes = require('./label.routes');
const notifikasiRoutes = require('./notifikasi.routes');

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
router.use('/stok', stokRoutes);
router.use('/riwayat', riwayatRoutes);
router.use('/batch', batchRoutes);
router.use('/laporan', laporanRoutes);
router.use('/eoq', eoqRoutes);
router.use('/import', importRoutes);
router.use('/label', labelRoutes);
router.use('/notifikasi', notifikasiRoutes);

module.exports = router;
