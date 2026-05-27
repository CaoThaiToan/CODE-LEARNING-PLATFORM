const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ── API Routes ────────────────────────────────────────────
const authRoutes   = require('./Routes/authRoutes');
const courseRoutes = require('./Routes/courseRoutes');
const lessonRoutes = require('./Routes/lessonRoutes');
const userRoutes   = require('./Routes/userRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');
const orderRoutes  = require('./Routes/orderRoutes');
const quizRoutes   = require('./Routes/quizRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const aiRoutes = require('./Routes/aiRoutes');

// ── View Routes (serve HTML pages) ───────────────────────
const viewRoutes = require('./Routes/viewRoutes');

const app = express();

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Body Parsers ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ──────────────────────────────────────────
app.use('/Public', express.static(path.join(__dirname, '..', 'Public')));
app.use(express.static(path.join(__dirname, '..', 'Public')));
app.use('/views', express.static(path.join(__dirname, '..', 'Views')));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/upload',  uploadRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);

// ── View Routes ───────────────────────────────────────────
app.use('/', viewRoutes);

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, _next) => {
    console.error('[Global Error]', err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Lỗi máy chủ không xác định.' });
});

module.exports = app;
