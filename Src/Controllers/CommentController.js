const CommentModel = require('../Models/CommentModel');

// GET /api/comments
const getComments = async (req, res) => {
    try {
        const { course_id } = req.query;
        if (!course_id) {
            return res.status(400).json({ success: false, message: 'Thiếu tham số course_id.' });
        }

        const [rows] = await CommentModel.findCommentsByCourse(course_id);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[getComments]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tải bình luận.' });
    }
};

// POST /api/comments
const postComment = async (req, res) => {
    try {
        const { course_id, content } = req.body;
        const userId = req.user.id;

        if (!course_id) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin khóa học.' });
        }
        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nội dung bình luận không được để trống.' });
        }

        await CommentModel.createComment(course_id, userId, content.trim());
        return res.status(201).json({ success: true, message: 'Gửi bình luận thành công!' });
    } catch (err) {
        console.error('[postComment]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng bình luận.' });
    }
};

module.exports = { getComments, postComment };
