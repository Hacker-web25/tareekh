// The tools the agent can call. Each one is a thin, validated wrapper around the rules engine.
// The model never computes a date or decides eligibility: it can only ask these tools.

import { OFFENCES, getOffence, needsRegime, customOffence } from '../../engine/offences.js';
import { assess } from '../../engine/section479.js';
import { matchOffences, extractFromText } from '../../engine/reader.js';
import { buildApplication, buildSuperintendentLetter, toPlainText } from '../../engine/draft.js';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

const factProps = {
  offence_id: {
    type: 'string',
    description: 'The offence_id returned by lookup_offence. Omit if the section was not found in the table.',
  },
  custom_offence: {
    type: 'object',
    description: 'Only for a section that is not in the table AND whose maximum sentence is written in the paper itself. Never invent a maximum.',
    properties: {
      section: { type: 'string' },
      max_months: { type: 'integer', minimum: 1, description: 'Maximum sentence in months, exactly as the law or paper states it.' },
      death_or_life: { type: 'boolean', description: 'True if death or life imprisonment is a possible punishment.' },
      special_law: { type: 'boolean', description: 'True for NDPS, UAPA, PMLA and similar special laws.' },
    },
    required: ['section', 'max_months'],
  },
  also_charged: {
    type: 'array',
    items: { type: 'string' },
    description: 'offence_ids of every OTHER section charged in THIS same case. The tool picks the section with the longest maximum (the cautious choice) and flags the case for a lawyer. Leave empty if only one section is charged. Never put a section here that belongs to a different, pending case.',
  },
  arrest_date: {
    type: ['string', 'null'],
    description: 'Date the person was arrested or first taken into custody in THIS case, as YYYY-MM-DD. null if the paper does not make it clear.',
  },
  first_time_accused: {
    type: ['boolean', 'null'],
    description: 'true = never convicted before. false = convicted before. null = the paper does not say. Never guess.',
  },
  first_time_quote: {
    type: ['string', 'null'],
    description: 'The exact words copied from the paper that show first_time_accused. Required whenever first_time_accused is not null; otherwise null.',
  },
  other_cases_pending: {
    type: ['boolean', 'null'],
    description: 'true = another case is pending against the person. false = none. null = the paper does not say.',
  },
  pending_quote: {
    type: ['string', 'null'],
    description: 'The exact words copied from the paper that show other_cases_pending. Required whenever other_cases_pending is not null; otherwise null.',
  },
  incident_regime: {
    type: ['string', 'null'],
    enum: ['ipc', 'bns', null],
    description: '"ipc" if the incident happened before 1 July 2024, "bns" if on or after. null if the paper does not say.',
  },
  days_on_bail: { type: 'integer', minimum: 0, description: 'Days the person was out on bail in this case. 0 if not stated.' },
  accused_delay_days: { type: 'integer', minimum: 0, description: 'Days of delay the paper attributes to the accused. 0 if not stated.' },
};

export const TOOLS = [
  {
    name: 'lookup_offence',
    description: 'Find a section in the offence table and get its maximum sentence under the BNS and the old IPC. Call this for every section charged in THIS case before using it. Do not look up sections that belong to a different, pending case.',
    input_schema: {
      type: 'object',
      properties: {
        law: { type: 'string', enum: ['IPC', 'BNS'], description: 'Which law the paper cites. Use IPC for "IPC", "भादवि", "आईपीसी"; BNS for "BNS", "बीएनएस".' },
        section: { type: 'string', description: 'The section number as written, for example "379", "420" or "303(2)".' },
      },
      required: ['law', 'section'],
    },
  },
  {
    name: 'check_section_479',
    description: 'Work out whether the person is entitled to release under Section 479 BNSS. This is the ONLY source of dates and verdicts. Pass null for anything the paper does not clearly state; the tool will say what is missing.',
    input_schema: { type: 'object', properties: { ...factProps }, required: ['arrest_date'] },
  },
  {
    name: 'draft_papers',
    description: 'Prepare the court application or the Jail Superintendent letter. Only works when check_section_479 returned ELIGIBLE for the same facts.',
    input_schema: {
      type: 'object',
      properties: {
        ...factProps,
        which: { type: 'string', enum: ['court', 'jail'] },
        language: { type: 'string', enum: ['hi', 'en'] },
      },
      required: ['arrest_date', 'which', 'language'],
    },
  },
  {
    name: 'finish',
    description: 'End the task. Give a short plain-language note for the person and list anything you could not determine. Call this exactly once, last.',
    input_schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'At most 70 words, in the reply language, plain words. Say what you found in the paper and what the tool concluded. Do not state any date that a tool did not return. No names or addresses.',
        },
        questions: {
          type: 'array',
          description: 'Facts the paper did not state that are needed. One entry per missing fact.',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', enum: ['offence', 'max_sentence', 'arrest_date', 'first_time_accused', 'other_cases_pending', 'incident_regime'] },
              question: { type: 'string', description: 'The question to ask the person, in the reply language.' },
            },
            required: ['field', 'question'],
          },
        },
      },
      required: ['summary', 'questions'],
    },
  },
];

