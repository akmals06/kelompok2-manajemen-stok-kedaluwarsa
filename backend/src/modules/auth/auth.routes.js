const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validasiLogin, validasiForgotPassword, validasiVerifyOtp, validasiResetPassword } = require('./auth.validation');

router.post('/login', validasiLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.ambilProfil);

// Forgot password flow (public — user belum login)
router.post('/forgot-password', validasiForgotPassword, authController.forgotPassword);
router.post('/verify-otp', validasiVerifyOtp, authController.verifyOtp);
router.post('/reset-password', validasiResetPassword, authController.resetPassword);

module.exports = router;
