const express = require('express');
const router  = express.Router();
const { getAllUsers, getUserCourses, getMyCourses, deleteUser } = require('../Controllers/UserController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

router.get('/me/courses',    verifyToken, getMyCourses);
router.get('/',              verifyToken, requireAdmin, getAllUsers);
router.get('/:id/courses',   verifyToken, requireAdmin, getUserCourses);
router.delete('/:id',        verifyToken, requireAdmin, deleteUser);

module.exports = router;
