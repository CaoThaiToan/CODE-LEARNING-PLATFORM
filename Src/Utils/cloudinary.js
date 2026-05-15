const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Kiểm tra xem các biến môi trường có tồn tại không
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('❌ [Cloudinary Config] Thiếu biến môi trường Cloudinary trong file .env!');
    console.log('👉 Vui lòng kiểm tra lại CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
    console.log('✅ [Cloudinary Config] Đã tìm thấy cấu hình Cloudinary cho:', CLOUDINARY_CLOUD_NAME);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = cloudinary;

