// The case checker: a form on the left, the answer on the right, updating as you type.
// Nothing here decides anything about the law; it only asks the questions and shows what the engine returns.

import { assess } from '../../engine/section479.js';
import { OFFENCES, GROUP_ORDER, getOffence, needsRegime, customOffence } from '../../engine/offences.js';
import { buildApplication, buildSuperintendentLetter, toPlainText, offenceText } from '../../engine/draft.js';
import { todayISO, addDays, diffDays } from '../../engine/dates.js';
import { formatDate, termText, formatIN } from '../../engine/format.js';
import { t, getLang, onLang } from './i18n.js';
import { $, $$, esc, whenVisible } from './util.js';
import { makeSheet, fillSheet } from './sheet.js';
import { DEMO_DAYS } from './hero.js';

const today = todayISO();
const dateLang = () => (getLang() === 'hi' ? 'hi' : 'en');
const fmt = (iso) => formatDate(iso, dateLang());

const ICON = {
  pass: '<svg viewBox="0 0 24 24" class="s-pass" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fail: '<svg viewBox="0 0 24 24" class="s-fail" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  warn: '<svg viewBox="0 0 24 24" class="s-warn" aria-hidden="true"><path d="M12 3L2 21h20z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5M12 18v.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  info: '<svg viewBox="0 0 24 24" class="s-info" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
};

const state = {
  offenceId: 'theft',
  custom: { section: '', years: '', months: '', life: false, special: false },
  arrestDate: addDays(today, -DEMO_DAYS),
  firstTime: true,
  pending: false,
  regime: null,
  daysOnBail: 0,
  delayDays: 0,
  query: '',
  tab: 'agent',
  draft: { open: false, which: 'court', lang: 'hi', details: { name: '', jail: '', court: '', caseNo: '', ps: '', place: '', sender: '' } },
};

let armed = false; // the first stamp is held back until the person can actually see it
let lastSig = null;
let lastResult = null;

// ---- state <-> engine -----------------------------------------------------------------------

function currentOffence() {
  if (state.offenceId === 'custom') {
    const m = (Number(state.custom.years) || 0) * 12 + (Number(state.custom.months) || 0);
    return customOffence({ section: state.custom.section, maxMonths: m, deathOrLife: state.custom.life, specialLaw: state.custom.special });
  }
  return state.offenceId ? getOffence(state.offenceId) : null;
}

function inputForEngine() {
  return {
    offence: currentOffence(),
    arrestDate: state.arrestDate,
    asOf: today,
    firstTime: state.firstTime === undefined ? null : state.firstTime,
    otherCasesPending: state.pending === undefined ? null : state.pending,
    regime: state.regime,
    daysOnBail: Number(state.daysOnBail) || 0,
    accusedDelayDays: Number(state.delayDays) || 0,
  };
}

function compute() {
  return assess(inputForEngine());
}

// ---- the offence picker ---------------------------------------------------------------------

function nameOf(o) {
  const l = getLang();
  return o.names[l === 'hi' ? 'hi' : l === 'en' ? 'en' : 'hl'];
}

function renderOffenceList() {
  const list = $('#offenceList');
  const q = state.query.trim().toLowerCase();
  const lang = getLang();
  let html = '';
  let any = false;
  for (const g of GROUP_ORDER) {
    const rows = OFFENCES.filter((o) => o.group === g).filter((o) => {
      if (!q) return true;
      const hay = `${o.names.hl} ${o.names.hi} ${o.names.en} ${o.aliases} ${o.bns} ${o.ipc}`.toLowerCase();
      return hay.includes(q);
    });
    if (!rows.length) continue;
    any = true;
    html += `<div class="ogroup" role="presentation">${esc(t(`offence.group.${g}`))}</div>`;
    for (const o of rows) {
      const checked = state.offenceId === o.id;
      let sub;
      if (o.deathOrLife) sub = t('offence.excluded');
      else if (o.maxMonthsBns !== o.maxMonthsIpc) sub = t('offence.maxvar', { a: termText(o.maxMonthsIpc, lang), b: termText(o.maxMonthsBns, lang) });
      else sub = t('offence.max', { term: termText(o.maxMonthsBns, lang) });
      html += `<label class="orow${checked ? ' is-checked' : ''}${o.deathOrLife ? ' orow--x' : ''}">
        <input type="radio" name="offence" value="${o.id}"${checked ? ' checked' : ''}>
        <b>${esc(nameOf(o))}</b>
        <small>BNS ${esc(o.bns)} / IPC ${esc(o.ipc)}<br>${esc(sub)}</small></label>`;
    }
  }
  if (!any && q) html += `<div class="olist__none">${esc(t('offence.none'))}</div>`;
  const customChecked = state.offenceId === 'custom';
  html += `<label class="orow${customChecked ? ' is-checked' : ''}">
    <input type="radio" name="offence" value="custom"${customChecked ? ' checked' : ''}>
    <b>${esc(t('offence.custom'))}</b><small>&nbsp;</small></label>`;
  list.innerHTML = html;
  $('#customBox').hidden = !customChecked;
}

