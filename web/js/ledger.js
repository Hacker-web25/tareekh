// The impact ledger. It prints exactly what web/data/impact.json says and nothing else.
// Numbers are only ever added to that file after a lawyer or jail officer has confirmed them on a real case.
import impact from '../data/impact.json';
import { t, onLang } from './i18n.js';
import { $, esc } from './util.js';
import { formatIN } from '../../engine/format.js';

const num = (n) => (Number.isFinite(n) ? formatIN(n) : '—');

function render() {
  const rows = [
    ['im.r1', num(impact.checked)],
    ['im.r2', num(impact.eligible)],
    ['im.r3', num(impact.filed)],
    ['im.r4', num(impact.released)],
    ['im.r5', num(impact.medianDaysToRelease)],
  ];
  $('#khaata').innerHTML = `<dl>${rows.map(([k, v]) => `<div class="khaata__row"><dt>${esc(t(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;

  const p = impact.pilot || {};
  $('#pilotLine').textContent = p.partner ? `${p.partner}${p.since ? ` (${p.since})` : ''}` : t('im.pilot.none');

  const join = $('#pilotJoin');
  if (impact.contactEmail) {
    join.href = `mailto:${impact.contactEmail}`;
    join.hidden = false;
  } else {
    join.hidden = true;
  }
}

export function initLedger() {
  render();
  onLang(render);
}
