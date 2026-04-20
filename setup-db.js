/**
 * Setup Database Script
 * Chạy: node setup-db.js <mysql_password>
 * Ví dụ: node setup-db.js mypassword123
 *        node setup-db.js ""   (nếu không có mật khẩu)
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const password = process.argv[2] ?? '';

async function setupDatabase() {
    console.log('\n🔄 Đang kết nối MySQL...');
    let connection;

    try {
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: password,
            multipleStatements: true
        });

        console.log('✅ Kết nối thành công!');

        // Read and execute init.sql
        const sqlPath = path.join(__dirname, 'Src', 'Config', 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📦 Đang chạy init.sql...');
        await connection.query(sql);

        console.log('✅ Database và bảng đã được tạo thành công!');
        console.log('📋 Bảng đã tạo: users, courses');
        console.log('\n🚀 Bây giờ hãy cập nhật file .env với mật khẩu MySQL của bạn, rồi chạy: npm start\n');
    } catch (err) {
        console.error('\n❌ Lỗi:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Gợi ý: Chạy lại với mật khẩu đúng:');
            console.log('   node setup-db.js <mật_khẩu_mysql>\n');
        }
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
