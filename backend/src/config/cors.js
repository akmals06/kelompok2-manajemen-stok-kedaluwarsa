const config = require('./env');

const VERCEL_PRODUCTION_URL = 'https://kelompok2-manajemen-stok-kedaluwarsa-4d4iynfte.vercel.app';

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.frontendUrl,
      VERCEL_PRODUCTION_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
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