// ---- the form ---------------------------------------------------------------------------------

const valueOf = (v) => (v === true ? 'yes' : v === false ? 'no' : v === null ? 'unknown' : '');

function setRadio(name, value) {
  $$(`input[name="${name}"]`).forEach((r) => { r.checked = r.value === value; });
}

function syncForm() {
  $('#arrestDate').value = state.arrestDate || '';
  $('#arrestDate').max = today;
  setRadio('firstTime', state.firstTime === undefined ? '' : state.firstTime === true ? 'never' : state.firstTime === false ? 'before' : 'unknown');
  setRadio('pending', state.pending === undefined ? '' : valueOf(state.pending));
  setRadio('regime', state.regime || '');
  $('#daysOnBail').value = state.daysOnBail;
  $('#delayDays').value = state.delayDays;
  $('#customSection').value = state.custom.section;
  $('#customYears').value = state.custom.years;
  $('#customMonths').value = state.custom.months;
  $('#customLife').checked = state.custom.life;
  $('#customSpecial').checked = state.custom.special;
  $('#offenceSearch').value = state.query;
  renderOffenceList();
  updateRegimeBox();
}

function updateRegimeBox() {
  const o = currentOffence();
  const show = !!o && !o.custom && needsRegime(o);
  $('#regimeBox').hidden = !show;
  if (!show) { state.regime = null; setRadio('regime', ''); }
}

export function setTab(which) {
  state.tab = which;
  const manual = which === 'manual';
  $('#tabManual').setAttribute('aria-selected', String(manual));
  $('#tabAgent').setAttribute('aria-selected', String(!manual));
  $('#tabManual').tabIndex = manual ? 0 : -1;
  $('#tabAgent').tabIndex = manual ? -1 : 0;
  $('#paneManual').hidden = !manual;
  $('#paneAgent').hidden = manual;
}

function wireForm() {
  $('#offenceSearch').addEventListener('input', (e) => { state.query = e.target.value; renderOffenceList(); });
  $('#offenceList').addEventListener('change', (e) => {
    if (e.target.name !== 'offence') return;
    state.offenceId = e.target.value;
    renderOffenceList();
    updateRegimeBox();
    update();
  });
  $('#arrestDate').addEventListener('input', (e) => { state.arrestDate = e.target.value; update(); });
  $('#firstTime').addEventListener('change', (e) => {
    state.firstTime = e.target.value === 'never' ? true : e.target.value === 'before' ? false : null;
    update();
  });
  $('#pending').addEventListener('change', (e) => {
    state.pending = e.target.value === 'no' ? false : e.target.value === 'yes' ? true : null;
    update();
  });
  $('#regime').addEventListener('change', (e) => { state.regime = e.target.value; update(); });
  $('#daysOnBail').addEventListener('input', (e) => { state.daysOnBail = e.target.value === '' ? 0 : Number(e.target.value); update(); });
  $('#delayDays').addEventListener('input', (e) => { state.delayDays = e.target.value === '' ? 0 : Number(e.target.value); update(); });
  $('#customSection').addEventListener('input', (e) => { state.custom.section = e.target.value; update(); });
  $('#customYears').addEventListener('input', (e) => { state.custom.years = e.target.value; update(); });
  $('#customMonths').addEventListener('input', (e) => { state.custom.months = e.target.value; update(); });
  $('#customLife').addEventListener('change', (e) => { state.custom.life = e.target.checked; update(); });
  $('#customSpecial').addEventListener('change', (e) => { state.custom.special = e.target.checked; update(); });

  $('#tabManual').addEventListener('click', () => setTab('manual'));
  $('#tabAgent').addEventListener('click', () => setTab('agent'));
  $('.tabs[role="tablist"]').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const next = state.tab === 'agent' ? 'manual' : 'agent';
      setTab(next);
      $(next === 'manual' ? '#tabManual' : '#tabAgent').focus();
    }
  });

  $('#loadSample').addEventListener('click', loadSample);
  $('#clearCase').addEventListener('click', clearCase);
  $('#caseForm').addEventListener('submit', (e) => e.preventDefault());

  wireDraft();
}

