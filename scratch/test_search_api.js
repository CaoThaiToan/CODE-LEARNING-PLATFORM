const fetch = require('node-fetch');

async function checkSearch() {
    try {
        const res = await fetch('http://localhost:3000/api/courses?q=javascript');
        const data = await res.json();
        console.log('Search results for "javascript":', data.data.length);
        data.data.forEach(c => console.log(`- ${c.title}`));
        
        const res2 = await fetch('http://localhost:3000/api/courses');
        const data2 = await res2.json();
        console.log('Total courses:', data2.data.length);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSearch();
