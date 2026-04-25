const bcrypt = require('bcryptjs');
(async () => {
    try {
        console.log('Testing bcrypt.hash...');
        const hashed = await bcrypt.hash('password123', 10);
        console.log('Hashed:', hashed);
        const valid = await bcrypt.compare('password123', hashed);
        console.log('Valid:', valid);
        process.exit(0);
    } catch (err) {
        console.error('Bcrypt Error:', err.message);
        process.exit(1);
    }
})();
