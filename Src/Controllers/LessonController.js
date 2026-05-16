const db          = require('../Config/db');
const LessonModel = require('../Models/LessonModel');

// GET /api/lessons?course_id=X
const getLessonsByCourse = async (req, res) => {
    const { course_id } = req.query;
    if (!course_id) {
        return res.status(400).json({ success: false, message: 'Thiếu course_id.' });
    }
    try {
        const [rows] = await LessonModel.findByCourse(course_id);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getLessonsByCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// GET /api/lessons/:id
const getLessonById = async (req, res) => {
    try {
        const [lessonRows] = await LessonModel.findById(req.params.id);
        if (lessonRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bài học không tồn tại.' });
        }
        const lesson = lessonRows[0];

        const [quizzes] = await LessonModel.findQuizzesByLesson(lesson.id);
        for (const quiz of quizzes) {
            const [options] = await LessonModel.findOptionsByQuiz(quiz.id);
            quiz.options = options;
        }
        lesson.quizzes = quizzes;

        return res.json({ success: true, data: lesson });
    } catch (err) {
        console.error('[getLessonById]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// POST /api/lessons  [Admin only]
const createLesson = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { course_id, title, video_url, theory_md, order_index, quizzes = [] } = req.body;
        if (!title || !course_id) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ success: false, message: 'Thiếu tên bài học hoặc khóa học.' });
        }

        const [[{ cnt }]] = await LessonModel.countByCourse(conn, course_id);
        const finalOrder  = order_index ?? (cnt + 1);

        const [result] = await LessonModel.create(conn, course_id, { title, video_url, theory_md }, finalOrder);
        await insertQuizzes(conn, result.insertId, quizzes);

        await conn.commit();
        return res.status(201).json({ success: true, message: 'Tạo bài học thành công!', data: { id: result.insertId } });
    } catch (err) {
        await conn.rollback();
        console.error('[createLesson]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    } finally {
        conn.release();
    }
};

// PUT /api/lessons/:id  [Admin only]
const updateLesson = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const lessonId = req.params.id;

        const [check] = await conn.query('SELECT id FROM lessons WHERE id = ?', [lessonId]);
        if (check.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Bài học không tồn tại.' });
        }

        await LessonModel.update(conn, lessonId, req.body);
        await clearQuizzes(conn, lessonId);
        await insertQuizzes(conn, lessonId, req.body.quizzes || []);

        await conn.commit();
        return res.json({ success: true, message: 'Cập nhật bài học thành công!' });
    } catch (err) {
        await conn.rollback();
        console.error('[updateLesson]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    } finally {
        conn.release();
    }
};

// DELETE /api/lessons/:id  [Admin only]
const deleteLesson = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const lessonId = req.params.id;

        await clearQuizzes(conn, lessonId);
        const [result] = await LessonModel.remove(conn, lessonId);

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'Bài học không tồn tại.' });
        }

        await conn.commit();
        return res.json({ success: true, message: 'Xóa bài học thành công!' });
    } catch (err) {
        await conn.rollback();
        console.error('[deleteLesson]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    } finally {
        conn.release();
    }
};

async function clearQuizzes(conn, lessonId) {
    const [quizzes] = await conn.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lessonId]);
    for (const quiz of quizzes) {
        await LessonModel.deleteOptionsByQuiz(conn, quiz.id);
    }
    await LessonModel.deleteQuizzesByLesson(conn, lessonId);
}

async function insertQuizzes(conn, lessonId, quizzes) {
    for (const quiz of quizzes) {
        if (!quiz.question_text) continue;
        const [qRes] = await LessonModel.createQuiz(conn, lessonId, quiz.question_text);
        for (const opt of (quiz.options || [])) {
            if (!opt.option_text) continue;
            await LessonModel.createQuizOption(conn, qRes.insertId, opt.option_text, opt.is_correct);
        }
    }
}

module.exports = { getLessonsByCourse, getLessonById, createLesson, updateLesson, deleteLesson };
