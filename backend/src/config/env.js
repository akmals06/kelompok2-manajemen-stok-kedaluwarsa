const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvs = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);

if (missingEnvs.length > 0) {
  throw new Error(`[CONFIG ERROR] Missing required environment variables: ${missingEnvs.join(', ')}`);
}

const cloudinaryUrl = process.env.CLOUDINARY_URL;
let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
  try {
    const cleanUrl = cloudinaryUrl.replace('cloudinary://', '');
    const [credentials, hostAndParams] = cleanUrl.split('@');
    if (credentials && hostAndParams) {
      const [key, secret] = credentials.split(':');
      const [host] = hostAndParams.split('?');
      if (!apiKey) apiKey = key;
      if (!apiSecret) apiSecret = secret;
      if (!cloudName) cloudName = host;
    }
  } catch (e) {
    // Silent fallback
  }
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  cloudinary: {
    cloudName,
    apiKey,
    apiSecret,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
