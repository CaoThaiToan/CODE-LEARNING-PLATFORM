const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../Config/db');

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── POST /api/auth/register ───────────────────────────────
const register = async (req, res) => {
    try {
        const { username, email, password, full_name } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' });
        }

        // Check duplicate
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email hoặc username đã được đăng ký.' });
        }

        const hashed = await bcrypt.hash(password, 10);

        // role_id = 2 (User) theo bảng roles có sẵn
        const [result] = await db.query(
            'INSERT INTO users (role_id, username, email, password, full_name) VALUES (?, ?, ?, ?, ?)',
            [2, username, email, hashed, full_name || username]
        );

        const user = { id: result.insertId, username, email, full_name: full_name || username, role_id: 2, role: 'User' };
        const token = signToken(user);

        return res.status(201).json({ success: true, message: 'Đăng ký thành công!', token, user });
    } catch (err) {
        console.error('[register]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ. Vui lòng thử lại.' });
    }
};

// ── POST /api/auth/login ──────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
        }

        // JOIN với bảng roles để lấy role_name
        const [rows] = await db.query(
            `SELECT u.id, u.username, u.email, u.password, u.full_name, u.role_id,
                    u.is_deleted, u.delete_reason,
                    r.role_name AS role
             FROM users u
             JOIN roles r ON r.id = u.role_id
             WHERE u.email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
        }

        const user  = rows[0];

        // Kiểm tra tài khoản bị xóa (soft-delete)
        if (user.is_deleted) {
            const reason = user.delete_reason
                ? `Tài khoản của bạn đã bị xóa bởi quản trị viên.\n\nLý do: ${user.delete_reason}`
                : 'Tài khoản của bạn đã bị xóa bởi quản trị viên.';
            return res.status(403).json({ success: false, message: reason, code: 'ACCOUNT_DELETED' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
        }

        const payload = {
            id:        user.id,
            username:  user.username,
            email:     user.email,
            full_name: user.full_name,
            role_id:   user.role_id,
            role:      user.role       // 'Admin' | 'User'
        };
        const token = signToken(payload);

        // Xoá password khỏi response
        delete user.password;

        return res.json({ success: true, message: 'Đăng nhập thành công!', token, user: payload });
    } catch (err) {
        console.error('[login]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ. Vui lòng thử lại.' });
    }
};

// ── GET /api/auth/me ──────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.role_name AS role, u.created_at
             FROM users u JOIN roles r ON r.id = u.role_id
             WHERE u.id = ?`,
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }
        return res.json({ success: true, user: rows[0] });
    } catch (err) {
        console.error('[getMe]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

module.exports = { register, login, getMe };
