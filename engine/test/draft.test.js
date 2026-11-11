import test from 'node:test';
import assert from 'node:assert/strict';
import { assess } from '../section479.js';
import { getOffence } from '../offences.js';
import { buildApplication, buildSuperintendentLetter, toPlainText } from '../draft.js';
import { formatDate, formatIN, termText, monthsDaysText } from '../format.js';

const input = { arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false, daysOnBail: 0, accusedDelayDays: 0 };
const offence = getOffence('theft');
const result = assess({ offence, ...input });

test('format: dates, Indian grouping, terms', () => {
  assert.equal(formatDate('2025-09-09', 'en'), '9 September 2025');
  assert.equal(formatDate('2025-09-09', 'hi'), '9 सितंबर 2025');
  assert.equal(formatDate('2025-09-09', 'hl', { short: true }), '9 Sep 2025');
  assert.equal(formatIN(370000), '3,70,000');
  assert.equal(termText(36, 'en'), '3 years');
  assert.equal(termText(14, 'en'), '1 year 2 months');
  assert.equal(termText(36, 'hi'), '3 साल');
  assert.equal(termText(4, 'hl'), '4 mahine');
  assert.equal(monthsDaysText(14, 1, 'en'), '14 months 1 day');
});

test('application (English) carries the facts the court needs, and shows what is missing', () => {
  const doc = buildApplication({ lang: 'en', result, offence, input, details: { jail: 'District Jail, Sample' } });
  const text = toPlainText(doc);
  assert.match(text, /9 September 2025/);
  assert.match(text, /3 years/);
  assert.match(text, /one-third/);
  assert.match(text, /that is 1 year\./);
  assert.match(text, /9 September 2026/);
  assert.match(text, /District Jail, Sample/);
  assert.match(text, /\[Name of the accused\]/);
  assert.match(text, /Section 479\(2\) does not stand in the way/);
  assert.match(text, /on his personal bond/);
});

test('application (Hindi) is in Devanagari and uses the right fraction', () => {
  const doc = buildApplication({ lang: 'hi', result, offence, input });
  const text = toPlainText(doc);
  assert.match(text, /धारा 479/);
  assert.match(text, /एक-तिहाई/);
  assert.match(text, /9 सितंबर 2025/);
  assert.match(text, /\[अभियुक्त का नाम\]/);
});

test('previously convicted: one-half and bail, not one-third and bond', () => {
  const r = assess({ offence, ...input, firstTime: false, arrestDate: '2025-01-10' });
  const text = toPlainText(buildApplication({ lang: 'en', result: r, offence, input: { ...input, firstTime: false, arrestDate: '2025-01-10' } }));
  assert.match(text, /one-half/);
  assert.match(text, /on bail/);
  assert.doesNotMatch(text, /first-time offender who has never/);
});

test('pending-case statement is never asserted when it is unknown or untrue', () => {
  const unknown = assess({ offence, ...input, otherCasesPending: null });
  const t1 = toPlainText(buildApplication({ lang: 'en', result: unknown, offence, input: { ...input, otherCasesPending: null } }));
  assert.match(t1, /confirm from jail records/);
  assert.doesNotMatch(t1, /does not stand in the way/);
  const yes = assess({ offence, ...input, otherCasesPending: true });
  const t2 = toPlainText(buildApplication({ lang: 'en', result: yes, offence, input: { ...input, otherCasesPending: true } }));
  assert.match(t2, /Counsel to add/);
});

test('exclusions are stated in the application', () => {
  const inp = { ...input, daysOnBail: 20, accusedDelayDays: 15 };
  const r = assess({ offence, ...inp });
  const text = toPlainText(buildApplication({ lang: 'en', result: r, offence, input: inp }));
  assert.match(text, /on bail for 20 days/);
  assert.match(text, /15 days of delay attributable to the applicant/);
});

test('Superintendent letter cites S.479(3) and the dates', () => {
  const text = toPlainText(buildSuperintendentLetter({ lang: 'en', result, offence, input }));
  assert.match(text, /Section 479\(3\)/);
  assert.match(text, /9 September 2026/);
  assert.match(text, /62 days ago/);
  const hi = toPlainText(buildSuperintendentLetter({ lang: 'hi', result, offence, input }));
  assert.match(hi, /धारा 479\(3\)/);
});

test('drafts refuse to be written for a case that is not eligible', () => {
  const notYet = assess({ offence, ...input, arrestDate: '2026-06-01' });
  assert.throws(() => buildApplication({ lang: 'en', result: notYet, offence, input }));
  assert.throws(() => buildSuperintendentLetter({ lang: 'en', result: notYet, offence, input }));
});
