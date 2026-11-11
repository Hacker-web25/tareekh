import { initialLang, setLang, getLang, onLang, t, LANGS } from './i18n.js';
import { $, $$, whenVisible } from './util.js';
import { REVIEW_STATUS } from '../../engine/offences.js';
import { formatDate } from '../../engine/format.js';
import { initHero } from './hero.js';
import { initWorkbench } from './workbench.js';
import { initAgentUI } from './agentui.js';
import { initScale } from './scale.js';
import { initLedger } from './ledger.js';
import { initTour } from './tour.js';

function initLangSwitch() {
  const btns = $$('#langSwitch [data-lang]');
  const mark = () => btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  btns.forEach((b) => b.addEventListener('click', () => { if (LANGS.includes(b.dataset.lang)) setLang(b.dataset.lang); }));
  onLang(mark);
  mark();
}

function initHeader() {
  const bar = $('#topbar');
  const tick = () => bar.classList.toggle('is-solid', window.scrollY > 24);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
}

// The four-step strip draws itself once, the first time it is on screen.
function initPipeline() {
  $$('.ico__tick, .ico__write path, #tapePath').forEach((p) => p.setAttribute('pathLength', '1'));
  whenVisible($('#steps'), () => $('#steps').classList.add('is-in'), { threshold: 0.35 });
}

function initReviewLine() {
  const el = $('#reviewLine');
  const render = () => {
    el.textContent = t('ft.review', { date: formatDate(REVIEW_STATUS.lastChecked, getLang() === 'hi' ? 'hi' : 'en') });
  };
  render();
  onLang(render);
}

function boot() {
  setLang(initialLang(), { silent: true });
  initLangSwitch();
  initHeader();
  initPipeline();
  initReviewLine();
  initLedger();
  initScale();
  const hero = initHero();
  const workbench = initWorkbench();
  const agent = initAgentUI({ workbench });
  onLang(() => hero.relabel());
  initTour({ hero, workbench, agent });
  hero.play();
  $('#cal')?.removeAttribute('aria-busy');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
