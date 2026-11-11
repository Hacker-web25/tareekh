// A starter table of offences with their statutory MAXIMUM imprisonment, in months.
//
// How to read this file
//  - Section 479 BNSS works off "the maximum period of imprisonment specified for that offence".
//  - Where the BNS (in force from 1 July 2024) and the old IPC differ, both maxima are kept,
//    because for an offence committed before 1 July 2024 the lower, older maximum applies
//    (Article 20(1) of the Constitution). The app asks "when did it happen?" only for those entries.
//  - Every row below was checked against at least two published tables (law-firm notes on the BNS,
//    government/e-courts material and bare-act tables). The table has NOT yet been reviewed by a
//    practising advocate: `REVIEW_STATUS` is shown in the interface until that happens.
//  - Anything not in this table can be entered by hand (section label + maximum term).

export const REVIEW_STATUS = { advocateReviewed: false, lastChecked: '2026-11-10' };

export const OFFENCES = [
  {
    id: 'theft', group: 'property', bns: '303(2)', ipc: '379',
    maxMonthsBns: 36, maxMonthsIpc: 36,
    // On a second or later conviction the BNS maximum for theft rises to 5 years.
    repeatMaxMonths: 60,
    names: { hl: 'Chori', hi: 'चोरी', en: 'Theft' },
    aliases: 'chori theft steal 379 303',
  },
  {
    id: 'theft_dwelling', group: 'property', bns: '305', ipc: '380',
    maxMonthsBns: 84, maxMonthsIpc: 84,
    names: { hl: 'Ghar mein chori', hi: 'घर में चोरी', en: 'Theft in a dwelling house' },
    aliases: 'chori ghar dwelling 380 305 house theft',
  },
  {
    id: 'hurt', group: 'body', bns: '115(2)', ipc: '323',
    maxMonthsBns: 12, maxMonthsIpc: 12,
    names: { hl: 'Jaan-boojhkar chot pahunchana', hi: 'जानबूझकर चोट पहुँचाना', en: 'Voluntarily causing hurt' },
    aliases: 'maarpeet marpit hurt assault chot 323 115',
  },
  {
    id: 'intimidation', group: 'body', bns: '351(2)', ipc: '506 (part I)',
    maxMonthsBns: 24, maxMonthsIpc: 24,
    names: { hl: 'Dhamki dena (saadharan)', hi: 'धमकी देना (साधारण)', en: 'Criminal intimidation (simple)' },
    aliases: 'dhamki threat intimidation 506 351',
  },
  {
    id: 'intimidation_grave', group: 'body', bns: '351(3)', ipc: '506 (part II)',
    maxMonthsBns: 84, maxMonthsIpc: 84,
    names: { hl: 'Maut ya gambhir chot ki dhamki', hi: 'मौत या गंभीर चोट की धमकी', en: 'Criminal intimidation (threat of death or grievous hurt)' },
    aliases: 'dhamki threat death grievous 506 351',
  },
  {
    id: 'modesty', group: 'body', bns: '74', ipc: '354',
    maxMonthsBns: 60, maxMonthsIpc: 60,
    names: { hl: 'Mahila ki garima bhang karne ke iraade se hamla', hi: 'महिला की गरिमा भंग करने के इरादे से हमला', en: 'Assault to outrage a woman’s modesty' },
    aliases: 'chhedchhad modesty molestation 354 74',
  },
  {
    id: 'rioting', group: 'body', bns: '191(2)', ipc: '147',
    maxMonthsBns: 24, maxMonthsIpc: 24,
    names: { hl: 'Danga (rioting)', hi: 'दंगा', en: 'Rioting' },
    aliases: 'danga riot rioting 147 191',
  },
  {
    id: 'house_trespass_hurt', group: 'property', bns: '333', ipc: '452',
    maxMonthsBns: 84, maxMonthsIpc: 84,
    names: { hl: 'Chot ki taiyari ke saath ghar mein ghusna', hi: 'चोट की तैयारी के साथ घर में घुसना', en: 'House-trespass after preparation for hurt' },
    aliases: 'trespass ghusna ghar 452 333',
  },
  {
    id: 'cheating', group: 'property', bns: '318(2)', ipc: '417',
    maxMonthsBns: 36, maxMonthsIpc: 12,
    names: { hl: 'Dhokhadhadi', hi: 'धोखाधड़ी', en: 'Cheating' },
    aliases: 'dhokhadhadi cheating fraud 417 318',
  },
  {
    id: 'cheating_delivery', group: 'property', bns: '318(4)', ipc: '420',
    maxMonthsBns: 84, maxMonthsIpc: 84,
    names: { hl: 'Dhokhadhadi se sampatti haasil karna (420)', hi: 'धोखाधड़ी से संपत्ति हासिल करना (420)', en: 'Cheating and dishonestly inducing delivery of property (420)' },
    aliases: 'dhokhadhadi cheating fraud 420 318',
  },
  {
    id: 'cbt', group: 'property', bns: '316(2)', ipc: '406',
    maxMonthsBns: 60, maxMonthsIpc: 36,
    names: { hl: 'Aapraadhik vishwasghaat', hi: 'आपराधिक विश्वासघात', en: 'Criminal breach of trust' },
    aliases: 'vishwasghaat breach trust cbt 406 316',
  },
  {
    id: 'forgery_cheating', group: 'property', bns: '336(3)', ipc: '468',
    maxMonthsBns: 84, maxMonthsIpc: 84,
    names: { hl: 'Dhokhe ke liye jaali dastavez', hi: 'धोखे के लिए जाली दस्तावेज़', en: 'Forgery for the purpose of cheating' },
    aliases: 'jaali forgery dastavez fake 468 336',
  },
  // ---- Offences where life imprisonment or death is a possible punishment ----
  // Section 479(1) does not apply to these. They are listed so the app can say so plainly.
  {
    id: 'murder', group: 'excluded', bns: '103', ipc: '302', deathOrLife: true,
    names: { hl: 'Hatya', hi: 'हत्या', en: 'Murder' },
    aliases: 'hatya murder 302 103',
  },
  {
    id: 'rape', group: 'excluded', bns: '64', ipc: '376', deathOrLife: true,
    names: { hl: 'Balaatkaar', hi: 'बलात्कार', en: 'Rape' },
    aliases: 'balatkar rape 376 64',
  },
  {
    id: 'ransom_kidnap', group: 'excluded', bns: '140(2)', ipc: '364A', deathOrLife: true,
    names: { hl: 'Fidiya ke liye apharan', hi: 'फिरौती के लिए अपहरण', en: 'Kidnapping for ransom' },
    aliases: 'apharan kidnap ransom fidiya 364a 140',
  },
];

export const GROUP_ORDER = ['property', 'body', 'excluded'];

export function getOffence(id) {
  return OFFENCES.find((o) => o.id === id) || null;
}

/** True if the BNS and IPC maxima differ, so the date of the offence matters. */
export function needsRegime(offence) {
  return !offence.deathOrLife && offence.maxMonthsBns !== offence.maxMonthsIpc;
}

/** Build an offence record for a section the table does not know (entered by hand). */
export function customOffence({ section, maxMonths, deathOrLife = false, specialLaw = false }) {
  return {
    id: 'custom', group: 'custom', custom: true, section: String(section || '').trim(),
    maxMonths: Number(maxMonths) || 0, deathOrLife: !!deathOrLife, specialLaw: !!specialLaw,
  };
}
