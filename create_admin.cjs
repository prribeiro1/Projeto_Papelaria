
const https = require('https');

const data = JSON.stringify({
    email: 'admin1@admin.com',
    password: '123456',
    data: { full_name: 'Admin 1' }
});

const options = {
    hostname: 'scfjsxahocxzekjwujoh.supabase.co',
    path: '/auth/v1/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZmpzeGFob2N4emVrand1am9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTQ3MzcsImV4cCI6MjA4MjY5MDczN30.z9yT0SW4ebpjNdVN2ZuwQxjU3Nk_Iz2p-1LuMlL4fVw',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
