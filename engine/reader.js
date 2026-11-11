// Reads the plain text of a custody certificate / remand order / FIR copy and pulls out
// (a) the date detention began and (b) the IPC / BNS sections charged.
// No AI involved: patterns only, so the result is reproducible. Anything uncertain is reported
// as uncertain so the person can correct it. (Reading photos and scans is the agent's job.)

import { OFFENCES } from './offences.js';
import { parseISO, toISO } from './dates.js';

const MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
  jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10,
  nov: 11, november: 11, dec: 12, december: 12,
  'जनवरी': 1, 'फरवरी': 2, 'फ़रवरी': 2, 'मार्च': 3, 'अप्रैल': 4, 'मई': 5, 'जून': 6, 'जुलाई': 7,
  'अगस्त': 8, 'सितंबर': 9, 'सितम्बर': 9, 'अक्टूबर': 10, 'अक्तूबर': 10, 'नवंबर': 11, 'नवम्बर': 11,
  'दिसंबर': 12, 'दिसम्बर': 12,
};

// Devanagari digits -> ASCII, so "१२/०९/२०२५" reads too.
function normaliseDigits(text) {
  return text.replace(/[०-९]/g, (c) => String(c.charCodeAt(0) - 0x0966));
}

const ARREST_WORDS = /(arrest|apprehend|taken into custody|giraft|गिरफ्त|गिरफ़्त|पकड़)/i;
const CUSTODY_WORDS = /(custody|remand|lodged|committed to jail|in jail since|हिरासत|रिमांड|जेल)/i;

function findDates(text) {
  const found = [];
  const push = (index, d, m, y) => {
    const iso = toISO(Date.UTC(y, m - 1, d));
    if (parseISO(iso) !== null && y >= 1990 && y <= 2100 && d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      // Re-validate that the date did not roll over (e.g. 31/02).
      const back = new Date(Date.UTC(y, m - 1, d));
      if (back.getUTCDate() === d && back.getUTCMonth() === m - 1) found.push({ index, iso });
    }
  };
  let m;
  const numeric = /(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{4})/g;
  while ((m = numeric.exec(text))) push(m.index, +m[1], +m[2], +m[3]);
  const textual = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-zऀ-ॿ]+)\.?,?\s+(\d{4})/g;
  while ((m = textual.exec(text))) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (mon) push(m.index, +m[1], mon, +m[3]);
  }
  return found.sort((a, b) => a.index - b.index);
}

// Words that describe a date sit on the same line as the date, so look no further back than that.
function contextOf(text, index, before = 90, after = 40) {
  const from = Math.max(0, index - before);
  const lineStart = text.lastIndexOf('\n', index - 1) + 1;
  return text.slice(Math.max(from, lineStart), index + after);
}

export function pickArrestDate(text) {
  const dates = findDates(text);
  if (!dates.length) return { date: null, basis: null, candidates: [] };
  const withContext = dates.map((d) => ({ ...d, ctx: contextOf(text, d.index) }));
  const arrest = withContext.filter((d) => ARREST_WORDS.test(d.ctx));
  const custody = withContext.filter((d) => CUSTODY_WORDS.test(d.ctx));
  const earliest = (list) => list.reduce((a, b) => (a.iso <= b.iso ? a : b));
  const candidates = [...new Set(dates.map((d) => d.iso))];
  if (arrest.length) return { date: earliest(arrest).iso, basis: 'arrest_word', candidates };
  if (custody.length) return { date: earliest(custody).iso, basis: 'custody_word', candidates };
  return { date: earliest(dates).iso, basis: 'earliest', candidates };
}

// ---- Sections -------------------------------------------------------------------------------

const LAW_TOKEN = '(IPC|I\\.P\\.C\\.?|BNS|B\\.N\\.S\\.?|भा\\.?\\s?द\\.?\\s?वि\\.?|भादवि|आईपीसी|बीएनएस|भारतीय\\s+दंड\\s+संहिता|भारतीय\\s+न्याय\\s+संहिता)';
const SECTION = '\\d{1,3}[A-Z]?(?:\\s*\\(\\s*\\d+\\s*\\))?(?:\\s*\\(\\s*[a-z]\\s*\\))?';
const SECTION_RUN = `${SECTION}(?:\\s*(?:,|/|&|and|और|तथा)\\s*${SECTION})*`;

