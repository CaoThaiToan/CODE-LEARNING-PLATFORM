const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  [Cloudinary] Thiếu biến môi trường. Kiểm tra file .env');
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure:     true
    });
    console.log('✅ [Cloudinary] Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
}

module.exports = cloudinary;
