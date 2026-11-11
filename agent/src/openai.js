// A model client for any "OpenAI-style" chat endpoint with tool calling: Google's free Gemini tier,
// Groq, OpenRouter, a local Ollama, and so on. No SDK, same shape as anthropic.js.
//
// The agent loop speaks one message format (content blocks: text / tool_use / tool_result).
// This file converts to the chat-completions format on the way out and back on the way in,
// so the loop, the tools and the guards do not know which provider is behind them.
//
// The key is read by the caller and never appears in an error message.

import { LlmError } from './anthropic.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Tool schemas are written as JSON Schema (type: ['string','null']). Gemini's endpoint wants the
 * OpenAPI form (type: 'string', nullable: true), so 'gemini' style rewrites them. Other providers get them as written.
 */
export function cleanSchema(node, style = 'json') {
  if (Array.isArray(node)) return node.map((n) => cleanSchema(n, style));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === '$schema' || (style === 'gemini' && k === 'additionalProperties')) continue;
    if (k === 'properties' && v && typeof v === 'object') {
      out.properties = Object.fromEntries(Object.entries(v).map(([name, s]) => [name, cleanSchema(s, style)]));
    } else if (k === 'items') {
      out.items = cleanSchema(v, style);
    } else {
      out[k] = v;
    }
  }
  if (style === 'gemini') {
    if (Array.isArray(out.type)) {
      const real = out.type.filter((x) => x !== 'null');
      if (real.length < out.type.length) out.nullable = true;
      out.type = real[0] || 'string';
    }
    if (Array.isArray(out.enum) && out.enum.includes(null)) {
      out.enum = out.enum.filter((x) => x !== null);
      out.nullable = true;
    }
  }
  return out;
}

export function toOpenAITools(tools, style) {
  return tools.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: cleanSchema(t.input_schema, style) },
  }));
}

/** Loop messages (content blocks) -> chat-completions messages. */
export function toOpenAIMessages(system, messages, style) {
  const out = [];
  if (system) out.push({ role: 'system', content: system });
  const nameOf = new Map(); // tool_use id -> tool name, for providers that need the name on the result
  for (const m of messages) {
    if (typeof m.content === 'string') { out.push({ role: m.role, content: m.content }); continue; }
    const blocks = Array.isArray(m.content) ? m.content : [];
    if (m.role === 'assistant') {
      const text = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      const calls = blocks.filter((b) => b.type === 'tool_use').map((b) => {
        nameOf.set(b.id, b.name);
        const call = { id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input || {}) } };
        // Gemini 3 hands back a "thought signature" with each call and wants it echoed on the next turn.
        if (b._extra) call.extra_content = b._extra;
        return call;
      });
      const msg = { role: 'assistant', content: text || (calls.length ? null : '') };
      if (calls.length) msg.tool_calls = calls;
      out.push(msg);
    } else {
      for (const r of blocks.filter((b) => b.type === 'tool_result')) {
        const msg = { role: 'tool', tool_call_id: r.tool_use_id, content: typeof r.content === 'string' ? r.content : JSON.stringify(r.content) };
        if (style === 'gemini' && nameOf.has(r.tool_use_id)) msg.name = nameOf.get(r.tool_use_id);
        out.push(msg);
      }
      const texts = blocks.filter((b) => b.type === 'text').map((b) => b.text);
      if (texts.length) out.push({ role: 'user', content: texts.join('\n') });
    }
  }
  return out;
}

