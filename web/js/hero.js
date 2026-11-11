// The opening: a wall calendar whose pages tear off one by one while a man waits in jail.
// The numbers come from the same rules engine as the case checker, so what the headline says
// and what the calendar shows can never disagree.

import { assess } from '../../engine/section479.js';
import { getOffence } from '../../engine/offences.js';
import { addDays, diffDays, calendarDiff, todayISO, parseISO } from '../../engine/dates.js';
import { formatDate, termText, monthsDaysText, parts } from '../../engine/format.js';
import { t, getLang } from './i18n.js';
import { $, prefersReduced, sleep } from './util.js';
import { makeSheet, fillSheet } from './sheet.js';

export const DEMO_DAYS = 427;

/** Ramesh: an invented first-time accused of theft, held 427 days. */
export function demoCase(today = todayISO()) {
  return {
    offence: getOffence('theft'),
    arrestDate: addDays(today, -DEMO_DAYS),
    asOf: today,
    firstTime: true,
    otherCasesPending: false,
    regime: null,
    daysOnBail: 0,
    accusedDelayDays: 0,
  };
}

const dateLang = () => (getLang() === 'hi' ? 'hi' : 'en');

export function initHero() {
  const today = todayISO();
  const demo = demoCase(today);
  const R = assess(demo);
  const total = R.custodyDays;
  const lawIdx = diffDays(demo.arrestDate, R.eligibleOn);
  const late = R.daysOverdue;

  const pad = $('#calPad');
  const A = makeSheet();
  const B = makeSheet();
  pad.append(B, A);
  let front = A;
  let back = B;
  front.style.zIndex = 3;
  back.style.zIndex = 2;

  let shown = 0; // index (days since arrest) of the page currently on top
  let runId = 0;

  const iso = (idx) => addDays(demo.arrestDate, idx);
  const toneFor = (idx) => (idx === lawIdx ? 'law' : idx > lawIdx ? 'late' : 'normal');
  const footFor = (idx) => {
    if (idx === lawIdx) return t('cal.law');
    if (idx > lawIdx) return t('cal.late', { n: idx - lawIdx });
    return t('cal.day', { n: idx + 1 });
  };
  const fill = (el, idx, tone = toneFor(idx)) => fillSheet(el, iso(idx), { tone, foot: footFor(idx) });

  const hud = {
    root: $('.cal__hud'), law: $('#hudLaw'), fill: $('#hudFill'),
    start: $('#hudStart'), end: $('#hudEnd'), year: $('#calYear'),
  };
  const pct = (idx) => (idx / total) * 100;
  hud.root.style.setProperty('--law', `${pct(lawIdx).toFixed(2)}%`);

  function setHud(idx) {
    hud.fill.style.clipPath = `inset(0 ${(100 - pct(idx)).toFixed(2)}% 0 0 round 5px)`;
    hud.year.textContent = String(parts(iso(idx)).y);
  }

  function labels() {
    const L = getLang();
    const dl = dateLang();
    hud.law.innerHTML = `${t('cal.law')}<small>${formatDate(R.eligibleOn, dl, { short: true })}</small>`;
    hud.start.textContent = `${t('cal.arrest')} ${formatDate(demo.arrestDate, dl, { short: true })}`;
    hud.end.textContent = `${t('cal.today')} ${formatDate(today, dl, { short: true })}`;

    const since = calendarDiff(demo.arrestDate, today);
    $('#heroH1a').textContent = t('hero.h1a', { n: late });
    $('#heroP').textContent = t('hero.p', {
      max: termText(R.maxMonths, L),
      thr: termText(R.thresholdMonths, L),
      since: monthsDaysText(since.months, since.days, L),
    });
    // keep both pages' captions in the current language
    [front, back].forEach((el) => {
      const idx = diffDays(demo.arrestDate, el.dataset.iso || demo.arrestDate);
      el.querySelector('.sheet__foot').textContent = footFor(idx);
    });
  }

  // ---- the sequence of pages ----------------------------------------------------------------
  // First, one page per day so the picture is understood. Then the pages speed up, slow down to land
  // exactly on the date the law set, and the red pages keep falling until today.
  function plan() {
    const steps = [];
    const push = (idx, ms, hold = 0) => {
      if (idx > (steps.length ? steps[steps.length - 1].idx : 0) && idx <= total) steps.push({ idx, ms, hold });
    };
    for (let i = 1; i <= 5; i += 1) push(i, 470 - i * 32);
    let i = 5;
    let gap = 3;
    let ms = 230;
    while (i + gap < lawIdx - 12) {
      i += gap;
      push(i, Math.max(72, ms));
      gap = Math.ceil(gap * 1.45);
      ms *= 0.86;
    }
    [lawIdx - 9, lawIdx - 4, lawIdx - 2, lawIdx - 1].forEach((x, k) => push(x, 160 + k * 80));
    push(lawIdx, 440, 1700);
    [1, 2, 3].forEach((k) => push(lawIdx + k, 380 - k * 45));
    i = lawIdx + 3;
    gap = 4;
    ms = 210;
    while (i + gap < total - 6) {
      i += gap;
      push(i, Math.max(92, ms));
      gap = Math.ceil(gap * 1.4);
      ms *= 0.9;
    }
    push(total - 3, 210);
    push(total - 1, 280);
    push(total, 540, 300);
    return steps;
  }

  const KEYS = [
    { transform: 'rotate(0deg) translate(0px, 0px)', opacity: 1, offset: 0 },
    { transform: 'rotate(-4deg) translate(-4px, -9px)', opacity: 1, offset: 0.2 },
    { transform: 'rotate(-30deg) translate(-70px, 34px)', opacity: 1, offset: 0.55 },
    { transform: 'rotate(-56deg) translate(-200px, 380px)', opacity: 0, offset: 1 },
  ];

  function tear(el, ms) {
    return new Promise((resolve) => {
      const a = el.animate(KEYS, { duration: ms, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' });
      a.onfinish = resolve;
      a.oncancel = resolve;
    });
  }

  function swap() {
    front.getAnimations().forEach((a) => a.cancel());
    front.style.zIndex = 2;
    back.style.zIndex = 3;
    [front, back] = [back, front];
  }

  function showFinal() {
    front.getAnimations().forEach((a) => a.cancel());
    fill(front, total);
    fill(back, total);
    front.style.zIndex = 3;
    back.style.zIndex = 2;
    shown = total;
    setHud(total);
  }

  async function play() {
    const my = ++runId;
    if (prefersReduced()) { showFinal(); return; }
    front.getAnimations().forEach((a) => a.cancel());
    back.getAnimations().forEach((a) => a.cancel());
    front.style.zIndex = 3;
    back.style.zIndex = 2;
    shown = 0;
    fill(front, 0);
    setHud(0);
    const steps = plan();
    await sleep(900);
    for (const st of steps) {
      if (my !== runId) return;
      // The page underneath is what the tear reveals. For the law's date, the ring is drawn after it lands.
      fill(back, st.idx, st.idx === lawIdx ? 'normal' : toneFor(st.idx));
      if (st.idx === lawIdx) back.querySelector('.sheet__foot').textContent = footFor(st.idx);
      setHud(st.idx);
      await tear(front, st.ms);
      if (my !== runId) return;
      swap();
      shown = st.idx;
      if (st.idx === lawIdx) front.dataset.tone = 'law';
      if (st.hold) await sleep(st.hold);
    }
  }

  labels();
  fill(front, 0);
  fill(back, 1);
  setHud(0);
  $('#replayBtn').addEventListener('click', () => { play(); });

  return {
    play,
    relabel() { labels(); },
    stats: { late, total, lawIdx },
  };
}
