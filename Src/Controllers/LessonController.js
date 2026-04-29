const db = require('../Config/db');

// ── GET /api/lessons?course_id=X ──────────────────────────
const getLessonsByCourse = async (req, res) => {
    const { course_id } = req.query;
    if (!course_id) {
        return res.status(400).json({ success: false, message: 'Thiếu course_id.' });
    }
    try {
        const [rows] = await db.query(
            'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC, id ASC',
            [course_id]
        );
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getLessonsByCourse]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── GET /api/lessons/:id ──────────────────────────────────
const getLessonById = async (req, res) => {
    try {
        const [lessonRows] = await db.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
        if (lessonRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bài học không tồn tại.' });
        }
        const lesson = lessonRows[0];

        // Fetch quizzes + options
        const [quizzes] = await db.query('SELECT * FROM quizzes WHERE lesson_id = ?', [lesson.id]);
        for (const quiz of quizzes) {
            const [options] = await db.query('SELECT * FROM quiz_options WHERE quiz_id = ?', [quiz.id]);
            quiz.options = options;
        }
        lesson.quizzes = quizzes;

        return res.json({ success: true, data: lesson });
    } catch (err) {
        console.error('[getLessonById]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── POST /api/lessons  [Admin only] ───────────────────────
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

        // Count existing lessons to set order_index if not provided
        const [[{ cnt }]] = await conn.query('SELECT COUNT(*) as cnt FROM lessons WHERE course_id = ?', [course_id]);
        const finalOrder = order_index ?? (cnt + 1);

        const [result] = await conn.query(
            'INSERT INTO lessons (course_id, title, content_type, video_url, theory_md, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [course_id, title, video_url ? 'video' : 'theory', video_url || null, theory_md || null, finalOrder]
        );
        const lessonId = result.insertId;

        // Insert quizzes
        for (const quiz of quizzes) {
            if (!quiz.question_text) continue;
            const [qRes] = await conn.query(
                'INSERT INTO quizzes (lesson_id, question_text) VALUES (?, ?)',
                [lessonId, quiz.question_text]
            );
            const quizId = qRes.insertId;
            for (const opt of (quiz.options || [])) {
                if (!opt.option_text) continue;
                await conn.query(
                    'INSERT INTO quiz_options (quiz_id, option_text, is_correct) VALUES (?, ?, ?)',
                    [quizId, opt.option_text, opt.is_correct ? 1 : 0]
                );
            }
        }

        await conn.commit();
        conn.release();
        return res.status(201).json({ success: true, message: 'Tạo bài học thành công!', data: { id: lessonId } });
    } catch (err) {
        await conn.rollback();
        conn.release();
        console.error('[createLesson]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── PUT /api/lessons/:id  [Admin only] ────────────────────
const updateLesson = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { title, video_url, theory_md, order_index, quizzes = [] } = req.body;
        const lessonId = req.params.id;

        const [check] = await conn.query('SELECT id FROM lessons WHERE id = ?', [lessonId]);
        if (check.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ success: false, message: 'Bài học không tồn tại.' });
        }

        await conn.query(
            'UPDATE lessons SET title = ?, content_type = ?, video_url = ?, theory_md = ?, order_index = ? WHERE id = ?',
            [title, video_url ? 'video' : 'theory', video_url || null, theory_md || null, order_index || 1, lessonId]
        );

        // Delete old quizzes and options, re-insert
        const [oldQuizzes] = await conn.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lessonId]);
        for (const oq of oldQuizzes) {
            await conn.query('DELETE FROM quiz_options WHERE quiz_id = ?', [oq.id]);
        }
        await conn.query('DELETE FROM quizzes WHERE lesson_id = ?', [lessonId]);

        for (const quiz of quizzes) {
            if (!quiz.question_text) continue;
            const [qRes] = await conn.query(
                'INSERT INTO quizzes (lesson_id, question_text) VALUES (?, ?)',
                [lessonId, quiz.question_text]
            );
            const quizId = qRes.insertId;
            for (const opt of (quiz.options || [])) {
                if (!opt.option_text) continue;
                await conn.query(
                    'INSERT INTO quiz_options (quiz_id, option_text, is_correct) VALUES (?, ?, ?)',
                    [quizId, opt.option_text, opt.is_correct ? 1 : 0]
                );
            }
        }

        await conn.commit();
        conn.release();
        return res.json({ success: true, message: 'Cập nhật bài học thành công!' });
    } catch (err) {
        await conn.rollback();
        conn.release();
        console.error('[updateLesson]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

// ── DELETE /api/lessons/:id  [Admin only] ─────────────────
const deleteLesson = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const lessonId = req.params.id;

        const [oldQuizzes] = await conn.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lessonId]);
        for (const oq of oldQuizzes) {
            await conn.query('DELETE FROM quiz_options WHERE quiz_id = ?', [oq.id]);
        }
        await conn.query('DELETE FROM quizzes WHERE lesson_id = ?', [lessonId]);
        const [result] = await conn.query('DELETE FROM lessons WHERE id = ?', [lessonId]);

        if (result.affectedRows === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ success: false, message: 'Bài học không tồn tại.' });
        }

        await conn.commit();
        conn.release();
        return res.json({ success: true, message: 'Xóa bài học thành công!' });
    } catch (err) {
        await conn.rollback();
        conn.release();
        console.error('[deleteLesson]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

module.exports = { getLessonsByCourse, getLessonById, createLesson, updateLesson, deleteLesson };