export const TOOL_NAMES = TOOLS.map((t) => t.name);

// ---- helpers --------------------------------------------------------------------------------

const triState = (v) => (v === true ? true : v === false ? false : null);
const nonNegInt = (v) => (Number.isInteger(v) && v >= 0 ? v : 0);

function resolveOne(id) {
  const o = getOffence(String(id));
  return o ? { offence: o } : { error: `Unknown offence_id "${id}". Call lookup_offence and use an offence_id it returned.` };
}

const maxFor = (o, regime) => {
  if (o.custom) return o.maxMonths;
  return regime === 'ipc' ? o.maxMonthsIpc : o.maxMonthsBns;
};

function resolveOffence(input) {
  let primary = null;
  if (input.offence_id) {
    const r = resolveOne(input.offence_id);
    if (r.error) return r;
    primary = r.offence;
  } else if (input.custom_offence && typeof input.custom_offence === 'object') {
    const c = input.custom_offence;
    const months = Number(c.max_months);
    if (!Number.isInteger(months) || months < 1) return { error: 'custom_offence.max_months must be a whole number of months.' };
    primary = customOffence({ section: c.section, maxMonths: months, deathOrLife: !!c.death_or_life, specialLaw: !!c.special_law });
  }
  const extra = Array.isArray(input.also_charged) ? input.also_charged.filter((x) => x && x !== input.offence_id) : [];
  if (!extra.length) return { offence: primary, multiple: false };
  const all = primary ? [primary] : [];
  for (const id of extra) {
    const r = resolveOne(id);
    if (r.error) return r;
    all.push(r.offence);
  }
  const unique = [...new Map(all.map((o) => [o.id + (o.section || ''), o])).values()];
  const regime = input.incident_regime === 'ipc' ? 'ipc' : 'bns';
  // Cautious choice: any death/life section excludes the case; otherwise the longest maximum sets the threshold.
  const governing = unique.find((o) => o.deathOrLife) || unique.reduce((a, b) => (maxFor(b, regime) > maxFor(a, regime) ? b : a));
  return { offence: governing, multiple: unique.length > 1 };
}

// ---- grounding: facts the model asserts must be traceable to the paper ----------------------------

const DEVD = /[०-९]/g;
const squash = (x) => String(x || '').replace(DEVD, (c) => String(c.charCodeAt(0) - 0x0966)).toLowerCase().replace(/[\s\u00a0]+/g, ' ').trim();

function quoteInPaper(quote, paper) {
  const q = squash(quote);
  return q.length >= 6 && q.length <= 240 && squash(paper).includes(q);
}

