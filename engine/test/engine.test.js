import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, addDays, diffDays, calendarDiff, parseISO, addMonthsFractional } from '../dates.js';
import { assess } from '../section479.js';
import { OFFENCES, getOffence, needsRegime, customOffence } from '../offences.js';
import { extractFromText, findSections, matchOffences, sampleCertificate } from '../reader.js';

const theft = getOffence('theft');

test('dates: calendar maths is exact and clamps month ends', () => {
  assert.equal(addMonths('2026-08-31', 6), '2027-02-28');
  assert.equal(addMonths('2024-08-31', 6), '2025-02-28');
  assert.equal(addMonths('2024-02-29', 12), '2025-02-28');
  assert.equal(addMonths('2025-01-31', 1), '2025-02-28');
  assert.equal(addMonths('2025-11-15', -12), '2024-11-15');
  assert.equal(diffDays('2025-09-09', '2026-11-10'), 427);
  assert.equal(addDays('2026-02-27', 3), '2026-03-02');
  assert.equal(parseISO('2026-02-30'), null);
  assert.equal(parseISO('hello'), null);
  assert.deepEqual(calendarDiff('2025-09-09', '2026-11-10'), { months: 14, days: 1 });
});

test('dates: a fractional month is rounded up, never down', () => {
  assert.equal(addMonthsFractional('2026-01-01', 1 / 3), addDays('2026-01-01', 10));
  assert.equal(addMonthsFractional('2026-01-01', 12), '2027-01-01');
});

test('Ramesh: theft (max 3 yrs), first-time, 427 days in custody -> eligible, 62 days overdue', () => {
  const r = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.equal(r.verdict, 'ELIGIBLE');
  assert.equal(r.fraction, '1/3');
  assert.equal(r.eligibleOn, '2026-09-09');
  assert.equal(r.daysOverdue, 62);
  assert.equal(r.custodyDays, 427);
  assert.equal(r.needsLawyer, false);
  assert.ok(r.flags.includes('SECOND_PROVISO'));
});

test('exactly on the threshold date counts as reached; the day before does not', () => {
  const on = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-09-09', firstTime: true, otherCasesPending: false });
  assert.equal(on.verdict, 'ELIGIBLE');
  assert.equal(on.daysOverdue, 0);
  const before = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-09-08', firstTime: true, otherCasesPending: false });
  assert.equal(before.verdict, 'NOT_YET');
  assert.equal(before.daysRemaining, 1);
});

test('not yet: says exactly when', () => {
  const r = assess({ offence: theft, arrestDate: '2026-06-01', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.equal(r.verdict, 'NOT_YET');
  assert.equal(r.eligibleOn, '2027-06-01');
  assert.equal(r.daysRemaining, diffDays('2026-11-10', '2027-06-01'));
  assert.ok(r.progress > 0 && r.progress < 1);
});

test('previously convicted: one-half, not one-third', () => {
  const r = assess({ offence: theft, arrestDate: '2025-01-10', asOf: '2026-11-10', firstTime: false, otherCasesPending: false });
  assert.equal(r.fraction, '1/2');
  assert.equal(r.eligibleOn, '2026-07-10');
  assert.equal(r.verdict, 'ELIGIBLE');
  assert.ok(r.flags.includes('REPEAT_ENHANCED'));
});

test('time on bail and delay caused by the accused push the date out day for day', () => {
  const plain = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  const shifted = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false, daysOnBail: 20, accusedDelayDays: 15 });
  assert.equal(shifted.eligibleOn, addDays(plain.eligibleOn, 35));
  assert.equal(shifted.daysOverdue, plain.daysOverdue - 35);
  assert.equal(shifted.counted, 427 - 35);
});

test('death or life imprisonment offences are outside S.479(1)', () => {
  const r = assess({ offence: getOffence('murder'), arrestDate: '2020-01-01', asOf: '2026-11-10', firstTime: true });
  assert.equal(r.verdict, 'EXCLUDED');
  assert.equal(r.eligibleOn, undefined);
});

