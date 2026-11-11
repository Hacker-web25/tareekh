export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ENT[c]);

/** Run `cb` once, the first time `node` is on screen. */
export function whenVisible(node, cb, { threshold = 0.3 } = {}) {
  if (!node) return;
  if (!('IntersectionObserver' in window)) { cb(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { threshold });
  io.observe(node);
}

export function countUp(node, to, ms, format) {
  if (prefersReduced()) { node.textContent = format(to); return; }
  const t0 = performance.now();
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    const eased = 1 - Math.pow(1 - k, 3);
    node.textContent = format(Math.round(to * eased));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
