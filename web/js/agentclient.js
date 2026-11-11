// How the page talks to the agent. Two routes, one loop:
//  1. the server route: POST /api/agent, the AI model reads the paper, the trace streams back;
//  2. the offline route: the same agent loop runs in the browser with the offline reader (no AI model).
// If the server route is not available or fails, the offline route takes over and says so.

import { runAgent } from '../../agent/src/agent.js';
import { createLocalClient } from '../../agent/src/local.js';
import { redact } from '../../agent/src/redact.js';
import { todayISO } from '../../engine/dates.js';

const API = '/api/agent';

/** Is the AI model switched on at this site? Never throws. */
export async function probe() {
  // A file opened from disk or a sandboxed preview has no server behind it: do not make a request that can only fail.
  if (!/^https?:$/.test(location.protocol)) return { ai: false, model: null, retains: false };
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 3500);
    const res = await fetch(API, { cache: 'no-store', signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) return { ai: false, model: null, retains: false };
    const j = await res.json();
    return { ai: j.ai === true, model: typeof j.model === 'string' ? j.model : null, retains: j.retains === true };
  } catch {
    return { ai: false, model: null, retains: false };
  }
}

class RouteError extends Error {
  constructor(code) { super(code); this.code = code; }
}

async function viaServer({ text, lang, onEvent }) {
  let res;
  try {
    res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, lang }) });
  } catch {
    throw new RouteError('network');
  }
  if (!res.ok || !res.body) {
    let code = 'upstream';
    try { code = (await res.json()).error || code; } catch { /* keep default */ }
    throw new RouteError(code);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let done = null;
  const take = (line) => {
    if (!line.trim()) return;
    const e = JSON.parse(line);
    if (e.type === 'error') throw new RouteError(e.code || 'upstream');
    if (e.type === 'done') done = e.result;
    onEvent(e);
  };
  for (;;) {
    const { value, done: end } = await reader.read();
    if (value) {
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      lines.forEach(take);
    }
    if (end) break;
  }
  take(buf);
  if (!done) throw new RouteError('stream');
  if (!done.ok) throw new RouteError((done.error && done.error.code) || 'upstream');
  return done;
}

async function viaOffline({ text, lang, onEvent }) {
  const { result } = await runAgent({ text, lang, today: todayISO(), client: createLocalClient({ text, lang }), onEvent });
  return result;
}

/**
 * Read a paper. `ai` says whether the server route is worth trying.
 * @returns {{result: object, route: 'ai'|'offline', fallback: string|null, removed: object}}
 */
export async function readPaper({ text, lang, ai, onEvent }) {
  const cleaned = redact(text);
  const removed = cleaned.removed;
  let fallback = null;
  if (ai) {
    try {
      const result = await viaServer({ text: cleaned.text, lang, onEvent });
      return { result, route: 'ai', fallback: null, removed };
    } catch (e) {
      fallback = e.code || 'upstream';
      onEvent({ type: 'reset' });
    }
  }
  const result = await viaOffline({ text: cleaned.text, lang, onEvent });
  return { result, route: 'offline', fallback, removed };
}
