const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');
const cloudinary = require('../Utils/cloudinary');

// ── Multer Storage Configuration ──────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../Public/images/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// ── File Filter (Only Images) ─────────────────────────────
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file hình ảnh!'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// POST /api/upload/image - Admin only
router.post('/image', verifyToken, requireAdmin, upload.single('image'), (req, res) => {
    console.log('--- UPLOAD REQUEST RECEIVED ---');
    console.log('File:', req.file);
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn một tệp hình ảnh.' });
        }

        // Trả về đường dẫn bao gồm prefix Public/ để khớp với frontend
        const imageUrl = `Public/images/uploads/${req.file.filename}`;
        
        res.status(200).json({
            success: true,
            message: 'Tải lên thành công!',
            url: imageUrl
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/upload/video-signature - API cấp chữ ký để up trực tiếp lên Cloudinary
router.get('/video-signature', verifyToken, requireAdmin, (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);
        
        // Tạo chữ ký (signature) cho upload
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: 'courses_videos' // Video sẽ được lưu vào thư mục này trên Cloudinary
        }, process.env.CLOUDINARY_API_SECRET);

        res.status(200).json({
            success: true,
            signature: signature,
            timestamp: timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error('Lỗi tạo signature:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo chữ ký upload.' });
    }
});

module.exports = router;
