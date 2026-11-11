// Language-aware formatting shared by the interface and the drafting module.
// Languages: 'hl' = Hinglish (Hindi in Roman script), 'hi' = Hindi (Devanagari), 'en' = English.

import { parseISO } from './dates.js';

export const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
export const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export function parts(iso) {
  const d = new Date(parseISO(iso));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), w: d.getUTCDay() };
}

/** "9 September 2025" (English and Hinglish) or "9 सितंबर 2025" (Hindi). */
export function formatDate(iso, lang = 'en', { short = false } = {}) {
  if (!iso || parseISO(iso) === null) return '';
  const { y, m, d } = parts(iso);
  const name = lang === 'hi' ? MONTHS_HI[m] : short ? MONTHS_EN[m].slice(0, 3) : MONTHS_EN[m];
  return `${d} ${name} ${y}`;
}

/** Indian digit grouping: 370000 -> "3,70,000". */
export function formatIN(n) {
  return new Intl.NumberFormat('en-IN').format(n);
}

const UNIT = {
  en: { year: ['year', 'years'], month: ['month', 'months'], day: ['day', 'days'] },
  hl: { year: ['saal', 'saal'], month: ['mahina', 'mahine'], day: ['din', 'din'] },
  hi: { year: ['साल', 'साल'], month: ['महीना', 'महीने'], day: ['दिन', 'दिन'] },
};

function unit(lang, kind, n) {
  const u = (UNIT[lang] || UNIT.en)[kind];
  return `${n} ${n === 1 ? u[0] : u[1]}`;
}

/** 36 -> "3 years"; 14 -> "1 year 2 months"; 4 -> "4 months". */
export function termText(totalMonths, lang = 'en') {
  const years = Math.floor(totalMonths / 12);
  const months = Math.round((totalMonths - years * 12) * 100) / 100;
  const out = [];
  if (years) out.push(unit(lang, 'year', years));
  if (months) out.push(Number.isInteger(months) ? unit(lang, 'month', months) : unit(lang, 'day', Math.ceil(months * 30)));
  return out.join(' ') || unit(lang, 'day', 0);
}

export function daysText(n, lang = 'en') {
  return unit(lang, 'day', n);
}

/** 427 days / months + days: "14 months 1 day". */
export function monthsDaysText(months, days, lang = 'en') {
  const out = [];
  if (months) out.push(unit(lang, 'month', months));
  if (days || !months) out.push(unit(lang, 'day', days));
  return out.join(' ');
}
