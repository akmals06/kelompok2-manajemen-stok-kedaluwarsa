const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id_pengguna: 'admin@abahandi.com', peran: 'ADMIN_USAHA' }, // Need to check exact payload payload from auth.service.js
  'jwtssecrethanyakelompok2doang_Yangtau',
  { expiresIn: '1d' }
);
console.log(token);
