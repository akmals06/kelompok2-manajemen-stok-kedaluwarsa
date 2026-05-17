const config = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:3000',
    ].filter(Boolean);

    const isVercelDeploy = /^https:\/\/kelompok2-manajemen-stok-kedaluwarsa.*\.vercel\.app$/.test(origin);

    if (allowedOrigins.includes(origin) || isVercelDeploy || config.nodeEnv === 'development') {
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
