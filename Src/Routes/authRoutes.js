const express = require('express');
const router  = express.Router();
const { register, login, getMe } = require('../Controllers/AuthController');
const { verifyToken } = require('../Middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        verifyToken, getMe);
router.post('/logout',   (req, res) => res.json({ success: true, message: 'Đăng xuất thành công!' }));

module.exports = router;
