// The HTTP side of the agent: validates a request, calls the model, streams the trace back as NDJSON
// (one JSON object per line). Used by the Vercel function (api/agent.js) and the local dev server.
//
// What it will not do: store or log the paper, accept a huge paper, or let one visitor run up the bill.
// The limits below are per server instance. On a serverless host that is a best-effort brake;
// the hard stop is the quota or spend limit on the model account itself.

import { runAgent } from './agent.js';
import { resolveProvider, createClient } from './provider.js';
import { redact, MAX_PAPER_CHARS } from './redact.js';

const LANGS = new Set(['hl', 'hi', 'en']);
const perIp = new Map();
const budget = { day: '', count: 0 };

/** Today in India, as ISO. The rules engine needs a date, and the server's clock is the one we trust. */
export function istDate(now = Date.now()) {
  return new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function takeSlot(ip, now, perMinute) {
  const recent = (perIp.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= perMinute) { perIp.set(ip, recent); return false; }
  recent.push(now);
  perIp.set(ip, recent);
  if (perIp.size > 5000) for (const [k, v] of perIp) if (!v.some((t) => now - t < 60_000)) perIp.delete(k);
  return true;
}

function takeBudget(today, limit) {
  if (budget.day !== today) { budget.day = today; budget.count = 0; }
  if (budget.count >= limit) return false;
  budget.count += 1;
  return true;
}

/** One line in the server log when a model call fails. No paper text, no key. The provider's own wording only with TAREEKH_DEBUG=1. */
function logModelError(provider, env, { code, status, detail }) {
  const extra = env.TAREEKH_DEBUG === '1' && detail ? ` — ${detail}` : '';
  console.error(`[tareekh] model call failed: ${provider.name} ${provider.model} ${code}${status ? ` (HTTP ${status})` : ''}${extra}`);
}

export function resetLimits() { perIp.clear(); budget.day = ''; budget.count = 0; }

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return null; } }
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 64 * 1024) return null;
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return null; }
}

export async function handle(req, res, { env = process.env, fetchImpl, now = Date.now, makeClient } = {}) {
  res.setHeader('x-content-type-options', 'nosniff');
  const provider = resolveProvider(env);

  if (req.method === 'GET') {
    const label = provider ? provider.model : makeClient ? makeClient({ text: '', lang: 'hl' }).model || 'custom' : null;
    // `retains` tells the page to warn that the model provider may keep what it receives (free tiers do).
    return send(res, 200, { ai: Boolean(provider) || Boolean(makeClient), model: label, retains: provider ? provider.disclose : false });
  }
  if (req.method !== 'POST') { res.setHeader('allow', 'GET, POST'); return send(res, 405, { error: 'method' }); }

  const body = await readBody(req);
  if (!body || typeof body.text !== 'string') return send(res, 400, { error: 'bad_request', message: 'Send JSON with a "text" field.' });
  const lang = LANGS.has(body.lang) ? body.lang : 'hl';
  const cleaned = redact(body.text.trim());
  if (!cleaned.text) return send(res, 400, { error: 'empty', message: 'The paper is empty.' });
  if (cleaned.text.length > MAX_PAPER_CHARS) return send(res, 413, { error: 'too_long', message: `Keep the paper under ${MAX_PAPER_CHARS} characters.` });

  if (!provider && !makeClient) return send(res, 503, { error: 'no_key', message: 'The AI reader is not switched on for this site.' });

  const t = now();
  const ip = String((req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || 'unknown').split(',')[0].trim();
  if (!takeSlot(ip, t, Number(env.TAREEKH_PER_MINUTE) || (provider && provider.perMinute) || 6)) return send(res, 429, { error: 'rate_limited', message: 'Too many tries. Wait a minute.' });
  const today = istDate(t);
  if (!takeBudget(today, Number(env.TAREEKH_DAILY_LIMIT) || (provider && provider.dailyLimit) || 1500)) return send(res, 429, { error: 'budget', message: 'The AI reader has reached its limit for today.' });

  res.statusCode = 200;
  res.setHeader('content-type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-accel-buffering', 'no');
  const write = (e) => res.write(`${JSON.stringify(e)}\n`);

  // The whole run must end before the serverless function does; if it cannot, the page falls back to the offline reader.
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(), Number(env.TAREEKH_DEADLINE_MS) || 50_000);
  try {
    const client = makeClient ? makeClient({ text: cleaned.text, lang }) : createClient(provider, { fetchImpl, onError: (info) => logModelError(provider, env, info) });
    write({ type: 'redacted', removed: cleaned.removed });
    await runAgent({ text: cleaned.text, lang, today, client, onEvent: write, signal: deadline.signal });
  } catch (e) {
    write({ type: 'error', code: e.code || 'server', message: 'The AI reader could not finish.' });
  } finally {
    clearTimeout(timer);
  }
  res.end();
}
