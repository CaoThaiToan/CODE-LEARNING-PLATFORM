const express = require('express');
const router  = express.Router();
const { createOrder, getAllOrders, getOrderStats, confirmOrder } = require('../Controllers/OrderController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

// POST /api/orders           - User tạo đơn hàng (phải đăng nhập)
router.post('/', verifyToken, createOrder);

// GET  /api/orders/stats     - Admin: lấy thống kê đơn hàng
router.get('/stats', verifyToken, requireAdmin, getOrderStats);

// GET  /api/orders           - Admin: lấy tất cả đơn hàng
router.get('/', verifyToken, requireAdmin, getAllOrders);

// PUT  /api/orders/:id/confirm - Admin xác nhận đơn
router.put('/:id/confirm', verifyToken, requireAdmin, confirmOrder);

module.exports = router;