test('where BNS and IPC maxima differ, the engine refuses to guess', () => {
  const cbt = getOffence('cbt');
  assert.equal(needsRegime(cbt), true);
  assert.equal(needsRegime(theft), false);
  const none = assess({ offence: cbt, arrestDate: '2025-01-01', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.equal(none.verdict, 'NEEDS_INFO');
  assert.deepEqual(none.missing, ['regime']);
  const ipc = assess({ offence: cbt, arrestDate: '2025-01-01', asOf: '2026-11-10', firstTime: true, otherCasesPending: false, regime: 'ipc' });
  const bns = assess({ offence: cbt, arrestDate: '2025-01-01', asOf: '2026-11-10', firstTime: true, otherCasesPending: false, regime: 'bns' });
  assert.equal(ipc.maxMonths, 36);
  assert.equal(ipc.eligibleOn, '2026-01-01'); // one-third of 36 months = 12 months
  assert.equal(bns.maxMonths, 60);
  assert.equal(bns.eligibleOn, '2026-09-01'); // one-third of 60 months = 20 months
  assert.ok(ipc.flags.includes('IPC_MAX_APPLIED'));
});

test('first-time status unknown: both dates are returned and no verdict is claimed', () => {
  const r = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: null, otherCasesPending: false });
  assert.equal(r.verdict, 'NEEDS_INFO');
  assert.deepEqual(r.missing, ['firstTime']);
  assert.equal(r.scenarios.firstTime.eligibleOn, '2026-09-09');
  assert.equal(r.scenarios.otherwise.eligibleOn, '2027-03-09');
});

test('other cases pending (S.479(2)) and special laws raise the lawyer flag', () => {
  const r = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: true });
  assert.equal(r.verdict, 'ELIGIBLE');
  assert.ok(r.flags.includes('PENDING_CASES'));
  assert.equal(r.needsLawyer, true);
  const special = assess({ offence: customOffence({ section: 'NDPS 20(b)', maxMonths: 120, specialLaw: true }), arrestDate: '2020-01-01', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.ok(special.flags.includes('SPECIAL_LAW'));
  assert.equal(special.needsLawyer, true);
  const unknown = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: null });
  assert.ok(unknown.flags.includes('VERIFY_PENDING_CASES'));
  assert.equal(unknown.needsLawyer, false);
});

