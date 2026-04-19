const jwt = require('jsonwebtoken');

/**
 * Verify JWT from Authorization header.
 * Attaches decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    }
};

/**
 * Only allow users with role 'Admin' (matches roles table: role_name = 'Admin').
 * Must be used AFTER verifyToken.
 */
const requireAdmin = (req, res, next) => {
    // role_id = 1 hoặc role = 'Admin' theo bảng roles hiện có
    if (req.user?.role_id !== 1 && req.user?.role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
    }
    next();
};

module.exports = { verifyToken, requireAdmin };
