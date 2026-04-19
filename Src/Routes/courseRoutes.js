const express = require('express');
const router  = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../Controllers/CourseController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

// GET  /api/courses         - Public
router.get('/', getAllCourses);

// GET  /api/courses/:id     - Public
router.get('/:id', getCourseById);

// POST /api/courses         - Admin only
router.post('/', verifyToken, requireAdmin, createCourse);

// PUT /api/courses/:id      - Admin only
router.put('/:id', verifyToken, requireAdmin, updateCourse);

// DELETE /api/courses/:id   - Admin only
router.delete('/:id', verifyToken, requireAdmin, deleteCourse);

module.exports = router;
