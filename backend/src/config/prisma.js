const { PrismaClient } = require('@prisma/client');
const config = require('./env');

const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
});

// Warm up the connection on startup so the first request doesn't timeout
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ Database connection failed:', err.message));

module.exports = prisma;
