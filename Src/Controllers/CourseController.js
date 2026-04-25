const db = require('../Config/db');

// ── GET /api/courses ──────────────────────────────────────
const getAllCourses = async (req, res) => {
    try {
        const { status } = req.query; // ?status=published | ?status=draft
        let query = `
            SELECT c.id, c.title, c.description, c.thumbnail_url, c.price, c.status, c.level, c.created_at,
                   u.username AS author_username, u.full_name AS author_name
            FROM courses c
            LEFT JOIN users u ON u.id = c.author_id
        `;
        const params = [];
        if (status) {
            query += ' WHERE c.status = ?';
            params.push(status);
        }
        query += ' ORDER BY c.created_at DESC';

        const [rows] = await db.query(query, params);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getAllCourses]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── GET /api/courses/:id ──────────────────────────────────
const getCourseById = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.*, u.username AS author_username, u.full_name AS author_name,
                    (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count
             FROM courses c LEFT JOIN users u ON u.id = c.author_id
             WHERE c.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        return res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('[getCourseById]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── POST /api/courses  [Admin only] ──────────────────────
const createCourse = async (req, res) => {
    try {
        const { title, description, thumbnail_url, price, status, level } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Tên khóa học không được để trống.' });
        }

        const [result] = await db.query(
            'INSERT INTO courses (author_id, title, description, thumbnail_url, price, status, level) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                title,
                description || null,
                thumbnail_url || null,
                price || 0,
                status || 'draft',
                level || null
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Tạo khóa học thành công!',
            data: { id: result.insertId, title, status: status || 'draft' }
        });
    } catch (err) {
        console.error('[createCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── PUT /api/courses/:id  [Admin only] ───────────────────
const updateCourse = async (req, res) => {
    try {
        const { title, description, thumbnail_url, price, status, level } = req.body;
        const [result] = await db.query(
            'UPDATE courses SET title=?, description=?, thumbnail_url=?, price=?, status=?, level=? WHERE id=?',
            [title, description, thumbnail_url || null, price, status, level || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        return res.json({ success: true, message: 'Cập nhật khóa học thành công!' });
    } catch (err) {
        console.error('[updateCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── DELETE /api/courses/:id  [Admin only] ────────────────
const deleteCourse = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        return res.json({ success: true, message: 'Xóa khóa học thành công!' });
    } catch (err) {
        console.error('[deleteCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
