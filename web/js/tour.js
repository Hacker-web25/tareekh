// "40 second mein samjhein": the page scrolls itself through the story, with a caption for each stop.
// Any touch, key press, wheel turn or click hands control straight back to the person.
import { t, onLang } from './i18n.js';
import { $, prefersReduced, sleep } from './util.js';

const STOPS_MS = 52000; // only used to size the progress bar; the real length is the sum of the waits below

export function initTour({ hero, workbench, agent }) {
  const btn = $('#tourBtn');
  if (!btn) return;

  const cap = document.createElement('div');
  cap.className = 'tourcap';
  cap.id = 'tourCap';
  cap.hidden = true;
  cap.setAttribute('role', 'status');
  cap.innerHTML = '<p class="tourcap__txt"></p><p class="tourcap__hint"></p><i class="tourcap__bar"><b></b></i>';
  document.body.append(cap);
  const txt = $('.tourcap__txt', cap);
  const hint = $('.tourcap__hint', cap);
  const bar = $('.tourcap__bar b', cap);

  let running = false;
  let runId = 0;
  let capKey = null;
  let openedDraft = false;

  const label = () => {
    btn.dataset.i18n = running ? 'hero.cta2.stop' : 'hero.cta2';
    btn.textContent = t(btn.dataset.i18n);
    btn.setAttribute('aria-pressed', String(running));
  };

  const caption = (n) => {
    capKey = `tour.c${n}`;
    txt.textContent = t(capKey);
    hint.textContent = t('tour.hint');
    cap.classList.remove('is-swap');
    void cap.offsetWidth; // restart the little swap animation
    cap.classList.add('is-swap');
  };

  const topbarH = () => ($('#topbar') ? $('#topbar').offsetHeight : 0);
  const yOf = (sel, extra = 0) => {
    const el = $(sel);
    if (!el) return window.scrollY;
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - topbarH() - 10 + extra);
  };

  function scrollAnim(to, ms, id) {
    return new Promise((resolve) => {
      const from = window.scrollY;
      if (prefersReduced() || ms === 0 || Math.abs(to - from) < 2) {
        window.scrollTo({ top: to, behavior: 'instant' });
        resolve();
        return;
      }
      const t0 = performance.now();
      const tick = (now) => {
        if (runId !== id) { resolve(); return; }
        const k = Math.min(1, (now - t0) / ms);
        const e = k < 0.5 ? 4 * k * k * k : 1 - ((-2 * k + 2) ** 3) / 2;
        window.scrollTo({ top: from + (to - from) * e, behavior: 'instant' });
        if (k < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  const stopOnInput = (e) => {
    if (e.target && e.target.closest && e.target.closest('#tourBtn')) return; // the button handles itself
    stop();
  };
  const EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'];

  function stop() {
    if (!running) return;
    running = false;
    runId += 1;
    EVENTS.forEach((ev) => window.removeEventListener(ev, stopOnInput));
    cap.hidden = true;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    label();
  }

  async function run() {
    running = true;
    runId += 1;
    const id = runId;
    const alive = () => running && runId === id;
    const hold = async (ms) => { await sleep(ms); return alive(); };
    openedDraft = false;
    label();
    EVENTS.forEach((ev) => window.addEventListener(ev, stopOnInput, { passive: true }));

    cap.hidden = false;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    bar.style.transition = `width ${STOPS_MS}ms linear`;
    bar.style.width = '100%';

    const narrow = () => window.innerWidth <= 980;

    // 1. the problem
    caption(1);
    await scrollAnim(0, 700, id);
    if (!alive()) return;
    hero.play();
    if (!(await hold(10500))) return;

    // 2. what Tareekh does
    caption(2);
    await scrollAnim(yOf('#kaise'), 1200, id);
    if (!(await hold(5200))) return;

    // 2b. what the AI does, and where it stops
    caption(7);
    await scrollAnim(yOf('#agent'), 1200, id);
    if (!(await hold(5600))) return;

    // 3. the answer for a case: the agent reads a paper, asks, and the engine decides
    caption(3);
    await scrollAnim(yOf('#jaanch'), 1300, id);
    if (!alive()) return;
    try { await agent.runSample({ autoAnswer: true, quiet: true }); } catch { workbench.loadSample(); }
    if (!alive()) return;
    if (narrow()) await scrollAnim(yOf('#verdict'), 900, id);
    workbench.replayVerdict();
    if (!(await hold(4800))) return;

    // 4. the paperwork
    caption(4);
    const open = $('#actDraft');
    if (open) { open.click(); openedDraft = true; }
    await scrollAnim(yOf('#draft'), 1200, id);
    if (!(await hold(4500))) return;

    // 5. the size of it
    caption(5);
    await scrollAnim(yOf('#scale'), 1400, id);
    if (!(await hold(4800))) return;

    // 6. the honest ledger
    caption(6);
    await scrollAnim(yOf('#asar'), 1200, id);
    if (!(await hold(3600))) return;

    // back to the case checker, ready for the person's own case
    if (openedDraft) $('#draftClose').click();
    await scrollAnim(yOf('#jaanch'), 1400, id);
    stop();
  }

  btn.addEventListener('click', () => { if (running) stop(); else run(); });

  onLang(() => {
    label();
    if (running && capKey) { txt.textContent = t(capKey); hint.textContent = t('tour.hint'); }
  });
  label();
}
