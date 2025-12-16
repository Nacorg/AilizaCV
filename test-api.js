const http = require('http');

const postData = JSON.stringify({
  cvText: "Desarrollador Full Stack con experiencia en JavaScript, React, Node.js. Experiencia laboral de 3 años en desarrollo web."
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/analyze-cv',  // Use the Vercel-compatible endpoint
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
