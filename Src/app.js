const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes   = require('./Routes/authRoutes');
const courseRoutes = require('./Routes/courseRoutes');
const lessonRoutes = require('./Routes/lessonRoutes');
const userRoutes   = require('./Routes/userRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');
const orderRoutes  = require('./Routes/orderRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
    origin: '*',  // Cho phép tất cả origin khi dev, thay bằng domain cụ thể khi production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve static files ────────────────────────────────────
app.use('/Public', express.static(path.join(__dirname, '..', 'Public')));
app.use(express.static(path.join(__dirname, '..', 'Public'))); // Giữ cả root để hỗ trợ link trực tiếp index.html
app.use('/views', express.static(path.join(__dirname, '..', 'Views')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

// ── Serve index.html for all non-API GET requests ─────────
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('[Global Error]', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ không xác định.' });
});

module.exports = app;
