const db = require('../Src/Config/db');
(async () => {
    try {
        console.log('Inserting default roles...');
        await db.query("INSERT INTO roles (id, role_name, description) VALUES (1, 'Admin', 'Administrator'), (2, 'User', 'Normal User')");
        console.log('✅ Roles inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error inserting roles:', err.message);
        process.exit(1);
    }
})();
