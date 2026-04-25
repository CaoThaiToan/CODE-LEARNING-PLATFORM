const jwt = require('jsonwebtoken');
require('dotenv').config();
try {
    console.log('Testing jwt.sign...');
    const payload = { id: 1, username: 'test' };
    const secret = process.env.JWT_SECRET;
    console.log('Secret:', secret);
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    console.log('Token created successfully');
    const decoded = jwt.verify(token, secret);
    console.log('Decoded:', decoded);
    process.exit(0);
} catch (err) {
    console.error('JWT Error:', err.message);
    process.exit(1);
}
