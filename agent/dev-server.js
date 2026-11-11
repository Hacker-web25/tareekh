// Local server: serves the built page and the agent endpoint on one port, like the deployed site.
//   GEMINI_API_KEY=... node agent/dev-server.js               real model, free tier (key from Google AI Studio)
//   ANTHROPIC_API_KEY=sk-... node agent/dev-server.js         real model, Anthropic
//   node agent/dev-server.js                                  no key: the page falls back to the offline reader
//   node agent/dev-server.js --scripted                       UI TESTING ONLY: pretends to be a model (see below)
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { handle } from './src/handler.js';
import { createLocalClient } from './src/local.js';
import { resolveProvider } from './src/provider.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 8787;
const scripted = process.argv.includes('--scripted');
const provider = resolveProvider(process.env);

// --scripted reuses the offline reader but reports itself as a model, so the streaming UI can be tested
// without a key. It is NOT an AI. Never deploy with this flag.
const makeClient = scripted
  ? ({ text, lang }) => Object.assign(createLocalClient({ text, lang }), { mode: 'ai', model: 'scripted-test-double' })
  : undefined;
if (scripted) console.warn('\n  !! --scripted: the "AI" here is a test double, not a language model.\n');

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/agent') return handle(req, res, { env: process.env, makeClient });
  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const html = await readFile(path.join(root, 'dist/index.html'));
      res.setHeader('content-type', 'text/html; charset=utf-8');
      return res.end(html);
    } catch {
      res.statusCode = 500;
      return res.end('Run `npm run build` first.');
    }
  }
  res.statusCode = 404;
  res.end('Not found');
}).listen(port, () => console.log(`Tareekh on http://localhost:${port}  (AI: ${provider ? `${provider.name} / ${provider.model}` : scripted ? 'scripted test double' : 'off, offline reader only'})`));
