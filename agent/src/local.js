// The offline reader: the SAME agent loop, tools and trace, but the "model" is a deterministic reader
// (the pattern matcher in engine/reader.js) instead of a language model. It needs no network and no key,
// so the page works for everyone and on a flaky connection. The page labels this mode honestly.

import { extractFromText } from '../../engine/reader.js';
import { templateSummary, questionsFromVerdict, questionFor } from './summary.js';

let uid = 0;
const id = () => `off_${++uid}`;

const lastToolResults = (messages) => {
  const last = messages[messages.length - 1];
  if (!last || !Array.isArray(last.content)) return [];
  return last.content.filter((b) => b.type === 'tool_result').map((b) => {
    let content = null;
    try { content = JSON.parse(b.content); } catch { /* keep null */ }
    return { id: b.tool_use_id, content, isError: !!b.is_error };
  });
};

export function createLocalClient({ text, lang = 'hl' }) {
  const ex = extractFromText(text);
  let phase = 'start';
  let plan = null; // facts we will pass to check_section_479
  let lastVerdict = null;

  const finish = (verdict, extra = []) => {
    const qs = [...questionsFromVerdict(verdict, lang), ...extra];
    const seen = new Set();
    const unique = qs.filter((q) => (seen.has(q.field) ? false : seen.add(q.field)));
    return {
      type: 'tool_use', id: id(), name: 'finish',
      input: { summary: templateSummary({ lang, verdict }), questions: unique },
    };
  };

  return {
    mode: 'offline',
    model: null,
    async complete({ messages }) {
      if (phase === 'start') {
        const sections = ex.sections.slice(0, 6);
        if (!sections.length) {
          if (!ex.arrestDate) {
            phase = 'finishing';
            const qs = [{ field: 'offence', question: questionFor('offence', lang) }, { field: 'arrest_date', question: questionFor('arrest_date', lang) }];
            return { content: [finish(null, qs)], stop_reason: 'tool_use' };
          }
          // A date but no section: run the check so the tool itself says what is missing.
          phase = 'checking';
          plan = { arrest_date: ex.arrestDate, first_time_accused: null, other_cases_pending: null, incident_regime: null };
          return { content: [{ type: 'tool_use', id: id(), name: 'check_section_479', input: plan }], stop_reason: 'tool_use' };
        }
        phase = 'looked_up';
        return {
          content: sections.map((s) => ({ type: 'tool_use', id: id(), name: 'lookup_offence', input: { law: s.law, section: s.section } })),
          stop_reason: 'tool_use',
        };
      }

      if (phase === 'looked_up') {
        const results = lastToolResults(messages);
        const picked = [];
        const extra = [];
        let blocked = false;
        for (const r of results) {
          const c = r.content || {};
          if (!c.in_table) { blocked = true; extra.push({ field: 'max_sentence', question: questionFor('max_sentence', lang) }); continue; }
          if (c.ambiguous) { blocked = true; extra.push({ field: 'offence', question: questionFor('offence', lang) }); continue; }
          picked.push(c.matches[0].offence_id);
        }
        if (blocked || !picked.length) {
          phase = 'finishing';
          const qs = [...extra];
          if (!ex.arrestDate) qs.push({ field: 'arrest_date', question: questionFor('arrest_date', lang) });
          return { content: [finish(null, qs)], stop_reason: 'tool_use' };
        }
        // Several sections: the first becomes the main one, the tool picks the longest maximum itself.
        const laws = new Set(ex.sections.map((s) => s.law));
        const regime = laws.size === 1 ? (laws.has('BNS') ? 'bns' : 'ipc') : null;
        plan = {
          offence_id: picked[0],
          also_charged: picked.slice(1),
          arrest_date: ex.arrestDate,
          first_time_accused: null,
          other_cases_pending: null,
          incident_regime: regime,
        };
        phase = 'checking';
        return { content: [{ type: 'tool_use', id: id(), name: 'check_section_479', input: plan }], stop_reason: 'tool_use' };
      }

      if (phase === 'checking') {
        const [r] = lastToolResults(messages);
        lastVerdict = r && r.content ? r.content : null;
        phase = 'finishing';
        // The offline reader cannot tell from a paper whether the person is a first-time accused, so the tool
        // answers NEEDS_INFO and the page asks. It therefore never reaches a draft; only a model that read it can.
        return { content: [finish(lastVerdict)], stop_reason: 'tool_use' };
      }

      return { content: [{ type: 'text', text: 'done' }], stop_reason: 'end_turn' };
    },
  };
}
