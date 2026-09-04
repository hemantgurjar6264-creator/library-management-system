const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/members/bulk-upload',
  method: 'POST',
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
