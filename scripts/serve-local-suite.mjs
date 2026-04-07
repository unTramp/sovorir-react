import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = normalize(join(__dirname, '..'));
const distRoot = join(repoRoot, 'dist');
const adminRoot = join(repoRoot, 'dist-admin');
const port = Number(process.env.PORT || 4183);
const host = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function sendFile(response, filePath) {
  const ext = extname(filePath);
  response.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
  });
  createReadStream(filePath).pipe(response);
}

function stripLearnerPwaMarkup(html) {
  return html
    .replace(/<link rel="manifest" href="\/manifest\.webmanifest">/g, '')
    .replace(/<script id="vite-plugin-pwa:register-sw" src="\/registerSW\.js"><\/script>/g, '');
}

async function sendIndex(response, rootDir) {
  const indexPath = join(rootDir, 'index.html');
  let html = await readFile(indexPath, 'utf-8');

  if (rootDir === distRoot) {
    html = stripLearnerPwaMarkup(html);
  }

  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  response.end(html);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);
    const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
    const activeRoot = isAdmin ? adminRoot : distRoot;
    const relativePath = isAdmin
      ? pathname.replace(/^\/admin\/?/, '')
      : pathname.replace(/^\//, '');

    const candidatePath = join(activeRoot, relativePath);
    const safePath = normalize(candidatePath);

    if (!safePath.startsWith(activeRoot)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    if (!isAdmin && (pathname === '/sw.js' || pathname === '/registerSW.js' || pathname.startsWith('/workbox-'))) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    if (relativePath && existsSync(safePath) && !safePath.endsWith('/')) {
      sendFile(response, safePath);
      return;
    }

    await sendIndex(response, activeRoot);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Local suite server failed');
  }
});

server.listen(port, host, () => {
  console.log(`Local suite server running at http://${host}:${port}`);
});
