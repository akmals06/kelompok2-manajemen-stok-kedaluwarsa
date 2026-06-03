const config = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.frontendUrl, 
      'http://localhost:3000'
    ];
    
    // Izinkan semua sub-domain preview dan domain produksi Vercel untuk proyek ini secara dinamis (mendukung pemotongan nama domain oleh Vercel)
    const isVercelOrigin = origin.includes('manajemen-stok-kedaluwa') && origin.endsWith('.vercel.app');

    if (allowedOrigins.indexOf(origin) !== -1 || isVercelOrigin || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

module.exports = corsOptions;