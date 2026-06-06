const express = require('express');
const router = express.Router();

// Module routes
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const stockRoutes = require('./stock.routes');
const historyRoutes = require('./history.routes');
const batchRoutes = require('./batch.routes');
const reportRoutes = require('./report.routes');
const eoqRoutes = require('./eoq.routes');
const importRoutes = require('./import.routes');
const labelRoutes = require('./label.routes');
const notificationRoutes = require('./notification.routes');
const userRoutes = require('./user.routes');

// Health check — also tests database connectivity
router.get('/health', async (req, res) => {
  const status = {
    success: true,
    message: 'Backend API is healthy',
    timestamp: new Date().toISOString(),
    database: 'unknown',
  };

  try {
    const prisma = require('../config/prisma');
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'connected';
  } catch (err) {
    status.database = 'disconnected';
    status.dbError = err.message;
    status.success = false;
    status.message = 'Backend running but database unreachable';
  }

  res.status(status.success ? 200 : 503).json(status);
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/kategori', categoryRoutes);
router.use('/produk', productRoutes);
router.use('/stok', stockRoutes);
router.use('/riwayat', historyRoutes);
router.use('/batch', batchRoutes);
router.use('/laporan', reportRoutes);
router.use('/eoq', eoqRoutes);
router.use('/import', importRoutes);
router.use('/label', labelRoutes);
router.use('/notifikasi', notificationRoutes);
router.use('/pengguna', userRoutes);

module.exports = router;
