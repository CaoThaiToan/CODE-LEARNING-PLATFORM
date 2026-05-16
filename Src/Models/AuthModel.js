const db = require('../Config/db');

const findByEmailOrUsername = (email, username) =>
    db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);

const createUser = (username, email, hashedPassword, fullName) =>
    db.query(
        'INSERT INTO users (role_id, username, email, password, full_name) VALUES (?, ?, ?, ?, ?)',
        [2, username, email, hashedPassword, fullName]
    );

const findByEmailWithRole = (email) =>
    db.query(
        `SELECT u.id, u.username, u.email, u.password, u.full_name, u.role_id,
                u.is_deleted, u.delete_reason,
                r.role_name AS role
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.email = ?`,
        [email]
    );

const findByIdWithRole = (userId) =>
    db.query(
        `SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.role_name AS role, u.created_at
         FROM users u JOIN roles r ON r.id = u.role_id
         WHERE u.id = ?`,
        [userId]
    );

module.exports = { findByEmailOrUsername, createUser, findByEmailWithRole, findByIdWithRole };
