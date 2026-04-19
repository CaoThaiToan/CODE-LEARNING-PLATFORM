require('dotenv').config();
const app  = require('./Src/app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`\n🚀 Server đang chạy tại: http://localhost:${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
});
