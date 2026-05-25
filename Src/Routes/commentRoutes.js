const express = require('express');
const router  = express.Router();
const { getComments, postComment } = require('../Controllers/CommentController');
const { verifyToken } = require('../Middleware/authMiddleware');

router.get('/', getComments);
router.post('/', verifyToken, postComment);

module.exports = router;
