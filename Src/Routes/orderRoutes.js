const express = require('express');
const router  = express.Router();
const { createOrder, getAllOrders, getOrderStats, confirmOrder } = require('../Controllers/OrderController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

router.post('/',              verifyToken, createOrder);
router.get('/stats',          verifyToken, requireAdmin, getOrderStats);
router.get('/',               verifyToken, requireAdmin, getAllOrders);
router.put('/:id/confirm',    verifyToken, requireAdmin, confirmOrder);

module.exports = router;
