// Using built-in fetch in Node 18+
(async () => {
    try {
        const res = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'ToanTest',
                full_name: 'Cao Thái Toàn Test',
                email: 'test' + Date.now() + '@gmail.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Body:', data);
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
})();
