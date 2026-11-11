// The agent loop. A model (or the offline reader) asks for tools; the tools run the rules engine;
// the loop feeds the results back until the model calls finish(). Nothing here knows about the web.
//
// What the page shows is built from `events` and `result`, which come from TOOL RESULTS.
// The model's own note is shown separately, and only if it passes `summaryIsSafe`.

import { SYSTEM_PROMPT, buildUserMessage } from './prompt.js';
import { TOOLS, executeTool, compactResult, serialiseFacts } from './tools.js';
import { templateSummary, questionsFromVerdict, summaryIsSafe } from './summary.js';

export const MAX_STEPS = 8;

/**
 * @param {object} o
 * @param {string} o.text      the paper (already redacted by the caller if it leaves the device)
 * @param {'hl'|'hi'|'en'} o.lang
 * @param {string} o.today     ISO date
 * @param {{mode: string, model?: string, complete: Function}} o.client
 * @param {(event: object) => void} [o.onEvent]
 */
export async function runAgent({ text, lang = 'hl', today, client, onEvent = () => {}, maxSteps = MAX_STEPS, signal }) {
  const ctx = { today, paper: text, lookups: [], assessments: [], drafts: [], finished: null };
  const events = [];
  const emit = (e) => { events.push(e); onEvent(e); };

  const messages = [{ role: 'user', content: buildUserMessage(text, lang, today) }];
  emit({ type: 'start', mode: client.mode, model: client.model || null });

  let steps = 0;
  let nudged = false;
  let error = null;

  while (steps < maxSteps && !ctx.finished) {
    steps += 1;
    let resp;
    try {
      resp = await client.complete({ system: SYSTEM_PROMPT, tools: TOOLS, messages, signal });
    } catch (e) {
      error = { code: e.code || 'llm_error', message: e.message || 'The model call failed.' };
      break;
    }
    const blocks = Array.isArray(resp && resp.content) ? resp.content : [];
    messages.push({ role: 'assistant', content: blocks });
    const calls = blocks.filter((b) => b.type === 'tool_use');

    if (!calls.length) {
      if (nudged) break;
      nudged = true;
      messages.push({ role: 'user', content: 'Use the tools. Do not answer in plain text. End by calling finish.' });
      continue;
    }

    const results = [];
    for (const call of calls) {
      emit({ type: 'tool_call', id: call.id, name: call.name, input: call.input });
      const out = executeTool(call.name, call.input, ctx);
      emit({ type: 'tool_result', id: call.id, name: call.name, ok: !out.isError, content: out.content });
      results.push({ type: 'tool_result', tool_use_id: call.id, content: JSON.stringify(out.content), is_error: !!out.isError });
    }
    messages.push({ role: 'user', content: results });
  }

  if (!ctx.finished && !error) error = { code: 'no_finish', message: 'The reader stopped before finishing.' };

  const last = ctx.assessments[ctx.assessments.length - 1] || null;
  const verdict = last ? compactResult(last.result) : null;

  // Which note is shown: the model's own, only if every date and claim in it traces back to a tool.
  let note = null;
  let noteSource = 'template';
  if (ctx.finished) {
    const modelNote = ctx.finished.summary;
    if (client.mode === 'ai' && summaryIsSafe(modelNote, ctx, verdict)) { note = modelNote; noteSource = 'model'; }
  }
  if (note === null) note = templateSummary({ lang, verdict });

  // Questions: whatever the model asked, plus whatever the tool says is missing, without repeats.
  const asked = ctx.finished ? ctx.finished.questions : [];
  const seen = new Set();
  const questions = [...asked, ...questionsFromVerdict(verdict, lang)].filter((q) => (seen.has(q.field) ? false : seen.add(q.field)));

  const result = {
    ok: !error,
    error,
    mode: client.mode,
    model: client.model || null,
    steps,
    today,
    facts: last ? serialiseFacts(last.facts) : null,
    evidence: last ? last.evidence : null,
    verdict,
    note,
    noteSource,
    questions: verdict && verdict.verdict !== 'NEEDS_INFO' ? questions.filter((q) => q.field !== 'first_time_accused') : questions,
    drafts: ctx.drafts.map((d) => ({ which: d.which, lang: d.lang, title: d.title })),
    toolCalls: events.filter((e) => e.type === 'tool_call').map((e) => e.name),
  };
  emit({ type: 'done', result });
  return { result, events, ctx };
}
