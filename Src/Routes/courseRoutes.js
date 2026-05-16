const express = require('express');
const router  = express.Router();
const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../Controllers/CourseController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

router.get('/',     getAllCourses);
router.get('/:id',  getCourseById);
router.post('/',    verifyToken, requireAdmin, createCourse);
router.put('/:id',  verifyToken, requireAdmin, updateCourse);
router.delete('/:id', verifyToken, requireAdmin, deleteCourse);

module.exports = router;
