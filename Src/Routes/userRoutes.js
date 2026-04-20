const express = require('express');
const router  = express.Router();
const { getAllUsers, getUserCourses, deleteUser } = require('../Controllers/UserController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

// GET  /api/users              - Admin only
router.get('/', verifyToken, requireAdmin, getAllUsers);

// GET  /api/users/:id/courses  - Admin only
router.get('/:id/courses', verifyToken, requireAdmin, getUserCourses);

// DELETE /api/users/:id        - Admin only (soft delete)
router.delete('/:id', verifyToken, requireAdmin, deleteUser);

module.exports = router;
