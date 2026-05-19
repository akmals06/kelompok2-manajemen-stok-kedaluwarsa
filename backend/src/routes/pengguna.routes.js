const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/pengguna.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/profil', authMiddleware, penggunaController.ambilProfil);
router.put('/profil', authMiddleware, penggunaController.perbaruiProfil);
router.put('/ganti-password', authMiddleware, penggunaController.gantiPassword);
router.put('/ganti-email', authMiddleware, penggunaController.gantiEmail);
router.post('/upload-foto', authMiddleware, upload.single('foto'), penggunaController.uploadFoto);

module.exports = router;