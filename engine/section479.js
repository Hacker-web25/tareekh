// Section 479 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) as a deterministic rules engine.
//
// Statute, in short (text verified against the quotation in the High Court of Himachal Pradesh
// judgment in Ravi Hans v. State of H.P., 10 Jan 2025):
//   (1)  An undertrial who has been detained for up to one-half of the maximum imprisonment for the
//        offence (not an offence punishable with death or life imprisonment) "shall be released by the
//        Court on bail".
//        1st proviso: a first-time offender (never convicted of any offence) is released on bond
//                     after one-third.
//        2nd proviso: the Court may, after hearing the Public Prosecutor and for reasons recorded in
//                     writing, order longer detention.
//        3rd proviso: in no case beyond the maximum period of imprisonment.
//        Explanation: detention caused by delay attributable to the accused is excluded from the count.
//   (2)  Not available where investigation, inquiry or trial in more than one offence or multiple cases
//        are pending against the person.
//   (3)  The Superintendent of Jail shall forthwith apply in writing to the Court on completion of
//        one-half or one-third of the period.
//
// This module never guesses. When an answer is missing it says what is missing; when the law is
// contested (sub-section (2), special statutes) it raises a flag and asks for a lawyer.
// It produces a language-free "trace"; the interface turns it into words.

import { parseISO, addDays, addMonths, addMonthsFractional, diffDays } from './dates.js';

export const FIRST_TIME = { key: '1/3', num: 1, den: 3 };
export const OTHERWISE = { key: '1/2', num: 1, den: 2 };

function resolveMaxMonths(offence, regime, firstTime) {
  if (offence.custom) {
    return offence.maxMonths > 0 ? { months: offence.maxMonths } : { missing: 'maxMonths' };
  }
  const b = offence.maxMonthsBns;
  const i = offence.maxMonthsIpc;
  if (b === i) return { months: b, regimeUsed: null };
  if (regime === 'bns') {
    // A previous conviction can raise the BNS maximum (theft); record it, never apply it silently.
    return { months: b, regimeUsed: 'bns' };
  }
  if (regime === 'ipc') return { months: i, regimeUsed: 'ipc' };
  return { missing: 'regime' };
}

function scenario({ arrestDate, asOf, maxMonths, fraction, daysOnBail, accusedDelayDays }) {
  const clock = addMonthsFractional(arrestDate, (maxMonths * fraction.num) / fraction.den);
  const thresholdDays = diffDays(arrestDate, clock);
  const shift = daysOnBail + accusedDelayDays;
  const eligibleOn = addDays(clock, shift);
  const maxEndsOn = addDays(addMonths(arrestDate, maxMonths), shift);
  const gap = diffDays(eligibleOn, asOf);
  const custodyDays = diffDays(arrestDate, asOf);
  const counted = custodyDays - shift;
  return {
    fraction: fraction.key,
    thresholdMonths: (maxMonths * fraction.num) / fraction.den,
    thresholdDays,
    eligibleOn,
    maxEndsOn,
    reached: gap >= 0,
    daysOverdue: Math.max(0, gap),
    daysRemaining: Math.max(0, -gap),
    maxReached: diffDays(maxEndsOn, asOf) >= 0,
    custodyDays,
    counted,
    progress: thresholdDays > 0 ? Math.max(0, Math.min(1, counted / thresholdDays)) : 1,
  };
}

const wholeNonNegative = (n) => Number.isFinite(n) && n >= 0 && Math.floor(n) === n;

/**
 * @param {object} input
 * @param {object|null} input.offence        an entry from OFFENCES or customOffence()
 * @param {string} input.arrestDate          ISO date detention began in this case
 * @param {string} input.asOf                ISO date to compute for (normally today)
 * @param {boolean|null} input.firstTime     true: never convicted; false: previously convicted; null: not known
 * @param {boolean|null} input.otherCasesPending
 * @param {'bns'|'ipc'|null} input.regime    which law's maximum applies (needed only if they differ)
 * @param {number} input.daysOnBail          days outside custody in this case (do not count)
 * @param {number} input.accusedDelayDays    days of detention caused by the accused's own delay (excluded)
 * @param {boolean} input.multipleOffences   true if more than one section is charged in this case
 */
