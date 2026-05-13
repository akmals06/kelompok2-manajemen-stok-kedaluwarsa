const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validasiLogin } = require('../validations/auth.validation');

router.post('/login', validasiLogin, authController.login);
router.get('/me', authMiddleware, authController.ambilProfil);

module.exports = router;
