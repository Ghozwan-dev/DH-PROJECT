const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { resolveHtmlIncludes } = require('./scripts/html-assembler');

let port = 3000;
const rootDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const requestHandler = (req, res) => {
  // Parsing URL
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/preview.html';
  }

  let filePath = path.join(rootDir, reqPath);

  // Mencegah traversal keluar folder
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <div style="font-family:sans-serif; text-align:center; padding:40px;">
          <h2>404 - File Tidak Ditemukan</h2>
          <p><a href="/preview.html">Kembali ke Pratinjau Darul Hikmah</a></p>
        </div>
      `);
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'preview.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        return res.end('500 Internal Server Error');
      }

      let body = content;
      if (ext === '.html') {
        try {
          body = resolveHtmlIncludes(content.toString('utf8'), rootDir, new Set([filePath]));
        } catch (includeErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('500 Partial Include Error: ' + includeErr.message);
        }
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(body);
    });
  });
};

function startServer(attemptPort) {
  const maxPort = port + 20;
  const server = http.createServer(requestHandler);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptPort < maxPort) {
      console.log(`Port ${attemptPort} sedang digunakan, mencoba port ${attemptPort + 1}...`);
      startServer(attemptPort + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(attemptPort, () => {
    const url = `http://localhost:${attemptPort}`;
    console.log('\n======================================================');
    console.log('   DARUL HIKMAH - SERVER PRATINJAU MOBILE AKTIF');
    console.log('======================================================');
    console.log(`\n  * URL Lokal   : ${url}`);
    console.log(`  * File Utama  : ${url}/preview.html`);
    console.log('\n  Tekan Ctrl+C di terminal untuk menghentikan server.\n');

    // Buka otomatis di browser default (Windows: start, Mac: open, Linux: xdg-open)
    const openCmd = process.platform === 'win32'
      ? `start ${url}`
      : (process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);

    exec(openCmd, () => {
      // Browser dibuka
    });
  });
}

startServer(port);
