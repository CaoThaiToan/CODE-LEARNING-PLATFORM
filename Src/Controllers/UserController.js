const UserModel = require('../Models/UserModel');

// GET /api/users  [Admin only]
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await UserModel.findAll();
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getAllUsers]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// GET /api/users/:id/courses  [Admin only]
const getUserCourses = async (req, res) => {
    try {
        const userId = req.params.id;

        const [userRows] = await UserModel.findById(userId);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }

        const [enrollments] = await UserModel.findEnrollmentsByUser(userId);
        return res.json({ success: true, user: userRows[0], data: enrollments });
    } catch (err) {
        console.error('[getUserCourses]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// GET /api/users/me/courses  [User - requires login]
const getMyCourses = async (req, res) => {
    try {
        const [enrollments] = await UserModel.findMyEnrollments(req.user.id);
        return res.json({ success: true, data: enrollments });
    } catch (err) {
        console.error('[getMyCourses]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// DELETE /api/users/:id  [Admin only] — soft delete
const deleteUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.params.id;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do xóa tài khoản.' });
        }
        if (String(userId) === String(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản của chính mình.' });
        }

        const [rows] = await UserModel.findByIdWithRole(userId);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
        }
        if (rows[0].role_id === 1) {
            return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản Admin.' });
        }

        await UserModel.softDelete(userId, reason.trim());
        return res.json({ success: true, message: 'Đã xóa tài khoản người dùng thành công.' });
    } catch (err) {
        console.error('[deleteUser]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

module.exports = { getAllUsers, getUserCourses, getMyCourses, deleteUser };