/** A chat-completions response -> loop content blocks. */
export function fromOpenAIResponse(json, nextId) {
  const msg = json && Array.isArray(json.choices) && json.choices[0] && json.choices[0].message;
  if (!msg) throw new LlmError('upstream', 'The model returned nothing usable.');
  const content = [];
  if (typeof msg.content === 'string' && msg.content.trim()) content.push({ type: 'text', text: msg.content });
  for (const tc of Array.isArray(msg.tool_calls) ? msg.tool_calls : []) {
    const fn = tc && tc.function ? tc.function : {};
    let input = {};
    try { input = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments || '{}') : fn.arguments || {}; } catch { input = {}; }
    if (!input || typeof input !== 'object' || Array.isArray(input)) input = {};
    const block = { type: 'tool_use', id: tc.id || nextId(), name: fn.name || '', input };
    if (tc.extra_content) block._extra = tc.extra_content;
    content.push(block);
  }
  return { content };
}

/** The provider's own error text, trimmed, with the key scrubbed out. Safe to print in your own terminal. */
async function errorDetail(res, apiKey) {
  try {
    const j = await res.json();
    const e = Array.isArray(j) ? j[0] && j[0].error : j && j.error;
    const raw = e ? [e.status, e.code, e.message].filter((x) => typeof x === 'string' && x).join(': ') : (j && (j.message || j.detail)) || '';
    return String(typeof raw === 'string' ? raw : JSON.stringify(raw)).replaceAll(apiKey, '***').slice(0, 240);
  } catch {
    return '';
  }
}

export function createOpenAIClient({
  apiKey,
  model,
  baseUrl,
  style = 'json',            // 'gemini' rewrites the tool schemas; see cleanSchema
  extras = {},               // optional request fields (e.g. reasoning_effort). Dropped for good if the provider rejects them.
  fetchImpl = globalThis.fetch,
  maxTokens = 2048,
  timeoutMs = 25000,
  callGapMs = 0,             // minimum time between calls: for free tiers with a low requests-per-minute limit
  onError = () => {},        // called with { code, status, detail } for every failed call, for the server log
} = {}) {
  if (!apiKey) throw new LlmError('no_key', 'No API key configured.');
  if (!baseUrl || !model) throw new LlmError('no_key', 'No model endpoint configured.');
  const root = baseUrl.replace(/\/+$/, '');
  let useExtras = Object.keys(extras).length > 0;
  let lastStart = 0;
  let ids = 0;
  const nextId = () => { ids += 1; return `call_${ids}`; };

  async function once({ system, tools, messages, signal }) {
    if (callGapMs > 0) {
      const gap = lastStart + callGapMs - Date.now();
      if (gap > 0) await wait(gap);
      lastStart = Date.now();
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const onAbort = () => ctl.abort();
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
    try {
      const body = {
        model,
        messages: toOpenAIMessages(system, messages, style),
        max_tokens: maxTokens,
        ...(tools && tools.length ? { tools: toOpenAITools(tools, style), tool_choice: 'auto' } : {}),
        ...(useExtras ? extras : {}),
      };
      const res = await fetchImpl(`${root}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
      if (!res.ok) {
        const code = res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate_limited' : res.status >= 500 ? 'upstream' : 'bad_request';
        throw new LlmError(code, `Model API returned ${res.status}.`, res.status, await errorDetail(res, apiKey));
      }
      return fromOpenAIResponse(await res.json(), nextId);
    } catch (e) {
      if (e instanceof LlmError) throw e;
      if (e && e.name === 'AbortError') throw new LlmError('timeout', 'The model took too long to answer.');
      throw new LlmError('network', 'Could not reach the model API.');
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    }
  }

  return {
    mode: 'ai',
    model,
    async complete(req) {
      try {
        return await once(req);
      } catch (e) {
        if (!(e instanceof LlmError)) throw e;
        onError({ code: e.code, status: e.status || null, detail: e.detail || '' });
        // An optional field the provider does not know: drop it for good and try once more.
        if (e.code === 'bad_request' && useExtras) { useExtras = false; return once(req); }
        // A flaky upstream gets one more try. A rate limit does not: on a free tier it only burns more of the quota,
        // and the page already falls back to the offline reader.
        if (e.code === 'upstream' || e.code === 'network') { await wait(700); return once(req); }
        throw e;
      }
    },
  };
}