/** Returns an error string if a stated fact cannot be traced to the paper, else null. */
function groundingError(input, paper) {
  if (typeof paper !== 'string') return null; // no paper to check against (direct tool use)
  const read = extractFromText(paper);
  if (input.arrest_date && !read.dateCandidates.includes(input.arrest_date)) {
    const seen = read.dateCandidates.length ? ` Dates the paper does contain (Indian papers write day/month/year): ${read.dateCandidates.join(', ')}.` : '';
    return `arrest_date ${input.arrest_date} is not a date written in the paper. Use a date that appears in the paper, or null.${seen}`;
  }
  if (input.first_time_accused === true || input.first_time_accused === false) {
    if (!quoteInPaper(input.first_time_quote, paper)) return 'first_time_accused needs first_time_quote: exact words from the paper that state it. If the paper does not say, pass null.';
  }
  if (input.other_cases_pending === true || input.other_cases_pending === false) {
    if (!quoteInPaper(input.pending_quote, paper)) return 'other_cases_pending needs pending_quote: exact words from the paper that state it. If the paper does not say, pass null.';
  }
  if (input.incident_regime === 'ipc' || input.incident_regime === 'bns') {
    const laws = new Set(read.sections.map((x) => x.law));
    const want = input.incident_regime === 'ipc' ? 'IPC' : 'BNS';
    if (!laws.has(want) || laws.size > 1) return `incident_regime "${input.incident_regime}" needs the paper to cite only ${want} sections. Pass null.`;
  }
  return null;
}

/** The facts exactly as the engine will see them. Also what the page copies into its form. */
export function normaliseFacts(input, today, paper) {
  const g = groundingError(input, paper);
  if (g) return { error: g };
  const r = resolveOffence(input);
  if (r.error) return { error: r.error };
  const date = input.arrest_date;
  if (date != null && !(typeof date === 'string' && ISO.test(date))) {
    return { error: 'arrest_date must be YYYY-MM-DD or null.' };
  }
  const regime = input.incident_regime === 'ipc' || input.incident_regime === 'bns' ? input.incident_regime : null;
  return {
    offence: r.offence,
    engine: {
      offence: r.offence,
      arrestDate: date || null,
      asOf: today,
      firstTime: triState(input.first_time_accused),
      otherCasesPending: triState(input.other_cases_pending),
      regime,
      daysOnBail: nonNegInt(input.days_on_bail),
      accusedDelayDays: nonNegInt(input.accused_delay_days),
      multipleOffences: r.multiple === true,
    },
  };
}

export function compactResult(r) {
  const out = {
    verdict: r.verdict,
    missing: r.missing || [],
    reason: r.reason || null,
    needs_lawyer: !!r.needsLawyer,
    flags: r.flags || [],
  };
  if (r.eligibleOn) {
    out.eligible_on = r.eligibleOn;
    out.fraction = r.fraction;
    out.threshold_days = r.thresholdDays;
    out.custody_days = r.custodyDays;
    out.days_overdue = r.daysOverdue;
    out.days_remaining = r.daysRemaining;
    out.max_term_ends_on = r.maxEndsOn;
  }
  if (r.verdict === 'NEEDS_INFO' && r.scenarios) {
    out.if_first_time = { eligible_on: r.scenarios.firstTime.eligibleOn };
    out.if_convicted_before = { eligible_on: r.scenarios.otherwise.eligibleOn };
  }
  return out;
}

// ---- execution ------------------------------------------------------------------------------

/**
 * Run one tool call. `ctx` collects everything the page needs (assessments, drafts, the final note);
 * what is returned is only what the model gets to see.
 */
