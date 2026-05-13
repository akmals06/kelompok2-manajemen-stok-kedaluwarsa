const env = require('./env');

const corsOptions = {
  origin: env.isProduction ? env.FRONTEND_URL : [env.FRONTEND_URL, 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Needed if we decide to use cookies later
};

module.exports = corsOptions;