test('third proviso: past the maximum term is flagged', () => {
  const r = assess({ offence: getOffence('hurt'), arrestDate: '2024-01-01', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.equal(r.verdict, 'ELIGIBLE');
  assert.ok(r.flags.includes('MAX_TERM_REACHED'));
});

test('a hand-entered offence works; a missing maximum is reported, not assumed', () => {
  const ok = assess({ offence: customOffence({ section: 'BNS 125(b)', maxMonths: 36 }), arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.equal(ok.verdict, 'ELIGIBLE');
  const bad = assess({ offence: customOffence({ section: 'X', maxMonths: 0 }), arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true });
  assert.equal(bad.verdict, 'NEEDS_INFO');
  assert.deepEqual(bad.missing, ['maxMonths']);
});

test('bad inputs are rejected with a reason', () => {
  assert.equal(assess({ offence: theft, arrestDate: '2027-01-01', asOf: '2026-11-10', firstTime: true }).reason, 'arrest_in_future');
  assert.equal(assess({ offence: theft, arrestDate: '2026-02-30', asOf: '2026-11-10', firstTime: true }).verdict, 'INVALID');
  assert.equal(assess({ offence: theft, arrestDate: '2026-01-01', asOf: '2026-11-10', firstTime: true, daysOnBail: 999 }).reason, 'bail_exceeds_custody');
  assert.equal(assess({ offence: theft, arrestDate: '2026-01-01', asOf: '2026-11-10', firstTime: true, accusedDelayDays: -1 }).reason, 'negative_days');
  assert.equal(assess({ offence: null, arrestDate: '2026-01-01', asOf: '2026-11-10' }).verdict, 'NEEDS_INFO');
  assert.deepEqual(assess({ offence: theft, arrestDate: '', asOf: '2026-11-10' }).missing, ['arrestDate']);
});

test('offence table is internally consistent', () => {
  const ids = new Set();
  for (const o of OFFENCES) {
    assert.ok(!ids.has(o.id), `duplicate id ${o.id}`);
    ids.add(o.id);
    assert.ok(o.names.hl && o.names.hi && o.names.en, `${o.id} needs three names`);
    if (!o.deathOrLife) {
      assert.ok(o.maxMonthsBns > 0 && o.maxMonthsIpc > 0, `${o.id} needs maxima`);
      assert.ok(o.maxMonthsIpc <= o.maxMonthsBns, `${o.id}: IPC maximum should not exceed BNS`);
    }
  }
});

test('reader: sections in the common written forms', () => {
  const got = (t) => findSections(t).map((h) => `${h.law} ${h.section}`);
  assert.deepEqual(got('Charged under Section 379 IPC.'), ['IPC 379']);
  assert.deepEqual(got('u/s 379, 411 IPC'), ['IPC 379', 'IPC 411']);
  assert.deepEqual(got('BNS Sec. 303(2)'), ['BNS 303(2)']);
  assert.deepEqual(got('under sections 420 & 406 of the IPC'), ['IPC 420', 'IPC 406']);
  assert.deepEqual(got('धारा 379 भादवि'), ['IPC 379']);
  assert.deepEqual(got('धारा ४२० भा.द.वि.'), ['IPC 420']);
});

test('reader: sections map to table entries, and ambiguity is kept visible', () => {
  assert.deepEqual(matchOffences('IPC', '379'), ['theft']);
  assert.deepEqual(matchOffences('BNS', '303(2)'), ['theft']);
  assert.deepEqual(matchOffences('BNS', '303'), ['theft']);
  assert.deepEqual(matchOffences('IPC', '506').sort(), ['intimidation', 'intimidation_grave']);
  assert.deepEqual(matchOffences('IPC', '420'), ['cheating_delivery']);
  assert.deepEqual(matchOffences('IPC', '999'), []);
});

test('reader: arrest date is the one next to an arrest word, not the hearing date', () => {
  const r = extractFromText(sampleCertificate('2025-09-09'));
  assert.equal(r.arrestDate, '2025-09-09');
  assert.equal(r.arrestBasis, 'arrest_word');
  assert.deepEqual(r.offenceIds, ['theft']);
  assert.equal(r.unknown.length, 0);
});

test('reader: words, Hindi months and Hindi digits', () => {
  assert.equal(extractFromText('He was arrested on 5th March 2026 under 323 IPC').arrestDate, '2026-03-05');
  assert.equal(extractFromText('आरोपी को १२ सितंबर २०२५ को गिरफ्तार किया गया, धारा 379 भादवि').arrestDate, '2025-09-12');
  assert.equal(extractFromText('no dates or sections here').found, false);
  assert.equal(extractFromText('arrested on 31/02/2026').arrestDate, null);
});

test('several sections charged: flagged, lawyer required, verdict unchanged', () => {
  const r = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false, multipleOffences: true });
  assert.ok(r.flags.includes('MULTIPLE_OFFENCES'));
  assert.equal(r.needsLawyer, true);
  const one = assess({ offence: theft, arrestDate: '2025-09-09', asOf: '2026-11-10', firstTime: true, otherCasesPending: false });
  assert.equal(one.verdict, r.verdict);
  assert.equal(one.eligibleOn, r.eligibleOn);
  assert.ok(!one.flags.includes('MULTIPLE_OFFENCES'));
});
