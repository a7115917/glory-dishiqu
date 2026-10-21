/* 荣耀 · 第十区 —— 局域网服务器
   电脑和手机连同一个 WiFi，手机浏览器打开控制台里显示的地址即可。 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function lanAddresses() {
  const out = [];
  const ifs = os.networkInterfaces();
  Object.keys(ifs).forEach(name => {
    (ifs[name] || []).forEach(n => {
      if (n.family === 'IPv4' && !n.internal) out.push({ name, address: n.address });
    });
  });
  return out;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const rel = path.normalize(urlPath).replace(/^([/\\])+/, '');
  const file = path.join(ROOT, rel);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 越界');
    return;
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 找不到 ' + rel);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
  });
});

let port = Number(process.env.PORT || 8080);
let tries = 0;

server.on('error', err => {
  if (err.code === 'EADDRINUSE' && tries < 12) {
    tries++;
    port++;
    server.listen(port, '0.0.0.0');
  } else {
    console.error('启动失败：', err.message);
    process.exit(1);
  }
});

server.on('listening', () => {
  const lan = lanAddresses();
  const line = '─'.repeat(46);
  console.log('');
  console.log('  ' + line);
  console.log('   荣 耀 · 第 十 区     已启动');
  console.log('  ' + line);
  console.log('');
  console.log('   本机打开：   http://localhost:' + port + '/');
  if (lan.length) {
    lan.forEach(n => {
      console.log('   手机打开：   http://' + n.address + ':' + port + '/');
    });
    console.log('');
    console.log('   ↑ 手机和电脑连同一个 WiFi，把上面这条地址输进浏览器');
  } else {
    console.log('   没检测到局域网地址，手机可能连不上');
  }
  console.log('');
  console.log('   关掉这个窗口就停止服务');
  console.log('  ' + line);
  console.log('');
});

server.listen(port, '0.0.0.0');