export function loadSample() {
  Object.assign(state, {
    offenceId: 'theft', arrestDate: addDays(today, -DEMO_DAYS), firstTime: true, pending: false, regime: null,
    daysOnBail: 0, delayDays: 0, query: '', custom: { section: '', years: '', months: '', life: false, special: false },
  });
  setTab('manual');
  syncForm();
  update();
}

function clearCase() {
  Object.assign(state, {
    offenceId: null, arrestDate: '', firstTime: undefined, pending: undefined, regime: null,
    daysOnBail: 0, delayDays: 0, query: '', custom: { section: '', years: '', months: '', life: false, special: false },
  });
  closeDraft();
  setTab('manual');
  syncForm();
  update();
  $('#offenceSearch').focus();
}

// ---- facts handed over by the agent ---------------------------------------------------------------
// The agent reads the paper; the form is where the person sees and corrects what it found.
// Anything the agent could not read stays unanswered here, so the rules engine asks instead of assuming.

export function applyFacts(f) {
  if (!f) return;
  const unset = (v) => (v === null || v === undefined ? undefined : v);
  state.offenceId = f.custom ? 'custom' : f.offenceId || null;
  state.custom = f.custom
    ? {
        section: f.custom.section || '', years: String(Math.floor((f.custom.maxMonths || 0) / 12)),
        months: String((f.custom.maxMonths || 0) % 12), life: !!f.custom.deathOrLife, special: !!f.custom.specialLaw,
      }
    : { section: '', years: '', months: '', life: false, special: false };
  state.arrestDate = f.arrestDate || '';
  state.firstTime = unset(f.firstTime);
  state.pending = unset(f.otherCasesPending);
  state.regime = f.regime || null;
  state.daysOnBail = f.daysOnBail || 0;
  state.delayDays = f.accusedDelayDays || 0;
  state.query = '';
  closeDraft();
  syncForm();
  update();
}

/** One answer to a question the agent asked. */
export function setAnswer(field, value) {
  if (field === 'first_time_accused') state.firstTime = value === null ? null : value;
  else if (field === 'other_cases_pending') state.pending = value === null ? null : value;
  else if (field === 'incident_regime') state.regime = value;
  else if (field === 'arrest_date') state.arrestDate = value || '';
  else return;
  syncForm();
  update();
}

/** The engine's current answer, for the agent panel to quote. */
export function currentResult() {
  return lastResult;
}

// ---- the result --------------------------------------------------------------------------------

function termForThreshold(r, L) {
  return Number.isInteger(r.thresholdMonths) ? termText(r.thresholdMonths, L) : `${r.thresholdDays} ${t('trace.fr.third') && (L === 'hi' ? 'दिन' : L === 'en' ? 'days' : 'din')}`;
}

