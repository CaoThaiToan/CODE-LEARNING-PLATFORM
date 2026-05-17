const db = require('../Config/db');
const LessonModel = require('../Models/LessonModel');
const fs = require('fs');
const csv = require('csv-parser');

// POST /api/quizzes/upload-csv
const uploadQuizCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file CSV.' });
    }

    const { lesson_id } = req.body;
    if (!lesson_id) {
        return res.status(400).json({ success: false, message: 'Thiếu lesson_id.' });
    }

    const conn = await db.getConnection();
    const results = [];

    try {
        await conn.beginTransaction();

        // Đọc file CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        for (const row of results) {
            // Mong đợi CSV có các cột: question, option_a, option_b, option_c, option_d, answer
            const { question, option_a, option_b, option_c, option_d, answer } = row;
            
            if (!question || !option_a || !option_b || !answer) continue;

            const [qRes] = await LessonModel.createQuiz(conn, lesson_id, question);
            const quizId = qRes.insertId;

            const options = [
                { text: option_a, key: 'A' },
                { text: option_b, key: 'B' },
                { text: option_c, key: 'C' },
                { text: option_d, key: 'D' }
            ];

            for (const opt of options) {
                if (!opt.text) continue;
                const isCorrect = (answer.trim().toUpperCase() === opt.key);
                await LessonModel.createQuizOption(conn, quizId, opt.text, isCorrect);
            }
        }

        await conn.commit();
        
        // Xóa file tạm sau khi xử lý xong
        fs.unlinkSync(req.file.path);

        return res.json({ success: true, message: `Đã upload thành công ${results.length} câu hỏi.` });
    } catch (err) {
        await conn.rollback();
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('[uploadQuizCSV]', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý file CSV.' });
    } finally {
        conn.release();
    }
};

// GET /api/quizzes/lesson/:lessonId
// Lấy danh sách câu hỏi nhưng ẨN đáp án đúng để bảo mật
const getQuizzesForUser = async (req, res) => {
    try {
        const [quizzes] = await LessonModel.findQuizzesByLesson(req.params.lessonId);
        
        for (const quiz of quizzes) {
            const [options] = await db.query(
                'SELECT id, option_text FROM quiz_options WHERE quiz_id = ?', 
                [quiz.id]
            );
            quiz.options = options;
        }

        return res.json({ success: true, data: quizzes });
    } catch (err) {
        console.error('[getQuizzesForUser]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// POST /api/quizzes/submit
// Chấm điểm bài làm
const submitAnswers = async (req, res) => {
    const { lesson_id, answers } = req.body; 
    // answers format: [{ quiz_id: 1, selected_option_id: 10 }, ...]

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: 'Dữ liệu trả lời không hợp lệ.' });
    }

    try {
        let score = 0;
        const total = answers.length;
        const results = [];

        for (const item of answers) {
            const [rows] = await db.query(
                'SELECT id FROM quiz_options WHERE quiz_id = ? AND is_correct = 1',
                [item.quiz_id]
            );

            const correctOptionId = rows[0]?.id;
            const isCorrect = (item.selected_option_id == correctOptionId);

            if (isCorrect) score++;

            results.push({
                quiz_id: item.quiz_id,
                is_correct: isCorrect,
                correct_option_id: correctOptionId // Trả về để user biết mình sai ở đâu
            });
        }

        return res.json({
            success: true,
            score,
            total,
            percent: Math.round((score / total) * 100),
            results
        });
    } catch (err) {
        console.error('[submitAnswers]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi chấm điểm.' });
    }
};

module.exports = { uploadQuizCSV, getQuizzesForUser, submitAnswers };
