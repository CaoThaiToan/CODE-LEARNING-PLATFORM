const db = require('../Src/Config/db');
(async () => {
    try {
        const [rows] = await db.query('SELECT * FROM roles');
        console.log('--- ROLES TABLE CONTENT ---');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Error fetching roles:', err.message);
        process.exit(1);
    }
})();
