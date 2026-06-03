const express = require('express');
const router = express.Router();

// Module routes
const authRoutes = require('../modules/auth/auth.routes');
const categoryRoutes = require('../modules/category/category.routes');
const productRoutes = require('../modules/product/product.routes');
const stockRoutes = require('../modules/stock/stock.routes');
const historyRoutes = require('../modules/history/history.routes');
const batchRoutes = require('../modules/batch/batch.routes');
const reportRoutes = require('../modules/report/report.routes');
const eoqRoutes = require('../modules/eoq/eoq.routes');
const importRoutes = require('../modules/import/import.routes');
const labelRoutes = require('../modules/label/label.routes');
const notificationRoutes = require('../modules/notification/notification.routes');
const userRoutes = require('../modules/user/user.routes');

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
