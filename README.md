# Code Learning Platform 🚀

Code Learning Platform là một hệ thống E-Learning (học trực tuyến) tập trung vào việc cung cấp các khóa học lập trình. Dự án được xây dựng theo kiến trúc **MVC** (Model-View-Controller) cho phía Backend và sử dụng kiến trúc **SPA** (Single Page Application) cơ bản cho phía Frontend.

## ✨ Tính năng nổi bật

### Dành cho người dùng (Học viên)
- **Xác thực người dùng:** Đăng ký, đăng nhập bảo mật sử dụng JWT (JSON Web Tokens) và mã hóa mật khẩu bằng bcrypt.
- **Tìm kiếm khóa học (Search-as-you-type):** Tìm kiếm khóa học theo thời gian thực ngay khi đang gõ.
- **Hệ thống khóa học VIP:** Phân biệt khóa học thường và khóa học VIP với giao diện nổi bật.
- **Xem Video Bài giảng:** Tích hợp trình phát video chất lượng cao và bảo mật thông qua **Cloudinary**.
- **Làm bài Quiz:** Hệ thống bài tập trắc nghiệm đánh giá năng lực học viên.

### Dành cho Quản trị viên (Admin)
- **Quản lý khóa học & Bài học:** Thêm, sửa, xóa nội dung các khóa học.
- **Quản lý Video lưu trữ:** Tải lên và quản lý video học liệu sử dụng Cloudinary và Multer.
- **Nhập dữ liệu nhanh (Bulk Upload):** Tải lên hàng loạt câu hỏi Quiz dễ dàng thông qua tệp tin CSV (tích hợp `csv-parser`).

---

## 🛠️ Công nghệ sử dụng

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Cơ sở dữ liệu:** MySQL (sử dụng thư viện `mysql2`)
- **Kiến trúc:** MVC (Model - View - Controller)
- **Lưu trữ Media:** Cloudinary

**Frontend:**
- **Ngôn ngữ:** HTML5, CSS3 (Vanilla / Custom CSS), JavaScript (Vanilla)
- **Kiến trúc UI:** Single Page Application (SPA) thông qua cơ chế chèn DOM Fragment (Dynamic Injection).

---

## ⚙️ Yêu cầu hệ thống (Prerequisites)

Để chạy dự án này trên máy cá nhân, bạn cần cài đặt sẵn:
- **Node.js** (Phiên bản 16.x trở lên)
- **MySQL Server** (Hoặc XAMPP/WAMP để chạy MySQL cục bộ)
- Tài khoản **Cloudinary** (Để lấy API Key lưu trữ video/hình ảnh)

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

**1. Clone dự án về máy**
```bash
git clone https://github.com/your-username/code-learning-platform.git
cd code-learning-platform
```

**2. Cài đặt các thư viện (Dependencies)**
```bash
npm install
```

**3. Cấu hình biến môi trường**
Tạo một tệp tin `.env` ở thư mục gốc của dự án (ngang hàng với `package.json`) và điền các thông tin dựa theo mẫu sau:

```env
# Server
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=code_learning_db

# JWT Secret Key
JWT_SECRET=your_super_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**4. Thiết lập cơ sở dữ liệu**
- Khởi động MySQL Server của bạn.
- Tạo một database có tên tương ứng với `DB_NAME` trong file `.env`.
- *(Import file `.sql` vào database của bạn nếu có)*.

**5. Khởi động Server**
Bạn có thể chạy dự án ở một trong 2 chế độ:

- Chế độ phát triển (Tự động tải lại khi sửa code nhờ Nodemon):
  ```bash
  npm run dev
  ```
- Chế độ môi trường thật (Production):
  ```bash
  npm start
  ```

Sau khi chạy thành công, hãy mở trình duyệt và truy cập vào: **http://localhost:3000**

---

## 📁 Cấu trúc thư mục (Project Structure)

```text
CODE LEARNING PLATFORM/
├── Src/
│   ├── Controllers/    # Chứa logic xử lý của các API và render (LessonController, QuizController...)
│   ├── Models/         # Chứa các file tương tác trực tiếp với MySQL DB
│   ├── Routes/         # Định nghĩa các endpoint của hệ thống API
│   ├── app.js          # Cấu hình Express app và middleware chính
│   └── ...
├── Views/              # Chứa các file HTML giao diện Frontend
│   ├── Fragments/      # Các mảnh HTML phục vụ cho SPA (Trang chủ, chi tiết KH, Admin...)
│   └── index.html      # Tệp tin gốc (Entry point cho UI)
├── Public/             # Chứa tài nguyên tĩnh (CSS, JS của client, Images...)
├── server.js           # File khởi động Server
├── package.json        # Thông tin các thư viện
└── .env                # (Không push lên Git) Chứa biến môi trường
```

---

## 🤝 Đóng góp (Contributing)

Nếu bạn muốn đóng góp cho dự án này, vui lòng tạo một **Pull Request** hoặc mở một **Issue** để thảo luận về những thay đổi mà bạn muốn thực hiện.

## 📝 Giấy phép (License)

Dự án này được tạo ra với mục đích học tập và làm đồ án. Mọi cá nhân đều có thể tham khảo.