export function executeTool(name, input, ctx) {
  const args = input && typeof input === 'object' ? input : {};

  if (name === 'lookup_offence') {
    const law = args.law === 'BNS' ? 'BNS' : 'IPC';
    const section = String(args.section || '').trim();
    if (!section) return { isError: true, content: { error: 'section is required' } };
    const ids = matchOffences(law, section);
    const matches = ids.map((id) => {
      const o = getOffence(id);
      return {
        offence_id: o.id,
        name: o.names.en,
        bns: o.bns,
        ipc: o.ipc,
        max_months_bns: o.maxMonthsBns ?? null,
        max_months_ipc: o.maxMonthsIpc ?? null,
        max_differs_between_laws: needsRegime(o),
        death_or_life: !!o.deathOrLife,
      };
    });
    ctx.lookups.push({ law, section, matches: matches.map((m) => m.offence_id) });
    if (!matches.length) {
      return {
        content: {
          matches: [],
          in_table: false,
          note: 'Not in the starter table. Do not guess its maximum sentence. If the paper itself states the maximum, use custom_offence; otherwise ask.',
        },
      };
    }
    return { content: { matches, in_table: true, ambiguous: matches.length > 1 } };
  }

  if (name === 'check_section_479' || name === 'draft_papers') {
    const f = normaliseFacts(args, ctx.today, ctx.paper);
    if (f.error) return { isError: true, content: { error: f.error } };
    const result = assess(f.engine);

    if (name === 'check_section_479') {
      const evidence = {
        firstTime: args.first_time_accused === null || args.first_time_accused === undefined ? null : String(args.first_time_quote || '').slice(0, 240),
        pending: args.other_cases_pending === null || args.other_cases_pending === undefined ? null : String(args.pending_quote || '').slice(0, 240),
      };
      ctx.assessments.push({ facts: f.engine, result, evidence });
      return { content: compactResult(result) };
    }

    if (result.verdict !== 'ELIGIBLE') {
      return { isError: true, content: { error: `Cannot draft: verdict is ${result.verdict}. Drafts exist only when the verdict is ELIGIBLE.` } };
    }
    const lang = args.language === 'en' ? 'en' : 'hi';
    const build = args.which === 'jail' ? buildSuperintendentLetter : buildApplication;
    const doc = build({ lang, result, offence: f.offence, input: f.engine, details: {} });
    ctx.drafts.push({ which: args.which === 'jail' ? 'jail' : 'court', lang, title: doc.title, text: toPlainText(doc) });
    return { content: { ok: true, title: doc.title, note: 'Draft prepared with visible placeholders for facts the paper did not give.' } };
  }

  if (name === 'finish') {
    // Two gates, each used at most once, so a stubborn model can still end the run.
    // They stop a small model from skipping the steps that matter; they never decide anything themselves.
    ctx.gates = ctx.gates || {};
    const resolved = (ctx.lookups || []).some((l) => l.matches.length === 1);
    if (!ctx.gates.check && resolved && !(ctx.assessments || []).length) {
      ctx.gates.check = true;
      return {
        isError: true,
        content: { error: 'Not finished: you have not called check_section_479. Call it now with what the paper states and null for anything it does not state. The tool will say what is missing. Then call finish.' },
      };
    }
    const lastAssessment = (ctx.assessments || [])[(ctx.assessments || []).length - 1];
    if (!ctx.gates.draft && lastAssessment && lastAssessment.result.verdict === 'ELIGIBLE' && !(ctx.drafts || []).length) {
      ctx.gates.draft = true;
      return {
        isError: true,
        content: { error: 'Not finished: the verdict is ELIGIBLE, so call draft_papers with which="court" first (same facts as check_section_479). Then call finish.' },
      };
    }
    const questions = Array.isArray(args.questions)
      ? args.questions.filter((q) => q && typeof q.question === 'string').slice(0, 6).map((q) => ({ field: String(q.field || ''), question: q.question.slice(0, 240) }))
      : [];
    ctx.finished = { summary: String(args.summary || '').slice(0, 900), questions };
    return { content: { ok: true } };
  }

  return { isError: true, content: { error: `Unknown tool "${name}".` } };
}

/** Facts in the shape the page's form understands. */
export function serialiseFacts(f) {
  const o = f.offence;
  return {
    offenceId: o && !o.custom ? o.id : null,
    custom: o && o.custom ? { section: o.section, maxMonths: o.maxMonths, deathOrLife: !!o.deathOrLife, specialLaw: !!o.specialLaw } : null,
    arrestDate: f.arrestDate,
    firstTime: f.firstTime,
    otherCasesPending: f.otherCasesPending,
    regime: f.regime,
    daysOnBail: f.daysOnBail,
    accusedDelayDays: f.accusedDelayDays,
    multipleOffences: !!f.multipleOffences,
  };
}

export { OFFENCES };
