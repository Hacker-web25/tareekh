// The language-model client: a plain call to the Anthropic Messages API with tool use.
// No SDK, so it runs the same in a Vercel function, a dev server and a test.
// The key is read by the caller and never appears in an error message.

export const DEFAULT_MODEL = 'claude-haiku-5-5';

export class LlmError extends Error {
  constructor(code, message, status, detail) {
    super(message);
    this.code = code;
    this.status = status;
    // The provider's own reason (for the server log and the check script). Never put in `message`, which reaches the browser.
    this.detail = detail;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function createAnthropicClient({
  apiKey,
  model = DEFAULT_MODEL,
  baseUrl = 'https://api.anthropic.com',
  fetchImpl = globalThis.fetch,
  maxTokens = 900,
  timeoutMs = 25000,
} = {}) {
  if (!apiKey) throw new LlmError('no_key', 'No API key configured.');

  async function once({ system, tools, messages, signal }) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    const onAbort = () => ctl.abort();
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
    try {
      const res = await fetchImpl(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, tools, tool_choice: { type: 'auto' }, messages }),
        signal: ctl.signal,
      });
      if (!res.ok) {
        const code = res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate_limited' : res.status >= 500 ? 'upstream' : 'bad_request';
        throw new LlmError(code, `Model API returned ${res.status}.`, res.status);
      }
      return await res.json();
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
        // One retry for a busy or flaky upstream; anything else is final.
        if (e instanceof LlmError && (e.code === 'upstream' || e.code === 'rate_limited' || e.code === 'network')) {
          await wait(700);
          return once(req);
        }
        throw e;
      }
    },
  };
}
