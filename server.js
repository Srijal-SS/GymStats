const http = require('http');
const fs = require('fs');
const path = require('path');

const db = path.join(__dirname, 'workouts.json');

http.createServer((req, res) => {
  if (req.url === '/api/workouts' && req.method === 'GET') {
    if (!fs.existsSync(db)) fs.writeFileSync(db, '[]');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(fs.readFileSync(db, 'utf8'));
  }

  if (req.url === '/api/workouts' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    return req.on('end', () => {
      fs.writeFileSync(db, body);
      res.writeHead(200);
      res.end('{"success":true}');
    });
  }

  const file = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const mimes = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
  
  if (fs.existsSync(file)) {
    res.writeHead(200, { 'Content-Type': mimes[path.extname(file)] || 'text/plain' });
    res.end(fs.readFileSync(file));
  } else {
    res.writeHead(404);
    res.end('404');
  }
}).listen(3000, () => console.log('http://localhost:3000'));
