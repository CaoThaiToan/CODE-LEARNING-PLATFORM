const db = require('../Config/db');

const findCourseById = (conn, courseId) =>
    conn.query('SELECT id, title, price FROM courses WHERE id = ?', [courseId]);

const findExistingOrder = (conn, userId, courseId) =>
    conn.query(
        `SELECT o.id FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.course_id = ? AND o.status IN ('pending','paid')`,
        [userId, courseId]
    );

const createOrder = (conn, userId, amount) =>
    conn.query(
        'INSERT INTO orders (user_id, total_amount, discount_amount, final_amount, status) VALUES (?, ?, 0, ?, ?)',
        [userId, amount, amount, 'pending']
    );

const createOrderItem = (conn, orderId, courseId, amount) =>
    conn.query(
        'INSERT INTO order_items (order_id, course_id, price_at_purchase) VALUES (?, ?, ?)',
        [orderId, courseId, amount]
    );

const createPayment = (conn, orderId, amount, txCode, paymentMethod, courseTitle) =>
    conn.query(
        'INSERT INTO payments (order_id, expected_amount, transaction_code, actual_amount, payment_method, payment_content, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, amount, txCode, amount, paymentMethod || 'momo', `Thanh toán khóa học: ${courseTitle}`, 'pending']
    );

const findAll = () =>
    db.query(`
        SELECT
            o.id, o.status, o.final_amount, o.created_at,
            u.full_name AS customer_name, u.email AS customer_email,
            c.title AS course_title, c.id AS course_id,
            p.payment_method, p.transaction_code
        FROM orders o
        JOIN users u ON u.id = o.user_id
        JOIN order_items oi ON oi.order_id = o.id
        JOIN courses c ON c.id = oi.course_id
        LEFT JOIN payments p ON p.order_id = o.id
        ORDER BY o.created_at DESC
    `);

const getStats = () =>
    db.query(`
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END), 0) AS total_revenue,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS confirmed_orders
        FROM orders
    `);

const findOrderWithItems = (conn, orderId) =>
    conn.query(
        `SELECT o.id, o.user_id, o.status, oi.course_id
         FROM orders o JOIN order_items oi ON oi.order_id = o.id
         WHERE o.id = ?`,
        [orderId]
    );

const confirmOrderStatus = (conn, orderId) =>
    conn.query("UPDATE orders SET status = 'paid' WHERE id = ?", [orderId]);

const confirmPayment = (conn, orderId) =>
    conn.query("UPDATE payments SET status = 'success', completed_at = NOW() WHERE order_id = ?", [orderId]);

const findEnrollment = (conn, userId, courseId) =>
    conn.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);

const createEnrollment = (conn, userId, courseId) =>
    conn.query(
        "INSERT INTO enrollments (user_id, course_id, status, enrolled_at) VALUES (?, ?, 'active', NOW())",
        [userId, courseId]
    );

const activateEnrollment = (conn, userId, courseId) =>
    conn.query(
        "UPDATE enrollments SET status = 'active' WHERE user_id = ? AND course_id = ?",
        [userId, courseId]
    );

module.exports = {
    findCourseById, findExistingOrder,
    createOrder, createOrderItem, createPayment,
    findAll, getStats,
    findOrderWithItems, confirmOrderStatus, confirmPayment,
    findEnrollment, createEnrollment, activateEnrollment
};
