const express = require('express');
const router  = express.Router();
const { register, login, getMe } = require('../Controllers/AuthController');
const { verifyToken }             = require('../Middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET  /api/auth/me  (cần đăng nhập)
router.get('/me', verifyToken, getMe);

// POST /api/auth/logout  (client-side: xóa token)
router.post('/logout', (req, res) => {
    return res.json({ success: true, message: 'Đăng xuất thành công!' });
});

module.exports = router;
