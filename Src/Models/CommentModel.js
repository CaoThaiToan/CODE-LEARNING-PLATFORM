const db = require('../Config/db');

// Tự động tạo bảng course_comments nếu chưa tồn tại
const initTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS course_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Bảng course_comments đã sẵn sàng!');
    } catch (err) {
        console.error('❌ Lỗi khởi tạo bảng course_comments:', err.message);
    }
};
initTable();

const createComment = (courseId, userId, content) =>
    db.query(
        'INSERT INTO course_comments (course_id, user_id, content) VALUES (?, ?, ?)',
        [courseId, userId, content]
    );

const findCommentsByCourse = (courseId) =>
    db.query(
        `SELECT cc.id, cc.content, cc.created_at, u.full_name, u.username
         FROM course_comments cc
         JOIN users u ON u.id = cc.user_id
         WHERE cc.course_id = ?
         ORDER BY cc.created_at DESC`,
        [courseId]
    );

module.exports = { createComment, findCommentsByCourse };
