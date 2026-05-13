const express = require('express');
const router = express.Router();
const { login } = require('./auth.controller');
const { validateLogin } = require('./auth.validation');
const { loginLimiter } = require('../../middlewares/rateLimiter.middleware');

router.post('/login', loginLimiter, validateLogin, login);

module.exports = router;