function traceHTML(r) {
  const L = getLang();
  const rows = [];
  const add = (status, text, cite) => rows.push(
    `<li>${ICON[status]}<span>${esc(text)}</span>${cite ? `<span class="cite">${esc(t(cite))}</span>` : ''}</li>`,
  );
  for (const s of r.trace) {
    switch (s.id) {
      case 'offence':
        add('info', t('trace.offence', { term: termText(s.maxMonths, L), via: s.regime ? t(`trace.via.${s.regime}`) : '' }), 'cite.1');
        break;
      case 'death_life':
        add(s.status, t(`trace.death_life.${s.status}`), 'cite.1');
        break;
      case 'first_time':
        add('info', t(s.first ? 'trace.first_time.yes' : 'trace.first_time.no'), s.first ? 'cite.p1' : 'cite.1');
        break;
      case 'threshold':
        add('info', t('trace.threshold', { fr: t(s.fraction === '1/3' ? 'trace.fr.third' : 'trace.fr.half'), thr: termForThreshold(r, L), days: s.thresholdDays }), 'cite.1');
        break;
      case 'exclusions':
        add('info', t('trace.exclusions', { b: s.daysOnBail, d: s.accusedDelayDays }), 'cite.expl');
        break;
      case 'custody':
        add('info', t('trace.custody', { c: s.custodyDays, k: s.counted }));
        break;
      case 'reached':
        add(s.status, t(`trace.reached.${s.status}`, { k: r.counted, t: r.thresholdDays, date: fmt(s.eligibleOn) }), 'cite.1');
        break;
      case 'pending_cases':
        add(s.status === 'warn' ? 'warn' : s.status === 'pass' ? 'pass' : 'info', t(`trace.pending.${s.status === 'warn' ? 'warn' : s.status === 'pass' ? 'pass' : 'info'}`), 'cite.2');
        break;
      case 'third_proviso':
        add(s.status === 'warn' ? 'warn' : 'info', t(s.status === 'warn' ? 'trace.third.warn' : 'trace.third', { date: fmt(s.maxEndsOn) }), 'cite.p3');
        break;
      default:
    }
  }
  return `<h3 class="trace-h">${esc(t('trace.h'))}</h3><ol class="trace">${rows.join('')}</ol>`;
}

const FLAG_ORDER = ['PENDING_CASES', 'MULTIPLE_OFFENCES', 'SPECIAL_LAW', 'MAX_TERM_REACHED', 'VERIFY_PENDING_CASES', 'IPC_MAX_APPLIED', 'REPEAT_ENHANCED', 'SECOND_PROVISO'];
const FLAG_WARN = new Set(['PENDING_CASES', 'MULTIPLE_OFFENCES', 'SPECIAL_LAW', 'MAX_TERM_REACHED']);

function flagsHTML(r) {
  const items = FLAG_ORDER.filter((f) => r.flags.includes(f));
  if (!items.length) return '';
  return `<div class="flags">${items.map((f) => `<p class="flag ${FLAG_WARN.has(f) ? 'flag--warn' : 'flag--note'}">${esc(t(`flag.${f}`))}</p>`).join('')}</div>`;
}

function plainBlock(title, body) {
  return `<div class="v__plain"><h3>${esc(title)}</h3>${body ? `<p>${esc(body)}</p>` : ''}</div>`;
}

function infoBlock(r) {
  const L = getLang();
  const miss = r.missing[0];
  if (miss === 'offence') return plainBlock(t('v.info.offence'));
  if (miss === 'arrestDate') return plainBlock(t('v.info.arrest'));
  if (miss === 'maxMonths') return plainBlock(t('v.info.maxMonths'));
  if (miss === 'regime') return plainBlock(t('v.info.regime'));
  if (miss === 'firstTime' && r.scenarios) {
    const a = `${fmt(r.scenarios.firstTime.eligibleOn)} (${termText(r.scenarios.firstTime.thresholdMonths, L)})`;
    const b = `${fmt(r.scenarios.otherwise.eligibleOn)} (${termText(r.scenarios.otherwise.thresholdMonths, L)})`;
    return plainBlock(t('v.info.t'), t('v.info.first', { a, b }));
  }
  return plainBlock(t('v.info.t'));
}

function summaryText(r) {
  if (r.verdict === 'ELIGIBLE') return `${t('v.stamp.eligible')}: ${fmt(r.eligibleOn)}`;
  if (r.verdict === 'NOT_YET') return `${t('v.stamp.notyet')}: ${fmt(r.eligibleOn)}`;
  if (r.verdict === 'EXCLUDED') return t('v.excluded.t');
  if (r.verdict === 'INVALID') return t(`v.invalid.${r.reason}`);
  return t('v.info.t');
}

