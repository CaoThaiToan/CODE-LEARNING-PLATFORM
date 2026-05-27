const LessonModel = require('../Models/LessonModel');
const { askLessonAI } = require('../Services/aiService');

const askAI = async (req, res) => {
    try {
        const { lesson_id, question } = req.body;

        if (!lesson_id || !question) {
            return res.status(400).json({
                success: false,
                message: 'Thieu lesson_id hoac question.'
            });
        }

        const [rows] = await LessonModel.findById(lesson_id);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay bai hoc.'
            });
        }

        const lesson = rows[0];
        const answer = await askLessonAI({ lesson, question });

        return res.json({
            success: true,
            answer
        });
    } catch (err) {
        console.error('[askAI]', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Loi khi goi Gemini AI.'
        });
    }
};

module.exports = { askAI };
