const db = require('../Config/db');

const findAll = (conditions = [], params = []) => {
    let query = `
        SELECT c.id, c.title, c.description, c.thumbnail_url, c.price, c.status, c.level, c.created_at,
               u.username AS author_username, u.full_name AS author_name
        FROM courses c
        LEFT JOIN users u ON u.id = c.author_id
    `;
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.created_at DESC';
    return db.query(query, params);
};

const findById = (id) =>
    db.query(
        `SELECT c.*, u.username AS author_username, u.full_name AS author_name,
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count
         FROM courses c LEFT JOIN users u ON u.id = c.author_id
         WHERE c.id = ?`,
        [id]
    );

const create = (authorId, { title, description, thumbnail_url, price, status, level }) =>
    db.query(
        'INSERT INTO courses (author_id, title, description, thumbnail_url, price, status, level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [authorId, title, description || null, thumbnail_url || null, price || 0, status || 'draft', level || null]
    );

const update = (id, { title, description, thumbnail_url, price, status, level }) =>
    db.query(
        'UPDATE courses SET title=?, description=?, thumbnail_url=?, price=?, status=?, level=? WHERE id=?',
        [title, description, thumbnail_url || null, price, status, level || null, id]
    );

const remove = (id) =>
    db.query('DELETE FROM courses WHERE id = ?', [id]);

const findEnrollment = (userId, courseId) =>
    db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);

const createEnrollment = (userId, courseId) =>
    db.query(
        "INSERT INTO enrollments (user_id, course_id, status, enrolled_at) VALUES (?, ?, 'active', NOW())",
        [userId, courseId]
    );

module.exports = { findAll, findById, create, update, remove, findEnrollment, createEnrollment };