function renderVerdict(r, animate) {
  const root = $('#verdict');
  const L = getLang();
  const input = inputForEngine();
  let html = '';
  let sheetIso = null;

  if (r.verdict === 'ELIGIBLE' || r.verdict === 'NOT_YET') {
    const eligible = r.verdict === 'ELIGIBLE';
    sheetIso = r.eligibleOn;
    const line = eligible
      ? (r.daysOverdue === 0 ? t('v.eligible.today') : t('v.eligible', { n: r.daysOverdue }))
      : t('v.notyet', { n: r.daysRemaining });
    const bar = eligible ? '' : `<div class="v__bar"><div><i style="width:${Math.round(r.progress * 100)}%"></i></div><p>${esc(t('v.progress', { c: r.counted, t: r.thresholdDays }))}</p></div>`;
    html += `<div class="v__top">
      <div class="vsheet" id="vsheet"><span class="stamp stamp--${eligible ? 'eligible' : 'notyet'}${animate ? ' is-in' : ''}">${esc(t(eligible ? 'v.stamp.eligible' : 'v.stamp.notyet'))}</span></div>
      <div class="v__text"><p class="v__label">${esc(t('v.label'))}</p><p class="v__line">${esc(line)}</p>${bar}</div></div>`;
    html += flagsHTML(r);
    html += '<div class="actions">';
    if (eligible) {
      html += `<button type="button" class="btn btn--gold" id="actDraft">${esc(t('act.draft'))}</button>`;
      html += `<a class="btn btn--ghost" id="actWa" target="_blank" rel="noopener" href="${waHref(r, input)}">${esc(t('act.whatsapp'))}</a>`;
    } else {
      html += `<p class="actions__wait">${esc(t('act.wait'))}</p>`;
      html += `<a class="btn btn--gold" id="actGcal" target="_blank" rel="noopener" href="${gcalHref(r)}">${esc(t('act.gcal'))}</a>`;
      html += `<button type="button" class="linkbtn" id="actIcs">${esc(t('act.remind'))}</button>`;
    }
    html += '</div>';
    html += traceHTML(r);
  } else if (r.verdict === 'EXCLUDED') {
    html += `<div class="v__top"><div class="vsheet vsheet--bare" id="vsheet"><span class="stamp stamp--flat stamp--excluded${animate ? ' is-in' : ''}">${esc(t('v.stamp.excluded'))}</span></div>
      <div class="v__text">${plainBlock(t('v.excluded.t'), t('v.excluded.d'))}</div></div>${traceHTML(r)}`;
  } else if (r.verdict === 'INVALID') {
    html += plainBlock(t(`v.invalid.${r.reason}`));
  } else {
    html += `<div class="v__top"><div class="vsheet vsheet--bare" id="vsheet"><span class="stamp stamp--flat stamp--info${animate ? ' is-in' : ''}">${esc(t('v.stamp.info'))}</span></div>
      <div class="v__text">${infoBlock(r)}</div></div>`;
    if (r.flags && r.flags.length && r.scenarios) html += flagsHTML(r);
  }

  root.innerHTML = html;

  if (sheetIso) {
    const mount = $('#vsheet');
    const sheet = makeSheet({ static: !animate });
    fillSheet(sheet, sheetIso, { tone: 'law', foot: t('cal.law') });
    mount.prepend(sheet);
    if (animate) mount.classList.add('is-hit');
  }

  const draftBtn = $('#actDraft');
  if (draftBtn) draftBtn.addEventListener('click', (e) => openDraft(e.isTrusted));
  const ics = $('#actIcs');
  if (ics) ics.addEventListener('click', () => downloadIcs(r));

  const mini = $('#minibar');
  mini.hidden = false;
  $('#minibarTxt').textContent = summaryText(r);
}

function update() {
  const r = compute();
  lastResult = r;
  const sig = `${r.verdict}|${r.eligibleOn || ''}|${r.fraction || ''}|${r.missing.join(',')}|${r.reason || ''}`;
  const changed = sig !== lastSig;
  lastSig = sig;
  renderVerdict(r, armed && changed);
  if (state.draft.open) {
    if (r.verdict === 'ELIGIBLE') renderDoc();
    else closeDraft();
  }
}

export function replayVerdict() {
  lastSig = null;
  armed = true;
  update();
}

// ---- sharing -------------------------------------------------------------------------------------

