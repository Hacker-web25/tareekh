// Evals for the paper reader.
//   node agent/evals/run.js                         offline reader on the "offline" cases (no key needed)
//   GEMINI_API_KEY=... node agent/evals/run.js --live          a real model on every case (free Gemini key works)
//   add --only-ai to run just the cases that need a model (5), which is kinder to a free quota
//   add --trace to print, under each FAIL, every tool the model called and with what (the eval papers are fictional)
//   add --write to store the summary in web/data/agent-proof.json (the page shows it)
//
// Ground truth is not typed in by hand: for each case the facts a careful person would read off the paper
// are fed to the rules engine, and the agent must land on the same verdict and dates, without guessing
// anything the paper does not say.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runAgent } from '../src/agent.js';
import { createLocalClient } from '../src/local.js';
import { resolveProvider, createClient } from '../src/provider.js';
import { normaliseFacts, compactResult } from '../src/tools.js';
import { assess } from '../../engine/section479.js';
import { redact } from '../src/redact.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const live = args.includes('--live');
const write = args.includes('--write');
const json = args.includes('--json');
const onlyAi = args.includes('--only-ai');
const trace = args.includes('--trace');

const casesArg = args.indexOf('--cases');
const suite = JSON.parse(await readFile(casesArg >= 0 ? args[casesArg + 1] : path.join(here, 'cases.json'), 'utf8'));
const today = suite.today;

function groundTruth(t) {
  if (!t) return null;
  const f = normaliseFacts({
    offence_id: t.offenceId, also_charged: t.also || [], arrest_date: t.arrestDate,
    first_time_accused: t.firstTime, other_cases_pending: t.otherCasesPending, incident_regime: t.regime,
  }, today);
  if (f.error) throw new Error(`bad truth: ${f.error}`);
  const r = assess(f.engine);
  return { result: r, compact: compactResult(r) };
}

function grade(c, out) {
  const fails = [];
  const e = c.expect;
  const r = out.result;
  const truth = groundTruth(c.truth);
  const verdict = r.verdict ? r.verdict.verdict : null;

  if (!r.ok) fails.push(`run failed: ${r.error && r.error.code}`);
  if ('verdict' in e && verdict !== e.verdict) fails.push(`verdict ${verdict} (wanted ${e.verdict})`);
  if (truth && 'verdict' in e && truth.result.verdict !== e.verdict) fails.push(`suite error: engine says ${truth.result.verdict} for the truth facts`);
  if ('firstTime' in e) {
    const got = r.facts ? r.facts.firstTime : null;
    if (got !== e.firstTime) fails.push(`first-time status ${got} (paper says ${e.firstTime})`);
  }
  if (e.eligibleOn && (!r.verdict || r.verdict.eligible_on !== e.eligibleOn)) fails.push(`eligible_on ${r.verdict && r.verdict.eligible_on} (wanted ${e.eligibleOn})`);
  if (e.eligibleOn && truth && truth.compact.eligible_on !== e.eligibleOn) fails.push('suite error: engine disagrees with the literal date');
  if (e.ifFirstTime && (!r.verdict || !r.verdict.if_first_time || r.verdict.if_first_time.eligible_on !== e.ifFirstTime)) fails.push('first-offender date wrong');
  if (e.ifConvictedBefore && (!r.verdict || !r.verdict.if_convicted_before || r.verdict.if_convicted_before.eligible_on !== e.ifConvictedBefore)) fails.push('repeat-offender date wrong');
  if (e.flags) for (const f of e.flags) if (!r.verdict || !r.verdict.flags.includes(f)) fails.push(`missing flag ${f}`);
  if (e.needsLawyer && !(r.verdict && r.verdict.needs_lawyer)) fails.push('lawyer flag missing');
  if (e.questions) for (const q of e.questions) if (!r.questions.some((x) => x.field === q)) fails.push(`did not ask about ${q}`);
  if (e.tools && e.tools.join() !== r.toolCalls.join()) fails.push(`tools ${r.toolCalls.join('>')} (wanted ${e.tools.join('>')})`);
  if ('drafts' in e && r.drafts.length !== e.drafts) fails.push(`drafts ${r.drafts.length} (wanted ${e.drafts})`);
  for (const bad of e.forbiddenInNote || []) if (r.note.toLowerCase().includes(bad.toLowerCase())) fails.push(`note contains "${bad}"`);
  // The verdict on the page must equal the engine's, whatever the model said.
  if (truth && r.verdict && r.facts && 'verdict' in e && e.verdict && r.facts.firstTime === c.truth.firstTime && truth.compact.eligible_on !== r.verdict.eligible_on) fails.push('dates differ from the engine');
  return fails;
}

