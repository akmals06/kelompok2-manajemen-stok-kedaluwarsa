const jwt = require('jsonwebtoken');
const config = require('../config/env');

const buatToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const verifikasiToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { buatToken, verifikasiToken };