function waHref(r, input) {
  const L = getLang();
  const off = currentOffence();
  const label = off ? offenceText(off, L === 'hi' ? 'hi' : 'en') : '';
  const text = t('share.wa', { offence: label, arrest: fmt(input.arrestDate), date: fmt(r.eligibleOn), n: r.daysOverdue });
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function gcalHref(r) {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: t('ics.title'),
    dates: `${icsDate(r.eligibleOn)}/${icsDate(addDays(r.eligibleOn, 1))}`,
    details: t('ics.desc'),
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function icsDate(iso) { return iso.replace(/-/g, ''); }

function downloadIcs(r) {
  const esc2 = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tareekh//Section 479//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${Date.now()}@tareekh`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(r.eligibleOn)}`, `DTEND;VALUE=DATE:${icsDate(addDays(r.eligibleOn, 1))}`,
    `SUMMARY:${esc2(t('ics.title'))}`, `DESCRIPTION:${esc2(t('ics.desc'))}`,
    'BEGIN:VALARM', 'TRIGGER:-P7D', 'ACTION:DISPLAY', `DESCRIPTION:${esc2(t('ics.title'))}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tareekh-rihaai.ics';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ---- the draft -------------------------------------------------------------------------------------

function currentDoc() {
  const r = lastResult;
  const input = inputForEngine();
  const offence = currentOffence();
  const args = { lang: state.draft.lang, result: r, offence, input, details: state.draft.details };
  return state.draft.which === 'court' ? buildApplication(args) : buildSuperintendentLetter(args);
}

function docHTML(doc) {
  return doc.blocks.map((b) => {
    const text = esc(b.text).replace(/\[[^\]]+\]/g, (m) => `<mark class="ph">${m}</mark>`);
    const cls = { line: 'doc__line', heading: 'doc__heading', para: 'doc__para', numbered: 'doc__num', prayer: 'doc__prayer', sign: 'doc__sign', note: 'doc__note' }[b.type];
    return `<p class="${cls}">${text}</p>`;
  }).join('');
}

function renderDoc() {
  if (!lastResult || lastResult.verdict !== 'ELIGIBLE') return;
  const doc = currentDoc();
  const view = $('#docView');
  view.lang = state.draft.lang;
  view.innerHTML = docHTML(doc);
  const plain = toPlainText(doc);
  $('#dMail').href = `mailto:?subject=${encodeURIComponent(doc.title)}&body=${encodeURIComponent(plain)}`;
  $('#dWa').href = `https://wa.me/?text=${encodeURIComponent(plain)}`;
  $$('[data-for]').forEach((n) => {
    const f = n.dataset.for;
    n.hidden = !(f === 'both' || f === state.draft.which);
  });
  setRadio('dlang', state.draft.lang);
  const court = state.draft.which === 'court';
  $('#dTabCourt').setAttribute('aria-selected', String(court));
  $('#dTabJail').setAttribute('aria-selected', String(!court));
  $('#dTabCourt').tabIndex = court ? 0 : -1;
  $('#dTabJail').tabIndex = court ? -1 : 0;
}

function openDraft(scroll = true) {
  state.draft.open = true;
  $('#draft').hidden = false;
  renderDoc();
  if (scroll) $('#draft').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeDraft() {
  state.draft.open = false;
  $('#draft').hidden = true;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function wireDraft() {
  $('#draftClose').addEventListener('click', closeDraft);
  $('#dTabCourt').addEventListener('click', () => { state.draft.which = 'court'; renderDoc(); });
  $('#dTabJail').addEventListener('click', () => { state.draft.which = 'jail'; renderDoc(); });
  $('#dLang').addEventListener('change', (e) => { state.draft.lang = e.target.value; renderDoc(); });
  $$('[data-detail]').forEach((inp) => inp.addEventListener('input', () => {
    state.draft.details[inp.dataset.detail] = inp.value;
    renderDoc();
  }));
  $('#dCopy').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const ok = await copyText(toPlainText(currentDoc()));
    if (ok) {
      const old = btn.textContent;
      btn.textContent = t('d.copied');
      setTimeout(() => { btn.textContent = t('d.copy'); }, 1600);
      void old;
    }
  });
  $('#dPrint').addEventListener('click', () => {
    let root = $('#printRoot');
    if (!root) { root = document.createElement('div'); root.id = 'printRoot'; document.body.append(root); }
    root.innerHTML = `<article class="doc" lang="${state.draft.lang}">${docHTML(currentDoc())}</article>`;
    try { window.print(); } catch { /* printing can be blocked inside embedded previews */ }
  });
}

// ---- boot -----------------------------------------------------------------------------------------

export function initWorkbench() {
  syncForm();
  setTab('agent');
  wireForm();
  update();
  onLang(() => {
    renderOffenceList();
    update();
    if (state.draft.open) renderDoc();
  });
  // Hold the first stamp until the person can see the result.
  whenVisible($('#verdict'), () => { armed = true; lastSig = null; update(); }, { threshold: 0.35 });
  return { loadSample, replayVerdict, applyFacts, setAnswer, setTab };
}
