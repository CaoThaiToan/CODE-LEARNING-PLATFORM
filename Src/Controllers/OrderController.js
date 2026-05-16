const db = require('../Config/db');
const OrderModel = require('../Models/OrderModel');

// POST /api/orders  [User - requires login]
const createOrder = async (req, res) => {
    const { course_id, payment_method } = req.body;
    const userId = req.user.id;

    if (!course_id) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin khóa học.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [courses] = await OrderModel.findCourseById(conn, course_id);
        if (courses.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Khóa học không tồn tại.' });
        }
        const course = courses[0];
        const amount = Number(course.price) || 0;

        const [existing] = await OrderModel.findExistingOrder(conn, userId, course_id);
        if (existing.length > 0) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'Bạn đã có đơn hàng đang chờ xử lý cho khóa học này.' });
        }

        const [orderResult] = await OrderModel.createOrder(conn, userId, amount);
        const orderId = orderResult.insertId;

        await OrderModel.createOrderItem(conn, orderId, course_id, amount);

        const txCode = `VIP${Date.now()}`;
        await OrderModel.createPayment(conn, orderId, amount, txCode, payment_method, course.title);

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

// GET /api/orders  [Admin only]
const getAllOrders = async (req, res) => {
    try {
        const [rows] = await OrderModel.findAll();
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getAllOrders]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// GET /api/orders/stats  [Admin only]
const getOrderStats = async (req, res) => {
    try {
        const [[totals]] = await OrderModel.getStats();
        return res.json({ success: true, data: totals });
    } catch (err) {
        console.error('[getOrderStats]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// PUT /api/orders/:id/confirm  [Admin only]
const confirmOrder = async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [orders] = await OrderModel.findOrderWithItems(conn, id);
        if (orders.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại.' });
        }
        const order = orders[0];
        if (order.status === 'paid') {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Đơn hàng đã được xác nhận trước đó.' });
        }

        await OrderModel.confirmOrderStatus(conn, id);
        await OrderModel.confirmPayment(conn, id);

        const [existingEnroll] = await OrderModel.findEnrollment(conn, order.user_id, order.course_id);
        if (existingEnroll.length === 0) {
            await OrderModel.createEnrollment(conn, order.user_id, order.course_id);
        } else {
            await OrderModel.activateEnrollment(conn, order.user_id, order.course_id);
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
