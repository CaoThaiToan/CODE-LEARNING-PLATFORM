const express = require('express');
const router  = express.Router();
const viewController = require('../Controllers/ViewController');

router.get('/',                    viewController.renderHome);
router.get('/index.html',          viewController.renderHome);
router.get('/login',               viewController.renderLogin);
router.get('/login-register.html', viewController.renderLogin);
router.get('/admin',               viewController.renderAdmin);
router.get('/admin.html',          viewController.renderAdmin);

module.exports = router;
