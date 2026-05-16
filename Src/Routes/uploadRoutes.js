const express    = require('express');
const router     = express.Router();
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');
const upload     = require('../Middleware/uploadMiddleware');
const cloudinary = require('../Utils/cloudinary');

router.post('/image', verifyToken, requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn một tệp hình ảnh.' });
    }
    return res.status(200).json({
        success: true,
        message: 'Tải lên thành công!',
        url: `Public/images/uploads/${req.file.filename}`
    });
});

router.get('/video-signature', verifyToken, requireAdmin, (req, res) => {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            { timestamp, folder: 'courses_videos' },
            process.env.CLOUDINARY_API_SECRET
        );
        return res.status(200).json({
            success:   true,
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey:    process.env.CLOUDINARY_API_KEY
        });
    } catch (err) {
        console.error('[video-signature]', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi tạo chữ ký upload.' });
    }
});

module.exports = router;
