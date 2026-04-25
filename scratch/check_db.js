const db = require('../Src/Config/db');

async function checkData() {
    try {
        const [rows] = await db.query('SELECT id, title, level, price FROM courses');
        console.log('--- COURSES DATA ---');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