function lawOf(token) {
  const t = token.replace(/[\s.]/g, '').toLowerCase();
  if (t.startsWith('bns') || t === 'बीएनएस' || t.includes('न्याय')) return 'BNS';
  return 'IPC';
}

function splitSections(run) {
  return run
    .split(/\s*(?:,|\/|&|and|और|तथा)\s*/i)
    .map((x) => x.replace(/\s+/g, '').toUpperCase())
    .filter(Boolean);
}

export function findSections(textRaw) {
  const text = normaliseDigits(textRaw);
  const hits = [];
  const add = (law, sections) => sections.forEach((s) => hits.push({ law, section: s }));
  let m;
  // "379, 411 IPC" / "u/s 420 of IPC" / "धारा 379 भादवि"
  const after = new RegExp(`(${SECTION_RUN})\\s*(?:of\\s+(?:the\\s+)?)?${LAW_TOKEN}`, 'gi');
  while ((m = after.exec(text))) add(lawOf(m[2]), splitSections(m[1]));
  // "IPC 379" / "BNS section 303(2)" / "IPC Sec. 420"
  const before = new RegExp(`${LAW_TOKEN}\\s*(?:sections?|sec\\.?|s\\.|धारा)?\\s*(${SECTION_RUN})`, 'gi');
  while ((m = before.exec(text))) add(lawOf(m[1]), splitSections(m[2]));
  // de-duplicate
  const seen = new Set();
  return hits.filter((h) => {
    const k = `${h.law}:${h.section}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const norm = (s) => String(s).replace(/\s+/g, '').toUpperCase();
const base = (s) => norm(s).replace(/\(.*$/, '');

/** Which table entries could a (law, section) pair mean? */
export function matchOffences(law, section) {
  const key = norm(section);
  const baseKey = base(section);
  return OFFENCES.filter((o) => {
    const own = law === 'BNS' ? norm(o.bns) : norm(o.ipc);
    const ownBase = law === 'BNS' ? base(o.bns) : base(o.ipc.replace(/\s*\(.*\)$/, ''));
    if (key === own) return true;
    // "506" or "351" without a sub-clause: every entry under that section is a candidate.
    return key === baseKey && baseKey === ownBase;
  }).map((o) => o.id);
}

export function extractFromText(text) {
  const t = normaliseDigits(String(text || ''));
  const arrest = pickArrestDate(t);
  const sections = findSections(t).map((h) => ({ ...h, offenceIds: matchOffences(h.law, h.section) }));
  const offenceIds = [...new Set(sections.flatMap((s) => s.offenceIds))];
  const unknown = sections.filter((s) => s.offenceIds.length === 0);
  return {
    arrestDate: arrest.date,
    arrestBasis: arrest.basis,
    dateCandidates: arrest.candidates,
    sections,
    offenceIds,
    unknown,
    found: !!(arrest.date || sections.length),
  };
}

/** A made-up custody certificate used by the "Namuna kagaz" button. Every name and number is fictional. */
export function sampleCertificate(arrestISO) {
  const [y, m, d] = arrestISO.split('-');
  const dmy = `${d}/${m}/${y}`;
  return [
    'DISTRICT JAIL (SAMPLE) - CUSTODY CERTIFICATE',
    'This is a fictional specimen for demonstration. It is not a real record.',
    '',
    `Name of undertrial: Ramesh (illustrative)       Case: State v. Ramesh, FIR No. 112/2025`,
    `The above named person was arrested on ${dmy} and has remained in judicial custody since then.`,
    'Charged under Section 379 IPC.',
    'Next date of hearing: 14/12/2026. FIR registered on the day before arrest.',
  ].join('\n');
}
