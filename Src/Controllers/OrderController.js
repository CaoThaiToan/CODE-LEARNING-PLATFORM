const db = require('../Config/db');

// ── POST /api/orders  [User - requires login] ─────────────
const createOrder = async (req, res) => {
    const { course_id, payment_method, full_name, email, phone } = req.body;
    const userId = req.user.id;

    if (!course_id) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin khóa học.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Get course price
        const [courses] = await conn.query('SELECT id, title, price FROM courses WHERE id = ?', [course_id]);
        if (courses.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        const course = courses[0];
        const amount = Number(course.price) || 0;

        // Check if already ordered (pending or confirmed)
        const [existing] = await conn.query(
            `SELECT o.id FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             WHERE o.user_id = ? AND oi.course_id = ? AND o.status IN ('pending','paid')`,
            [userId, course_id]
        );
        if (existing.length > 0) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'Bạn đã có đơn hàng đang chờ xử lý cho khóa học này.' });
        }

        // Create order
        const [orderResult] = await conn.query(
            'INSERT INTO orders (user_id, total_amount, discount_amount, final_amount, status) VALUES (?, ?, 0, ?, ?)',
            [userId, amount, amount, 'pending']
        );
        const orderId = orderResult.insertId;

        // Create order item
        await conn.query(
            'INSERT INTO order_items (order_id, course_id, price_at_purchase) VALUES (?, ?, ?)',
            [orderId, course_id, amount]
        );

        // Create payment record
        const txCode = `VIP${Date.now()}`;
        await conn.query(
            'INSERT INTO payments (order_id, expected_amount, transaction_code, actual_amount, payment_method, payment_content, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [orderId, amount, txCode, amount, payment_method || 'momo', `Thanh toán khóa học: ${course.title}`, 'pending']
        );

        await conn.commit();
        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công! Chờ Admin xác nhận.',
            data: { order_id: orderId, transaction_code: txCode }
        });
    } catch (err) {
        await conn.rollback();
        console.error('[createOrder]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo đơn hàng.' });
    } finally {
        conn.release();
    }
};

// ── GET /api/orders  [Admin only] ─────────────────────────
const getAllOrders = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                o.id,
                o.status,
                o.final_amount,
                o.created_at,
                u.full_name AS customer_name,
                u.email    AS customer_email,
                c.title    AS course_title,
                c.id       AS course_id,
                p.payment_method,
                p.transaction_code
            FROM orders o
            JOIN users u ON u.id = o.user_id
            JOIN order_items oi ON oi.order_id = o.id
            JOIN courses c ON c.id = oi.course_id
            LEFT JOIN payments p ON p.order_id = o.id
            ORDER BY o.created_at DESC
        `);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getAllOrders]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── GET /api/orders/stats  [Admin only] ───────────────────
const getOrderStats = async (req, res) => {
    try {
        const [[totals]] = await db.query(`
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END), 0) AS total_revenue,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS confirmed_orders
            FROM orders
        `);
        return res.json({ success: true, data: totals });
    } catch (err) {
        console.error('[getOrderStats]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── PUT /api/orders/:id/confirm  [Admin only] ─────────────
const confirmOrder = async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Get order info
        const [orders] = await conn.query(
            `SELECT o.id, o.user_id, o.status, oi.course_id
             FROM orders o JOIN order_items oi ON oi.order_id = o.id
             WHERE o.id = ?`,
            [id]
        );
        if (orders.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại.' });
        }
        const order = orders[0];
        if (order.status === 'paid') {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Đơn hàng đã được xác nhận trước đó.' });
        }

        // Confirm order
        await conn.query("UPDATE orders SET status = 'paid' WHERE id = ?", [id]);

        // Confirm payment
        await conn.query(
            "UPDATE payments SET status = 'success', completed_at = NOW() WHERE order_id = ?",
            [id]
        );

        // Grant course access via enrollments (check first to avoid duplicates)
        const [existingEnroll] = await conn.query(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [order.user_id, order.course_id]
        );
        if (existingEnroll.length === 0) {
            await conn.query(
                "INSERT INTO enrollments (user_id, course_id, status, enrolled_at) VALUES (?, ?, 'active', NOW())",
                [order.user_id, order.course_id]
            );
        } else {
            await conn.query(
                "UPDATE enrollments SET status = 'active' WHERE user_id = ? AND course_id = ?",
                [order.user_id, order.course_id]
            );
        }

        await conn.commit();
        return res.json({ success: true, message: 'Đã xác nhận thanh toán và cấp quyền truy cập khóa học.' });
    } catch (err) {
        await conn.rollback();
        console.error('[confirmOrder]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác nhận đơn hàng.' });
    } finally {
        conn.release();
    }
};

module.exports = { createOrder, getAllOrders, getOrderStats, confirmOrder };
