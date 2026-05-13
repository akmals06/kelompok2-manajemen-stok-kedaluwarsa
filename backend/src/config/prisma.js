const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const config = require('./env');

const adapter = new PrismaPg({ connectionString: config.database.directUrl });

const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;
