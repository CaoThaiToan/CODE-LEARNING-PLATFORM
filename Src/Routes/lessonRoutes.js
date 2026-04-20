const express = require('express');
const router  = express.Router();
const {
    getLessonsByCourse,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
} = require('../Controllers/LessonController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

// GET  /api/lessons?course_id=X  - Public
router.get('/', getLessonsByCourse);

// GET  /api/lessons/:id          - Public
router.get('/:id', getLessonById);

// POST /api/lessons              - Admin only
router.post('/', verifyToken, requireAdmin, createLesson);

// PUT  /api/lessons/:id          - Admin only
router.put('/:id', verifyToken, requireAdmin, updateLesson);

// DELETE /api/lessons/:id        - Admin only
router.delete('/:id', verifyToken, requireAdmin, deleteLesson);

module.exports = router;
