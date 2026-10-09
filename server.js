// Serves the built admin and forwards /api/* to the backend. The admin and the backend live on
// different up.railway.app subdomains, which browsers treat as different sites (up.railway.app is a
// public suffix), so the backend's SameSite=Strict login cookie only works if the API is same-origin.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const BACKEND = new URL(process.env.BACKEND_URL || 'https://brandbackend-deploy-production-9526.up.railway.app');
const ROOT = path.resolve(__dirname, 'dist/modernize');
const INDEX = path.join(ROOT, 'index.html');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const HOP_BY_HOP = ['connection', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade', 'te', 'trailer'];

function proxy(req, res) {
  const headers = { ...req.headers, host: BACKEND.host };
  HOP_BY_HOP.forEach(h => delete headers[h]);
  // Same-origin requests need no CORS; dropping Origin keeps the backend's CORS filter out of the way.
  delete headers.origin;

  const upstream = (BACKEND.protocol === 'https:' ? https : http).request({
    protocol: BACKEND.protocol,
    hostname: BACKEND.hostname,
    port: BACKEND.port || undefined,
    method: req.method,
    path: req.url,
    headers,
    timeout: 60000,
  }, upstreamRes => {
    const out = { ...upstreamRes.headers };
    HOP_BY_HOP.forEach(h => delete out[h]);
    res.writeHead(upstreamRes.statusCode || 502, out);
    upstreamRes.pipe(res);
  });

  upstream.on('timeout', () => upstream.destroy(new Error('upstream timeout')));
  upstream.on('error', err => {
    console.error(`proxy ${req.method} ${req.url}: ${err.message}`);
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  });
  req.pipe(upstream);
}

function sendFile(res, file, cacheable) {
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': cacheable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  const file = path.join(ROOT, pathname);
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.stat(file, (err, stat) => {
    if (!err && stat.isFile()) {
      // Angular emits content-hashed bundle names, so everything except index.html can be cached forever.
      sendFile(res, file, file !== INDEX && /\.[0-9a-f]{16,}\./.test(path.basename(file)));
    } else {
      sendFile(res, INDEX, false);
    }
  });
}

http.createServer((req, res) => {
  if (req.url === '/api' || req.url.startsWith('/api/')) proxy(req, res);
  else serveStatic(req, res);
}).listen(PORT, '0.0.0.0', () => {
  console.log(`admin on :${PORT}, /api -> ${BACKEND.origin}`);
});
