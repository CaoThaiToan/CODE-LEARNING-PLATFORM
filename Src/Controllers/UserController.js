const db = require('../Config/db');

// ── GET /api/users  [Admin only] ─────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.username, u.email, u.full_name, u.role_id,
                   r.role_name AS role, u.created_at,
                   u.is_deleted, u.delete_reason
            FROM users u
            JOIN roles r ON r.id = u.role_id
            ORDER BY u.created_at DESC
        `);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getAllUsers]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── GET /api/users/:id/courses  [Admin only] ─────────────
// Trả về danh sách khóa học user đã đăng ký (free + VIP)
const getUserCourses = async (req, res) => {
    try {
        const userId = req.params.id;

        // Kiểm tra user tồn tại
        const [userRows] = await db.query('SELECT id, full_name, email FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        // Lấy khóa học đã đăng ký qua bảng enrollments
        const [enrollments] = await db.query(`
            SELECT c.id, c.title, c.description, c.thumbnail_url, c.price, c.status,
                   e.status AS enrollment_status, e.enrolled_at, e.valid_until, e.progress_percent
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE e.user_id = ?
            ORDER BY e.enrolled_at DESC
        `, [userId]);

        return res.json({
            success: true,
            user: userRows[0],
            data: enrollments
        });
    } catch (err) {
        console.error('[getUserCourses]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── GET /api/users/me/courses  [User - requires login] ────
const getMyCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const [enrollments] = await db.query(`
            SELECT course_id, status AS enrollment_status
            FROM enrollments
            WHERE user_id = ?
        `, [userId]);
        return res.json({ success: true, data: enrollments });
    } catch (err) {
        console.error('[getMyCourses]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── DELETE /api/users/:id  [Admin only] ──────────────────
// Soft-delete: đánh dấu is_deleted=1 và lưu lý do, không xóa dữ liệu thật
const deleteUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.params.id;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do xóa tài khoản.' });
        }

        // Không cho admin tự xóa chính mình
        if (String(userId) === String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản của chính mình.' });
        }

        // Kiểm tra user tồn tại
        const [rows] = await db.query('SELECT id, role_id FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        // Không cho xóa admin khác
        if (rows[0].role_id === 1) {
            return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản Admin.' });
        }

        await db.query(
            'UPDATE users SET is_deleted = 1, delete_reason = ? WHERE id = ?',
            [reason.trim(), userId]
        );

        return res.json({ success: true, message: 'Đã xóa tài khoản người dùng thành công.' });
    } catch (err) {
        console.error('[deleteUser]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

module.exports = { getAllUsers, getUserCourses, getMyCourses, deleteUser };
