import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpServer } from './mcp.mjs';

const publicRoot = new URL('../public/', import.meta.url);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.mjs', ['app.mjs', 'text/javascript; charset=utf-8']],
  ['/domain.mjs', ['domain.mjs', 'text/javascript; charset=utf-8']],
  ['/bowl.svg', ['bowl.svg', 'image/svg+xml']],
  ['/images/lemon-chickpea-bowl.png', ['images/lemon-chickpea-bowl.png', 'image/png']],
  ['/images/pantry-pasta.png', ['images/pantry-pasta.png', 'image/png']],
  ['/images/black-bean-tacos.png', ['images/black-bean-tacos.png', 'image/png']],
  ['/images/fried-rice.png', ['images/fried-rice.png', 'image/png']],
  ['/images/lentil-soup.png', ['images/lentil-soup.png', 'image/png']],
  ['/images/tomato-toast.png', ['images/tomato-toast.png', 'image/png']]
]);

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

export function createApp() {
  const app = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    const port = app.address()?.port;
    const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
    if (!hosts.has(req.headers.host)) return json(res, 403, { error: 'Use the local Gather URL.' });
    if (req.headers.origin && ![...hosts].some(host => req.headers.origin === `http://${host}`)) {
      return json(res, 403, { error: 'Cross-origin requests are not allowed.' });
    }
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (path === '/rpc') {
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return json(res, 405, { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Use POST for stateless MCP requests.' } });
        }
        if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] ?? '')) {
          return json(res, 415, { error: 'Content-Type must be application/json.' });
        }
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 65_536) return json(res, 413, { error: 'Request exceeds 64 KiB.' });
          chunks.push(chunk);
        }
        let message;
        try { message = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { return json(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Invalid JSON.' } }); }
        const server = createMcpServer();
        const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
        await server.connect(transport);
        try {
          const request = new Request(`http://${req.headers.host}/rpc`, { method: 'POST', headers: req.headers, body: JSON.stringify(message) });
          const response = await transport.handleRequest(request, { parsedBody: message });
          const content = Buffer.from(await response.arrayBuffer());
          res.writeHead(response.status, Object.fromEntries(response.headers));
          if (content.length) res.write(content);
          res.end();
        } finally { await server.close(); }
        return;
      }
      if (path === '/health' && req.method === 'GET') {
        return json(res, 200, { status: 'ok', app: 'Gather', protocol: '2025-11-25', transport: 'streamable-http', mode: 'alexa-experience-simulator' });
      }
      if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Method not allowed.' });
      const file = files.get(path);
      if (!file) return json(res, 404, { error: 'Not found.' });
      const content = await readFile(new URL(file[0], publicRoot));
      res.writeHead(200, { 'Content-Type': file[1] });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (!res.headersSent) json(res, 500, { error: 'Gather could not complete the request. Please try again.' });
      else res.end();
      console.error('Request failed:', error.message);
    }
  });
  app.requestTimeout = 15_000;
  app.headersTimeout = 10_000;
  return app;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const app = createApp();
  app.listen(port, '127.0.0.1', () => console.log(`Gather is ready at http://127.0.0.1:${port}\nMCP endpoint: http://127.0.0.1:${port}/rpc`));
  app.on('error', error => { console.error(error.message); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.close());
}
