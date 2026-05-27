const express = require('express');
const router = express.Router();

const { askAI } = require('../Controllers/AIController');
const { verifyToken } = require('../Middleware/authMiddleware');

router.post('/ask', verifyToken, askAI);

module.exports = router;