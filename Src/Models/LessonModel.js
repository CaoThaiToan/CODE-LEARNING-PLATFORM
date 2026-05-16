const db = require('../Config/db');

const findByCourse = (courseId) =>
    db.query(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC, id ASC',
        [courseId]
    );

const findById = (id) =>
    db.query('SELECT * FROM lessons WHERE id = ?', [id]);

const countByCourse = (conn, courseId) =>
    conn.query('SELECT COUNT(*) as cnt FROM lessons WHERE course_id = ?', [courseId]);

const create = (conn, courseId, { title, video_url, theory_md }, finalOrder) =>
    conn.query(
        'INSERT INTO lessons (course_id, title, content_type, video_url, theory_md, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        [courseId, title, video_url ? 'video' : 'theory', video_url || null, theory_md || null, finalOrder]
    );

const update = (conn, id, { title, video_url, theory_md, order_index }) =>
    conn.query(
        'UPDATE lessons SET title = ?, content_type = ?, video_url = ?, theory_md = ?, order_index = ? WHERE id = ?',
        [title, video_url ? 'video' : 'theory', video_url || null, theory_md || null, order_index || 1, id]
    );

const remove = (conn, id) =>
    conn.query('DELETE FROM lessons WHERE id = ?', [id]);

const findQuizzesByLesson = (lessonId) =>
    db.query('SELECT * FROM quizzes WHERE lesson_id = ?', [lessonId]);

const findOptionsByQuiz = (quizId) =>
    db.query('SELECT * FROM quiz_options WHERE quiz_id = ?', [quizId]);

const deleteOptionsByQuiz = (conn, quizId) =>
    conn.query('DELETE FROM quiz_options WHERE quiz_id = ?', [quizId]);

const deleteQuizzesByLesson = (conn, lessonId) =>
    conn.query('DELETE FROM quizzes WHERE lesson_id = ?', [lessonId]);

const createQuiz = (conn, lessonId, questionText) =>
    conn.query('INSERT INTO quizzes (lesson_id, question_text) VALUES (?, ?)', [lessonId, questionText]);

const createQuizOption = (conn, quizId, optionText, isCorrect) =>
    conn.query(
        'INSERT INTO quiz_options (quiz_id, option_text, is_correct) VALUES (?, ?, ?)',
        [quizId, optionText, isCorrect ? 1 : 0]
    );

module.exports = {
    findByCourse, findById, countByCourse,
    create, update, remove,
    findQuizzesByLesson, findOptionsByQuiz,
    deleteOptionsByQuiz, deleteQuizzesByLesson,
    createQuiz, createQuizOption
};
