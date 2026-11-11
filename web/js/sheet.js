// One tear-off calendar sheet. The hero and the result panel use the same object,
// so the date the law set looks the same wherever the person meets it.

import { parts, MONTHS_EN, MONTHS_HI, WEEKDAYS_EN, WEEKDAYS_HI } from '../../engine/format.js';

// A hand-drawn loop that overshoots where it started, like a pen circling a date.
const RING = 'M60 120 C 52 52, 150 18, 232 36 C 300 52, 312 150, 250 196 C 190 238, 74 214, 56 150 C 50 130, 58 108, 82 88';

export function makeSheet({ static: isStatic = false } = {}) {
  const el = document.createElement('div');
  el.className = 'sheet' + (isStatic ? ' sheet--static' : '');
  el.dataset.tone = 'normal';
  el.innerHTML = `
    <div class="sheet__perf"></div>
    <div class="sheet__month"></div>
    <div class="sheet__num"></div>
    <svg class="sheet__ring" viewBox="0 0 320 230" aria-hidden="true"><path pathLength="1" d="${RING}"/></svg>
    <div class="sheet__day"><span lang="hi"></span><span></span></div>
    <div class="sheet__foot"></div>`;
  return el;
}

export function fillSheet(el, iso, { foot = '', tone = 'normal' } = {}) {
  const { y, m, d, w } = parts(iso);
  el.dataset.iso = iso;
  el.dataset.tone = tone;
  el.querySelector('.sheet__month').innerHTML = `<span lang="hi">${MONTHS_HI[m]}</span> ${MONTHS_EN[m]} ${y}`;
  el.querySelector('.sheet__num').textContent = String(d);
  const days = el.querySelectorAll('.sheet__day span');
  days[0].textContent = WEEKDAYS_HI[w];
  days[1].textContent = WEEKDAYS_EN[w];
  el.querySelector('.sheet__foot').textContent = foot;
}
