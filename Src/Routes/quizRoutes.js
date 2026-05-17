const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const quizController = require('../Controllers/QuizController');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');

// Cấu hình Multer riêng cho CSV
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../Public/uploads/csv');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `quiz-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file CSV!'), false);
        }
    }
});

// Routes
router.post('/upload-csv', verifyToken, requireAdmin, upload.single('file'), quizController.uploadQuizCSV);
router.get('/lesson/:lessonId', verifyToken, quizController.getQuizzesForUser);
router.post('/submit', verifyToken, quizController.submitAnswers);

module.exports = router;
