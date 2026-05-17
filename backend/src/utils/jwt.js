const jwt = require('jsonwebtoken');
const config = require('../config/env');

const buatAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

const buatRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const verifikasiAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

const verifikasiRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

module.exports = {
  buatAccessToken,
  buatRefreshToken,
  verifikasiAccessToken,
  verifikasiRefreshToken,
};
