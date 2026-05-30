const express = require('express');
const router = express.Router();
const penggunaController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');
const { validasiPerbaruiProfil, validasiGantiPassword, validasiGantiEmail } = require('./user.validation');

router.get('/profil', authMiddleware, penggunaController.ambilProfil);
router.put('/profil', authMiddleware, validasiPerbaruiProfil, penggunaController.perbaruiProfil);
router.put('/ganti-password', authMiddleware, validasiGantiPassword, penggunaController.gantiPassword);
router.put('/ganti-email', authMiddleware, validasiGantiEmail, penggunaController.gantiEmail);
router.post('/upload-foto', authMiddleware, upload.single('foto'), penggunaController.uploadFoto);

module.exports = router;