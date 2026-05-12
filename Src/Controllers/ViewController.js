const path = require('path');

const viewsDir = path.join(__dirname, '..', '..', 'Views');

exports.renderHome = (req, res) => {
    res.sendFile(path.join(viewsDir, 'index.html'));
};

exports.renderLogin = (req, res) => {
    res.sendFile(path.join(viewsDir, 'login-register.html'));
};

exports.renderAdmin = (req, res) => {
    res.sendFile(path.join(viewsDir, 'admin.html'));
};