export function assess(input) {
  const {
    offence = null,
    arrestDate,
    asOf,
    firstTime = null,
    otherCasesPending = null,
    regime = null,
    daysOnBail = 0,
    accusedDelayDays = 0,
    multipleOffences = false,
  } = input || {};

  const base = { trace: [], flags: [], missing: [], needsLawyer: false, scenarios: null };

  if (parseISO(asOf) === null) return { ...base, verdict: 'INVALID', reason: 'as_of' };
  if (!arrestDate) return { ...base, verdict: 'NEEDS_INFO', missing: ['arrestDate', ...(offence ? [] : ['offence'])] };
  if (parseISO(arrestDate) === null) return { ...base, verdict: 'INVALID', reason: 'arrest_date' };
  if (diffDays(arrestDate, asOf) < 0) return { ...base, verdict: 'INVALID', reason: 'arrest_in_future' };
  if (!wholeNonNegative(daysOnBail) || !wholeNonNegative(accusedDelayDays)) {
    return { ...base, verdict: 'INVALID', reason: 'negative_days' };
  }
  const custodyDays = diffDays(arrestDate, asOf);
  if (daysOnBail > custodyDays) return { ...base, verdict: 'INVALID', reason: 'bail_exceeds_custody' };
  if (daysOnBail + accusedDelayDays > custodyDays) return { ...base, verdict: 'INVALID', reason: 'delay_exceeds_custody' };

  if (!offence) return { ...base, verdict: 'NEEDS_INFO', missing: ['offence'] };

  const trace = [];
  const flags = [];

  // Rule 1: offences punishable with death or life imprisonment are outside Section 479(1).
  if (offence.deathOrLife) {
    trace.push({ id: 'death_life', status: 'fail' });
    return { ...base, verdict: 'EXCLUDED', trace, custodyDays };
  }

  const resolved = resolveMaxMonths(offence, regime, firstTime);
  if (resolved.missing) {
    return { ...base, verdict: 'NEEDS_INFO', missing: [resolved.missing], custodyDays };
  }
  const maxMonths = resolved.months;

  trace.push({ id: 'offence', status: 'info', maxMonths, regime: resolved.regimeUsed || null });
  trace.push({ id: 'death_life', status: 'pass' });

  const args = { arrestDate, asOf, maxMonths, daysOnBail, accusedDelayDays };
  const sFirst = scenario({ ...args, fraction: FIRST_TIME });
  const sOther = scenario({ ...args, fraction: OTHERWISE });

  // Flags: things the person reading the result must not miss.
  if (offence.specialLaw) flags.push('SPECIAL_LAW');
  // Several sections in one case: the offence passed in is the one with the longest maximum (the cautious
  // choice), and Section 479(2) speaks of "more than one offence", so a lawyer must confirm how it applies.
  if (multipleOffences === true) flags.push('MULTIPLE_OFFENCES');
  if (otherCasesPending === true) flags.push('PENDING_CASES');
  if (otherCasesPending === null) flags.push('VERIFY_PENDING_CASES');
  if (resolved.regimeUsed === 'ipc') flags.push('IPC_MAX_APPLIED');
  if (firstTime === false && offence.repeatMaxMonths) flags.push('REPEAT_ENHANCED');
  flags.push('SECOND_PROVISO');

  const needsLawyer = flags.includes('SPECIAL_LAW') || flags.includes('PENDING_CASES') || flags.includes('MULTIPLE_OFFENCES');

  if (firstTime === null) {
    return {
      ...base, verdict: 'NEEDS_INFO', missing: ['firstTime'], trace, flags, needsLawyer,
      maxMonths, custodyDays, scenarios: { firstTime: sFirst, otherwise: sOther },
    };
  }

  const s = firstTime ? sFirst : sOther;
  trace.push({ id: 'first_time', status: 'info', first: firstTime, fraction: s.fraction });
  trace.push({
    id: 'threshold', status: 'info', fraction: s.fraction, thresholdMonths: s.thresholdMonths,
    thresholdDays: s.thresholdDays,
  });
  if (daysOnBail > 0 || accusedDelayDays > 0) {
    trace.push({ id: 'exclusions', status: 'info', daysOnBail, accusedDelayDays });
  }
  trace.push({ id: 'custody', status: 'info', custodyDays: s.custodyDays, counted: s.counted });
  trace.push({
    id: 'reached', status: s.reached ? 'pass' : 'fail', eligibleOn: s.eligibleOn,
    daysOverdue: s.daysOverdue, daysRemaining: s.daysRemaining,
  });
  trace.push({
    id: 'pending_cases',
    status: otherCasesPending === false ? 'pass' : otherCasesPending === true ? 'warn' : 'info',
    answer: otherCasesPending,
  });
  if (s.maxReached) flags.push('MAX_TERM_REACHED');
  trace.push({ id: 'third_proviso', status: s.maxReached ? 'warn' : 'info', maxEndsOn: s.maxEndsOn });

  return {
    ...base,
    verdict: s.reached ? 'ELIGIBLE' : 'NOT_YET',
    trace, flags, needsLawyer, maxMonths,
    firstTime, fraction: s.fraction, thresholdMonths: s.thresholdMonths, thresholdDays: s.thresholdDays,
    eligibleOn: s.eligibleOn, maxEndsOn: s.maxEndsOn,
    daysOverdue: s.daysOverdue, daysRemaining: s.daysRemaining,
    custodyDays: s.custodyDays, counted: s.counted, progress: s.progress,
    regimeUsed: resolved.regimeUsed || null,
    scenarios: { firstTime: sFirst, otherwise: sOther },
  };
}
