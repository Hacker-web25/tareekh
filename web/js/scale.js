// 370 dots, one for every thousand undertrials. One of them is gold.
import { $, whenVisible, countUp } from './util.js';
import { formatIN } from '../../engine/format.js';

const TOTAL = 370;
const GOLD_AT = 166; // somewhere inside the grid, not at an edge, so the eye has to find it
const PEOPLE = 370000;

export function initScale() {
  const dots = $('#dots');
  const big = $('#bigNum');
  if (!dots || !big) return;

  let html = '';
  for (let i = 0; i < TOTAL; i += 1) {
    html += `<i class="dot${i === GOLD_AT ? ' dot--gold' : ''}" style="--i:${i}"></i>`;
  }
  dots.innerHTML = html;
  big.textContent = formatIN(0);

  whenVisible($('#scale'), () => {
    dots.classList.add('is-lit');
    countUp(big, PEOPLE, 1900, formatIN);
  }, { threshold: 0.3 });
}
