const cloudinary = require('./src/config/cloudinary');

console.log('--- Checking Cloudinary SDK internal config ---');
const config = cloudinary.config();
console.log('cloud_name:', config.cloud_name);
console.log('api_key:', config.api_key);
console.log('api_secret:', config.api_secret ? 'EXISTS (OK)' : 'MISSING');
console.log('secure:', config.secure);