let makeClient;
let provider = null;
if (live) {
  provider = resolveProvider(process.env);
  if (!provider) { console.error('--live needs a model key: GEMINI_API_KEY (free), or TAREEKH_API_KEY + TAREEKH_BASE_URL + TAREEKH_MODEL, or ANTHROPIC_API_KEY'); process.exit(2); }
  // A free tier allows only a few requests a minute, so space the calls out. Raise TAREEKH_CALL_GAP_MS if you still see rate_limited.
  const gap = Number(process.env.TAREEKH_CALL_GAP_MS) || (provider.free ? 6500 : 0);
  const shared = createClient(provider, { callGapMs: gap });
  makeClient = () => shared;
  console.log(`live: ${provider.name} / ${provider.model}${gap ? `, one call every ${gap} ms` : ''}${onlyAi ? ', AI-tier cases only' : ''}\n`);
} else {
  makeClient = ({ text, lang }) => createLocalClient({ text, lang });
}

const rows = [];
for (const c of suite.cases) {
  if (!live && c.tier !== 'offline') continue;
  if (live && onlyAi && c.tier !== 'ai') continue;
  const text = redact(c.paper).text;
  const client = makeClient({ text, lang: c.lang });
  const t0 = Date.now();
  const out = await runAgent({ text, lang: c.lang, today, client });
  const fails = grade(c, out);
  const calls = out.events.filter((e) => e.type === 'tool_call').map((e) => `${e.name} ${JSON.stringify(e.input)}`);
  const replies = out.events.filter((e) => e.type === 'tool_result' && !e.ok).map((e) => `rejected: ${JSON.stringify(e.content)}`);
  rows.push({ id: c.id, tier: c.tier, ok: fails.length === 0, fails, calls, replies, steps: out.result.steps, ms: Date.now() - t0, noteSource: out.result.noteSource });
}

const passed = rows.filter((r) => r.ok).length;
const summary = {
  mode: live ? 'live' : 'offline',
  model: live ? provider.model : null,
  ran: new Date().toISOString().slice(0, 10),
  passed,
  total: rows.length,
  modelNotesKept: rows.filter((r) => r.noteSource === 'model').length,
};

if (json) console.log(JSON.stringify({ summary, rows }, null, 1));
else {
  for (const r of rows) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(36)} ${String(r.steps).padStart(2)} steps ${String(r.ms).padStart(5)} ms${r.ok ? '' : '\n      - ' + r.fails.join('\n      - ')}${!r.ok && trace ? '\n      calls:\n        ' + [...r.calls, ...r.replies].join('\n        ') : ''}`);
  console.log(`\n${summary.mode}: ${passed}/${rows.length} passed${live ? ` (${summary.model})` : ''}`);
}

if (write) {
  const file = path.join(here, '../../web/data/agent-proof.json');
  let prev = { offline: null, live: null };
  try { prev = JSON.parse(await readFile(file, 'utf8')); } catch { /* first run */ }
  prev[summary.mode] = { passed, total: rows.length, ran: summary.ran, model: summary.model };
  await writeFile(file, `${JSON.stringify(prev, null, 2)}\n`);
}
process.exit(passed === rows.length ? 0 : 1);
