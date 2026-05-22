const db = require('../Config/db');

const findAll = () =>
    db.query(`
        SELECT u.id, u.username, u.email, u.full_name, u.role_id,
               r.role_name AS role, u.created_at,
               u.is_deleted, u.delete_reason
        FROM users u
        JOIN roles r ON r.id = u.role_id
        ORDER BY u.created_at DESC
    `);

const findById = (userId) =>
    db.query('SELECT id, full_name, email FROM users WHERE id = ?', [userId]);

const findEnrollmentsByUser = (userId) =>
    db.query(`
        SELECT c.id, c.title, c.description, c.thumbnail_url, c.price, c.status,
               e.status AS enrollment_status, e.enrolled_at, e.valid_until, e.progress_percent
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    `, [userId]);

const findMyEnrollments = (userId) =>
    db.query(
        'SELECT course_id, status AS enrollment_status FROM enrollments WHERE user_id = ?',
        [userId]
    );

const findByIdWithRole = (userId) =>
    db.query('SELECT id, role_id FROM users WHERE id = ?', [userId]);

const softDelete = (userId, reason) =>
    db.query(
        'UPDATE users SET is_deleted = 1, delete_reason = ? WHERE id = ?',
        [reason, userId]
    );

const getCourseProgress = (userId, courseId) => 
    db.query(`
        SELECT p.lesson_id 
        FROM user_progress p
        JOIN lessons l ON l.id = p.lesson_id
        WHERE p.user_id = ? AND l.course_id = ? AND p.is_completed = 1
    `, [userId, courseId]);

const markLessonCompleted = (userId, lessonId) => 
    db.query(`
        INSERT INTO user_progress (user_id, lesson_id, is_completed) 
        VALUES (?, ?, 1) 
        ON DUPLICATE KEY UPDATE is_completed = 1, updated_at = CURRENT_TIMESTAMP
    `, [userId, lessonId]);

module.exports = { 
    findAll, 
    findById, 
    findEnrollmentsByUser, 
    findMyEnrollments, 
    findByIdWithRole, 
    softDelete,
    getCourseProgress,
    markLessonCompleted
};
