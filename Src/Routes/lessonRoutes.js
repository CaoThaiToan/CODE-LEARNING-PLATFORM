const express = require('express');
const router  = express.Router();
const { getLessonsByCourse, getLessonById, createLesson, updateLesson, deleteLesson } = require('../Controllers/LessonController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

router.get('/',       getLessonsByCourse);
router.get('/:id',    getLessonById);
router.post('/',      verifyToken, requireAdmin, createLesson);
router.put('/:id',    verifyToken, requireAdmin, updateLesson);
router.delete('/:id', verifyToken, requireAdmin, deleteLesson);

module.exports = router;
