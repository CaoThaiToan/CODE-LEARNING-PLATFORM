const CourseModel = require('../Models/CourseModel');

// GET /api/courses
const getAllCourses = async (req, res) => {
    try {
        const { status, q } = req.query;
        const conditions = [];
        const params = [];

        if (status) {
            conditions.push('c.status = ?');
            params.push(status);
        }
        if (q && q.trim() !== '') {
            conditions.push('c.title LIKE ?');
            params.push(`%${q.trim()}%`);
        }

        const [rows] = await CourseModel.findAll(conditions, params);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getAllCourses]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
    try {
        const [rows] = await CourseModel.findById(req.params.id);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        return res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('[getCourseById]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// POST /api/courses  [Admin only]
const createCourse = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Tên khóa học không được để trống.' });
        }

        const [result] = await CourseModel.create(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: 'Tạo khóa học thành công!',
            data: { id: result.insertId, title, status: req.body.status || 'draft' }
        });
    } catch (err) {
        console.error('[createCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// PUT /api/courses/:id  [Admin only]
const updateCourse = async (req, res) => {
    try {
        const [result] = await CourseModel.update(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        return res.json({ success: true, message: 'Cập nhật khóa học thành công!' });
    } catch (err) {
        console.error('[updateCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// DELETE /api/courses/:id  [Admin only]
const deleteCourse = async (req, res) => {
    try {
        const [result] = await CourseModel.remove(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        return res.json({ success: true, message: 'Xóa khóa học thành công!' });
    } catch (err) {
        console.error('[deleteCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// POST /api/courses/:id/enroll [User only]
const enrollCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        // Verify course exists
        const [courses] = await CourseModel.findById(courseId);
        if (courses.length === 0) {
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        const course = courses[0];
        
        // Ensure the course is free
        if (Number(course.price) > 0) {
            return res.status(400).json({ success: false, message: 'Khóa học này là khóa học trả phí. Vui lòng thanh toán để tham gia.' });
        }

        // Check if already enrolled
        const [existing] = await CourseModel.findEnrollment(userId, courseId);
        if (existing.length > 0) {
            return res.json({ success: true, message: 'Bạn đã tham gia khóa học này.' });
        }

        // Create enrollment
        await CourseModel.createEnrollment(userId, courseId);
        return res.json({ success: true, message: 'Đăng ký khóa học miễn phí thành công!' });
    } catch (err) {
        console.error('[enrollCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký học.' });
    }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, enrollCourse };

