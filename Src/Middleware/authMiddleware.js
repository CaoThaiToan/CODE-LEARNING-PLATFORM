const jwt = require('jsonwebtoken');
const db  = require('../Config/db');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
        }
        const [rows] = await db.query('SELECT role_id FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0 || rows[0].role_id !== 1) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
        }
        next();
    } catch (err) {
        console.error('[requireAdmin]', err);
        return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền hạn.' });
    }
};

module.exports = { verifyToken, requireAdmin };
