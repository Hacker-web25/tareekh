// The agent panel: shows what the agent does, step by step, and hands what it found to the case checker.
// Everything on screen comes from tool results (dates, verdicts, quotes from the paper) or from fixed text.
// Words written by a model are shown only when the guard in agent/src/summary.js has passed them.

import { t, getLang, onLang } from './i18n.js';
import { $, esc, sleep, prefersReduced } from './util.js';
import { probe, readPaper } from './agentclient.js';
import { sampleCertificate } from '../../engine/reader.js';
import { addDays, todayISO } from '../../engine/dates.js';
import { termText, formatDate } from '../../engine/format.js';
import { getOffence } from '../../engine/offences.js';
import { templateSummary, questionFor } from '../../agent/src/summary.js';
import { redact } from '../../agent/src/redact.js';
import { DEMO_DAYS } from './hero.js';
import proof from '../data/agent-proof.json';

const nameKey = () => (getLang() === 'hi' ? 'hi' : getLang() === 'en' ? 'en' : 'hl');
const dateLang = () => (getLang() === 'hi' ? 'hi' : 'en');

const CHOICES = {
  first_time_accused: [['never', 'a.never', true], ['before', 'a.before', false], ['unknown', 'a.unknown', null]],
  other_cases_pending: [['only', 'a.only', false], ['others', 'a.others', true], ['unknown', 'a.unknown', null]],
  incident_regime: [['ipc', 'a.ipc', 'ipc'], ['bns', 'a.bns', 'bns']],
};

