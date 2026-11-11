// Tests the model setup without a paper: is the key accepted, does the model name exist,
// and does the model accept our tool format and call a tool. Prints only things safe to share:
// no key, no paper. Usage:
//   NVIDIA_API_KEY=... npm run check:model                      test the configured model
//   NVIDIA_API_KEY=... npm run check:model -- --list mistral    list the model names your key can use (optional filter)
import { resolveProvider, createClient } from '../agent/src/provider.js';
import { TOOLS } from '../agent/src/tools.js';

const args = process.argv.slice(2);
const listAt = args.indexOf('--list');
const listFilter = listAt >= 0 && args[listAt + 1] && !args[listAt + 1].startsWith('--') ? args[listAt + 1].toLowerCase() : '';
const provider = resolveProvider(process.env);
if (!provider) {
  console.log('No model key found. Set GEMINI_API_KEY, NVIDIA_API_KEY, TAREEKH_API_KEY (+ TAREEKH_BASE_URL, TAREEKH_MODEL) or ANTHROPIC_API_KEY.');
  process.exit(2);
}
console.log(`Provider: ${provider.name}   Model: ${provider.model}${provider.baseUrl ? `\nEndpoint: ${provider.baseUrl}` : ''}\n`);

if (provider.kind === 'openai') {
  try {
    const res = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/models`, { headers: { authorization: `Bearer ${provider.apiKey}` } });
    if (!res.ok) console.log(`1) Model list: HTTP ${res.status}. ${res.status === 401 || res.status === 403 ? 'The key was rejected.' : ''}`);
    else {
      const j = await res.json();
      const ids = (j.data || j.models || []).map((m) => String(m.id || m.name || '').replace(/^models\//, '')).filter(Boolean);
      if (listAt >= 0) {
        const shown = ids.filter((i) => i.toLowerCase().includes(listFilter)).sort();
        console.log(`${ids.length} models; ${shown.length} match${listFilter ? ` "${listFilter}"` : ''}:\n${shown.map((i) => `   ${i}`).join('\n')}\n\nRun again with TAREEKH_MODEL=<name> to test one.`);
        process.exit(0);
      }
      const has = ids.includes(provider.model);
      console.log(`1) Key accepted. ${ids.length} models listed. "${provider.model}" ${has ? 'is in the list.' : 'is NOT in the list.'}`);
      if (!has) console.log(`   Names that look usable:\n   ${ids.filter((i) => /flash|llama|nemotron|gpt|mistral|qwen/i.test(i)).slice(0, 25).join('\n   ')}\n   List more with:  npm run check:model -- --list <part of a name>\n   Then run again with TAREEKH_MODEL=<name>`);
    }
  } catch {
    console.log('1) Could not reach the endpoint. Check the network.');
  }
}

console.log('\n2) Asking the model to call one of our tools...');
const client = createClient(provider);
try {
  const r = await client.complete({
    system: 'You can only act by calling tools.',
    tools: TOOLS,
    messages: [{ role: 'user', content: 'The paper says the charge is Section 379 of the IPC. Look up that section.' }],
  });
  const call = r.content.find((b) => b.type === 'tool_use');
  if (call) console.log(`   OK. The model called ${call.name} with ${JSON.stringify(call.input)}`);
  else console.log(`   The model answered in text instead of calling a tool: "${(r.content.find((b) => b.type === 'text') || {}).text || ''}".\n   It accepted the request but did not use the tools. Try another model.`);
} catch (e) {
  console.log(`   FAILED: ${e.code}${e.status ? ` (HTTP ${e.status})` : ''}${e.detail ? `\n   Provider said: ${e.detail}` : ''}`);
  console.log(
    e.code === 'auth' ? '   The key is wrong, expired, or not allowed for this model.'
    : e.code === 'rate_limited' ? '   Quota or rate limit. Wait a minute and try again, or check the quota in the provider dashboard.'
    : e.code === 'bad_request' ? '   The provider rejected the request. The line above says why; send it to me.'
    : '   The provider had a problem or could not be reached.',
  );
  process.exit(1);
}