export function initAgentUI({ workbench }) {
  const text = $('#agText');
  const traceEl = $('#agTrace');
  const noteEl = $('#agNote');
  const askEl = $('#agAsk');
  const runBtn = $('#agRun');

  let cap = { ai: false, model: null, known: false };
  let events = [];
  let meta = { chars: 0, removed: { emails: 0, phones: 0, ids: 0 } };
  let finished = null; // { result, route, fallback }
  let answered = {};
  let busy = false;
  let chain = Promise.resolve();
  let quiet = false; // the guided tour does its own scrolling

  const sample = () => sampleCertificate(addDays(todayISO(), -DEMO_DAYS));

  // ---- mode -------------------------------------------------------------------------------------

  function renderMode() {
    const chip = $('#agMode');
    chip.dataset.state = !cap.known ? 'checking' : cap.ai ? 'ai' : 'off';
    $('#agModeTxt').textContent = !cap.known ? t('ag.mode.checking') : cap.ai ? t('ag.mode.ai', { model: cap.model || '' }) : t('ag.mode.off');
    const ai = cap.known && cap.ai;
    $('#agPrivacyFree').hidden = !(ai && cap.retains);
    $('#flowReader').textContent = t(ai ? 'agent.n.reader' : 'agent.n.reader.off');
    $('#flowReaderD').textContent = t(ai ? 'agent.n.reader.d' : 'agent.n.reader.off.d');
  }

  function renderProof() {
    const items = [];
    const fd = (d) => formatDate(d, dateLang());
    const on = cap.known && cap.ai;
    items.push({ text: on ? t('agent.proof.mode.ai', { model: cap.model || '' }) : t('agent.proof.mode.off'), pending: !on });
    if (proof.offline) items.push({ text: t('agent.proof.offline', { p: proof.offline.passed, n: proof.offline.total, date: fd(proof.offline.ran) }) });
    items.push(proof.live
      ? { text: t('agent.proof.live', { p: proof.live.passed, n: proof.live.total, model: proof.live.model || '', date: fd(proof.live.ran) }) }
      : { text: t('agent.proof.live.none'), pending: true });
    if (proof.agentFoundry && proof.agentFoundry.built) {
      const label = esc(t('agent.proof.af'));
      items.push({ html: proof.agentFoundry.url ? `<a href="${esc(proof.agentFoundry.url)}" rel="noopener">${label}</a>` : label, af: true });
    }
    $('#agentProof').innerHTML = items.map((i) => `<li class="${i.pending ? 'is-pending' : ''}${i.af ? ' proof__af' : ''}">${i.html || esc(i.text)}</li>`).join('');
  }

  function ensureVisible(el) {
    if (quiet || !el || el.hidden) return;
    const r = el.getBoundingClientRect();
    const top = ($('#topbar') ? $('#topbar').offsetHeight : 64) + 8;
    if (r.bottom > window.innerHeight - 16 || r.top < top) {
      el.scrollIntoView({ block: r.top < top ? 'start' : 'nearest', behavior: prefersReduced() ? 'auto' : 'smooth' });
    }
  }

  // ---- the trace ----------------------------------------------------------------------------------

  function rowsFrom(list) {
    const rows = [];
    const byId = new Map();
    for (const e of list) {
      if (e.type === 'start') rows.push({ kind: 'read', mode: e.mode, model: e.model });
      else if (e.type === 'tool_call') {
        const r = { kind: 'tool', id: e.id, name: e.name, input: e.input || {}, state: 'running' };
        rows.push(r);
        byId.set(e.id, r);
      } else if (e.type === 'tool_result') {
        const r = byId.get(e.id);
        if (r) { r.state = e.ok ? 'ok' : 'err'; r.content = e.content; }
      }
    }
    return rows;
  }

  function lookupText(r) {
    const sec = `${r.input.law === 'BNS' ? 'BNS' : 'IPC'} ${r.input.section}`;
    const c = r.content || {};
    if (!c.in_table) return t('ag.r.lookup.none', { sec });
    if (c.ambiguous) return t('ag.r.lookup.many', { sec });
    const m = c.matches[0];
    const o = getOffence(m.offence_id);
    const name = o ? o.names[nameKey()] : m.name;
    const months = r.input.law === 'BNS' ? m.max_months_bns : m.max_months_ipc;
    return t('ag.r.lookup', { sec, name, term: months ? termText(months, getLang()) : t('offence.excluded') });
  }

  // A short line for the trace; the full sentence lives in the reader's note below.
  function checkText(c) {
    const fd = (iso) => formatDate(iso, dateLang());
    switch (c.verdict) {
      case 'ELIGIBLE': return t('ag.r.c.eligible', { d: fd(c.eligible_on) });
      case 'NOT_YET': return t('ag.r.c.notyet', { d: fd(c.eligible_on), n: c.days_remaining });
      case 'NEEDS_INFO': return c.if_first_time && c.if_first_time.eligible_on ? t('ag.r.c.two', { a: fd(c.if_first_time.eligible_on), b: fd(c.if_convicted_before.eligible_on) }) : t('ag.r.c.none');
      case 'EXCLUDED': return t('ag.r.c.excluded');
      default: return t('ag.r.c.invalid');
    }
  }

  function rowHTML(r, isNew) {
    const cls = `agstep agstep--${r.kind === 'read' ? 'ok' : r.state}${isNew ? ' is-new' : ''}`;
    if (r.kind === 'read') {
      const route = r.mode === 'ai' ? t('ag.route.ai', { model: r.model || '' }) : t('ag.route.off');
      const bits = [t('ag.r.read', { n: meta.chars }), route];
      const k = meta.removed.emails + meta.removed.phones + meta.removed.ids;
      if (k) bits.push(t('ag.r.redacted', { k }));
      return `<li class="${cls}"><i class="agstep__dot" aria-hidden="true"></i><div class="agstep__body"><p class="agstep__t">${esc(t('ag.tr.read'))}</p><p class="agstep__r">${esc(bits.join(' · '))}</p></div></li>`;
    }
    const titles = { lookup_offence: 'ag.tr.lookup', check_section_479: 'ag.tr.check', draft_papers: 'ag.tr.draft', finish: 'ag.tr.finish' };
    const tags = { lookup_offence: 'ag.tag.table', check_section_479: 'ag.tag.engine', draft_papers: 'ag.tag.engine', finish: 'ag.tag.reader' };
    let result = '';
    let chip = '';
    if (r.state === 'running') result = '…';
    else if (r.state === 'err') result = t('ag.r.rejected');
    else if (r.name === 'lookup_offence') result = lookupText(r);
    else if (r.name === 'check_section_479') {
      result = checkText(r.content);
      chip = `<b class="vchip vchip--${esc(r.content.verdict)}">${esc(t(`ag.v.${r.content.verdict}`))}</b>`;
    } else if (r.name === 'draft_papers') result = t('ag.r.draft', { title: (r.content && r.content.title) || '' });
    else if (r.name === 'finish') {
      // Count what the page will actually ask (the model's list plus what the tool says is missing), not just the model's own list.
      const own = Array.isArray(r.input.questions) ? r.input.questions.length : 0;
      const asked = finished && finished.result && Array.isArray(finished.result.questions) ? finished.result.questions.length : own;
      result = t('ag.r.finish', { n: asked });
    }
    return `<li class="${cls}"><i class="agstep__dot" aria-hidden="true"></i><div class="agstep__body">
      <p class="agstep__t">${esc(t(titles[r.name] || 'ag.tr.finish'))} <code>${esc(r.name)}</code></p>
      <p class="agstep__r">${chip}${esc(result)}</p></div>
      <span class="agstep__tag">${esc(t(tags[r.name] || 'ag.tag.reader'))}</span></li>`;
  }

  function drawTrace(animateLast) {
    const rows = rowsFrom(events);
    traceEl.innerHTML = rows.map((r, i) => rowHTML(r, animateLast && i === rows.length - 1)).join('');
  }

  const pace = () => (prefersReduced() ? 0 : 430);
  function push(e) {
    chain = chain.then(async () => {
      if (e.type === 'reset') { events = []; drawTrace(false); return; }
      if (!['start', 'tool_call', 'tool_result'].includes(e.type)) return;
      events.push(e);
      drawTrace(e.type !== 'tool_result');
      ensureVisible(traceEl.lastElementChild);
      await sleep(e.type === 'tool_call' ? pace() : e.type === 'tool_result' ? pace() / 2 : pace() / 2);
    });
  }

  // ---- after the run ------------------------------------------------------------------------------

  function renderAfter() {
    if (!finished) { noteEl.hidden = true; askEl.hidden = true; return; }
    const { result: r, fallback } = finished;
    const bits = [];
    if (!r.ok) {
      bits.push(`<p class="agnote__t agnote__t--err">${esc(t('ag.err.run'))}</p>`);
    } else {
      const noteText = r.noteSource === 'model' ? r.note : templateSummary({ lang: getLang(), verdict: r.verdict });
      const src = r.noteSource === 'model' ? t('ag.note.model') : t('ag.note.engine');
      bits.push(`<p class="agnote__h">${esc(t('ag.note.h'))} <small>${esc(src)}</small></p><p class="agnote__t">${esc(noteText)}</p>`);
      const ev = r.evidence || {};
      for (const q of [ev.firstTime, ev.pending]) if (q) bits.push(`<p class="agnote__q">${esc(t('ag.evidence', { q }))}</p>`);
    }
    if (fallback) bits.push(`<p class="agnote__fb">${esc(t('ag.fallback', { why: t(`ag.why.${['rate_limited', 'budget', 'no_key', 'network', 'timeout', 'upstream'].includes(fallback) ? fallback : 'other'}`) }))}</p>`);
    const acts = [];
    if (r.facts) acts.push(`<a class="btn btn--small btn--gold" href="#verdict">${esc(t('ag.seeverdict'))}</a>`);
    if (r.drafts && r.drafts.length) acts.push(`<button type="button" class="btn btn--small btn--ghost-dark" data-act="draft">${esc(t('ag.draft.open'))}</button>`);
    if (acts.length) bits.push(`<div class="row">${acts.join('')}</div>`);
    noteEl.innerHTML = bits.join('');
    noteEl.hidden = false;
    renderAsk(r);
  }

  function renderAsk(r) {
    const qs = (r.questions || []).filter((q) => q.field);
    if (!r.ok || !qs.length) { askEl.hidden = true; askEl.innerHTML = ''; return; }
    const parts = qs.map((q) => {
      const label = esc(questionFor(q.field, getLang()) || q.question || '');
      if (CHOICES[q.field]) {
        const chips = CHOICES[q.field].map(([key, tk]) => `<label><input type="radio" name="ag_${q.field}" value="${key}"${answered[q.field] === key ? ' checked' : ''}><span>${esc(t(tk))}</span></label>`).join('');
        return `<div class="agask__q" data-field="${q.field}"><p>${label}</p><div class="chips chips--small">${chips}</div></div>`;
      }
      if (q.field === 'arrest_date') {
        return `<div class="agask__q" data-field="arrest_date"><p>${label}</p><input type="date" min="1990-01-01" max="${todayISO()}" value="${esc(answered.arrest_date || '')}" aria-label="${label}"></div>`;
      }
      return `<div class="agask__q" data-field="${esc(q.field)}"><p>${label}</p><button type="button" class="linkbtn linkbtn--dark" data-act="manual">${esc(t('tab.manual'))}</button></div>`;
    });
    askEl.innerHTML = `<p class="agask__h">${esc(t('ag.ask.h'))}</p>${parts.join('')}`;
    askEl.hidden = false;
  }

  function answer(field, key) {
    const choice = (CHOICES[field] || []).find((c) => c[0] === key);
    if (!choice) return;
    answered[field] = key;
    workbench.setAnswer(field, choice[2]);
    const radio = askEl.querySelector(`input[name="ag_${field}"][value="${key}"]`);
    if (radio) radio.checked = true;
  }

  askEl.addEventListener('change', (e) => {
    const q = e.target.closest('.agask__q');
    if (!q) return;
    const field = q.dataset.field;
    if (e.target.type === 'radio') answer(field, e.target.value);
    else if (e.target.type === 'date') { answered.arrest_date = e.target.value; workbench.setAnswer('arrest_date', e.target.value); }
  });
  const manualJump = () => { workbench.setTab('manual'); const s = $('#offenceSearch'); if (s) s.focus(); };
  askEl.addEventListener('click', (e) => { if (e.target.closest('[data-act="manual"]')) manualJump(); });
  noteEl.addEventListener('click', (e) => { if (e.target.closest('[data-act="draft"]')) { const b = $('#actDraft'); if (b) b.click(); } });

  // ---- running ------------------------------------------------------------------------------------

  async function runNow(opts = {}) {
    if (busy) return null;
    quiet = opts.quiet === true;
    const value = text.value.trim();
    if (!value) {
      traceEl.innerHTML = `<li class="agstep agstep--err"><i class="agstep__dot" aria-hidden="true"></i><div class="agstep__body"><p class="agstep__r">${esc(t('ag.empty'))}</p></div></li>`;
      return null;
    }
    busy = true;
    runBtn.disabled = true;
    runBtn.textContent = t('ag.running');
    events = [];
    finished = null;
    answered = {};
    renderAfter();
    meta = { chars: value.length, removed: redact(value).removed };
    chain = Promise.resolve();
    let out;
    try {
      out = await readPaper({ text: value, lang: getLang(), ai: cap.known && cap.ai, onEvent: push });
    } catch {
      out = { result: { ok: false, error: { code: 'client' }, note: '', questions: [], drafts: [], facts: null }, route: 'offline', fallback: null, removed: meta.removed };
    }
    await chain;
    finished = out;
    drawTrace(false);
    if (out.result.ok && out.result.facts) workbench.applyFacts(out.result.facts);
    busy = false;
    runBtn.disabled = false;
    runBtn.textContent = t('ag.run');
    renderAfter();
    ensureVisible(askEl.hidden ? noteEl : askEl);
    return out;
  }

  /** Fills the sample paper and runs it. With autoAnswer the questions are answered the way the sample story says. */
  async function runSample({ autoAnswer = false, quiet: q = false } = {}) {
    workbench.setTab('agent');
    text.value = sample();
    const out = await runNow({ quiet: q });
    if (autoAnswer && out && out.result.ok) {
      answer('first_time_accused', 'never');
      answer('other_cases_pending', 'only');
    }
    return out;
  }

  // ---- wiring -------------------------------------------------------------------------------------

  text.value = sample();
  runBtn.addEventListener('click', () => runNow());
  $('#agSample').addEventListener('click', () => runSample());
  $('#agentDemo').addEventListener('click', () => {
    const target = document.getElementById('jaanch');
    if (target) target.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => runSample(), prefersReduced() ? 0 : 650);
  });

  onLang(() => {
    renderMode();
    renderProof();
    if (!busy) { drawTrace(false); renderAfter(); runBtn.textContent = t('ag.run'); }
  });
  renderMode();
  renderProof();
  probe().then((c) => { cap = { ...c, known: true }; renderMode(); renderProof(); });

  return { runSample, run: runNow };
}
