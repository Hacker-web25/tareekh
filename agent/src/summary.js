// Plain-language text that is built only from tool results (never from model output), and a guard that
// decides whether a model-written note may be shown. The model's wording is never trusted for dates.

import { formatDate } from '../../engine/format.js';

const fd = (iso, lang) => formatDate(iso, lang === 'hi' ? 'hi' : 'en');

const QUESTIONS = {
  offence: {
    hl: 'Kagaz mein kaun si dhara (IPC ya BNS) lagi hai?',
    hi: 'काग़ज़ में कौन सी धारा (IPC या BNS) लगी है?',
    en: 'Which section (IPC or BNS) is charged in the paper?',
  },
  max_sentence: {
    hl: 'Is dhara ki adhikatam sazaa kitni hai? (kagaz mein likhi ho to)',
    hi: 'इस धारा की अधिकतम सज़ा कितनी है? (काग़ज़ में लिखी हो तो)',
    en: 'What is the maximum sentence for this section? (if the paper states it)',
  },
  arrest_date: {
    hl: 'Giraftari ya hirasat ki tareekh kya hai?',
    hi: 'गिरफ़्तारी या हिरासत की तारीख़ क्या है?',
    en: 'What is the date of arrest or first custody?',
  },
  first_time_accused: {
    hl: 'Kya inhe pehle kabhi kisi mamle mein doshi theheraya gaya hai?',
    hi: 'क्या इन्हें पहले कभी किसी केस में दोषी ठहराया गया है?',
    en: 'Has the person ever been convicted before?',
  },
  other_cases_pending: {
    hl: 'Kya inke khilaaf koi aur case pending hai?',
    hi: 'क्या इनके ख़िलाफ़ कोई और केस लंबित है?',
    en: 'Is any other case pending against the person?',
  },
  incident_regime: {
    hl: 'Ghatna 1 July 2024 se pehle hui ya baad mein?',
    hi: 'घटना 1 जुलाई 2024 से पहले हुई या बाद में?',
    en: 'Did the incident happen before or after 1 July 2024?',
  },
};

export function questionFor(field, lang) {
  const q = QUESTIONS[field];
  return q ? q[lang] || q.hl : '';
}

export const FIELD_OF_MISSING = {
  arrestDate: 'arrest_date',
  offence: 'offence',
  firstTime: 'first_time_accused',
  regime: 'incident_regime',
};

/** Questions implied by a tool result, in the reply language. */
export function questionsFromVerdict(verdict, lang) {
  if (!verdict) return [];
  const out = [];
  for (const m of verdict.missing || []) {
    const field = FIELD_OF_MISSING[m];
    if (field) out.push({ field, question: questionFor(field, lang) });
  }
  if ((verdict.flags || []).includes('VERIFY_PENDING_CASES')) {
    out.push({ field: 'other_cases_pending', question: questionFor('other_cases_pending', lang) });
  }
  return out;
}

export function templateSummary({ lang = 'hl', verdict }) {
  const L = lang === 'hi' ? 'hi' : lang === 'en' ? 'en' : 'hl';
  const pick = (o) => o[L];
  if (!verdict) {
    return pick({
      hl: 'Kagaz se zaroori jaankari nahi mili. Neeche ke sawaalon ka jawaab dein.',
      hi: 'काग़ज़ से ज़रूरी जानकारी नहीं मिली। नीचे के सवालों का जवाब दें।',
      en: 'The paper did not give the facts needed. Please answer the questions below.',
    });
  }
  switch (verdict.verdict) {
    case 'ELIGIBLE': {
      const d = fd(verdict.eligible_on, L);
      const n = verdict.days_overdue;
      return pick({
        hl: `Hisaab ke hisaab se rihaai ka haq ${d} se ban chuka hai${n > 0 ? ` (${n} din pehle)` : ''}.`,
        hi: `हिसाब के हिसाब से रिहाई का हक़ ${d} से बन चुका है${n > 0 ? ` (${n} दिन पहले)` : ''}।`,
        en: `By the count, the entitlement began on ${d}${n > 0 ? ` (${n} days ago)` : ''}.`,
      });
    }
    case 'NOT_YET': {
      const d = fd(verdict.eligible_on, L);
      const n = verdict.days_remaining;
      return pick({
        hl: `Abhi nahi. Haq ${d} ko banega, ${n} din baaki.`,
        hi: `अभी नहीं। हक़ ${d} को बनेगा, ${n} दिन बाकी।`,
        en: `Not yet. The entitlement begins on ${d}, ${n} days to go.`,
      });
    }
    case 'NEEDS_INFO': {
      if (verdict.if_first_time && verdict.if_first_time.eligible_on) {
        const a = fd(verdict.if_first_time.eligible_on, L);
        const b = fd(verdict.if_convicted_before.eligible_on, L);
        return pick({
          hl: `Ek sawaal ka jawaab chahiye. Pehli baar ka aaropi ho to ${a}, pehle doshi rahe hon to ${b}.`,
          hi: `एक सवाल का जवाब चाहिए। पहली बार का आरोपी हो तो ${a}, पहले दोषी रहे हों तो ${b}।`,
          en: `One answer is needed. If this is a first offence: ${a}. If convicted before: ${b}.`,
        });
      }
      return pick({
        hl: 'Kagaz se poori jaankari nahi mili. Neeche ke sawaalon ka jawaab dein.',
        hi: 'काग़ज़ से पूरी जानकारी नहीं मिली। नीचे के सवालों का जवाब दें।',
        en: 'The paper did not give everything needed. Please answer the questions below.',
      });
    }
    case 'EXCLUDED':
      return pick({
        hl: 'Yeh maut ya umrakaid wali dhara hai, isliye Dhara 479 yahan lagu nahi hoti.',
        hi: 'यह मौत या उम्रक़ैद वाली धारा है, इसलिए धारा 479 यहाँ लागू नहीं होती।',
        en: 'This section can carry death or life imprisonment, so Section 479 does not apply here.',
      });
    default:
      return pick({
        hl: 'Di gayi tareekh sahi nahi lagti. Kagaz dobara dekhein.',
        hi: 'दी गई तारीख़ सही नहीं लगती। काग़ज़ दोबारा देखें।',
        en: 'A date looks wrong. Please check the paper again.',
      });
  }
}

// ---- guard ----------------------------------------------------------------------------------

const DEV = /[०-९]/g;
const asciiDigits = (s) => s.replace(DEV, (c) => String(c.charCodeAt(0) - 0x0966));
const MONTH_IDX = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  'जनवरी': 1, 'फरवरी': 2, 'फ़रवरी': 2, 'मार्च': 3, 'अप्रैल': 4, 'मई': 5, 'जून': 6, 'जुलाई': 7,
  'अगस्त': 8, 'सितंबर': 9, 'सितम्बर': 9, 'अक्टूबर': 10, 'नवंबर': 11, 'दिसंबर': 12,
};
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// Words that talk about entitlement or release. Only an ELIGIBLE verdict lets a model-written note use them;
// for every other verdict the note is rebuilt from the tool result, so it cannot overstate.
const SPEAKS_OF_ENTITLEMENT = /\b(eligible|eligibility|entitled|entitlement|release[ds]?|bail|bond|free)\b|रिहाई|रिहा\b|हक़?|ज़मानत|जमानत|\bhaq\b|rihaai|\briha\b|zamaanat|zamanat/i;

/** Dates the model is allowed to mention: those a tool returned, plus the date the BNSS took effect. */
export function allowedDates(ctx) {
  const set = new Set(['2024-07-01', ctx.today]);
  for (const a of ctx.assessments) {
    const r = a.result;
    if (a.facts.arrestDate) set.add(a.facts.arrestDate);
    for (const k of ['eligibleOn', 'maxEndsOn']) if (r[k]) set.add(r[k]);
    if (r.scenarios) for (const s of Object.values(r.scenarios)) { if (s.eligibleOn) set.add(s.eligibleOn); if (s.maxEndsOn) set.add(s.maxEndsOn); }
  }
  return set;
}

/** True only if the note contains no date, year or entitlement claim that the tools did not produce. */
export function summaryIsSafe(summary, ctx, verdict) {
  const text = asciiDigits(String(summary || ''));
  if (!text.trim()) return false;
  const allowed = allowedDates(ctx);
  const years = new Set([...allowed].map((d) => d.slice(0, 4)));
  let m;
  const numeric = /(\d{1,2})\s*[/.\-]\s*(\d{1,2})\s*[/.\-]\s*(\d{4})/g;
  while ((m = numeric.exec(text))) if (!allowed.has(iso(m[3], +m[2], +m[1]))) return false;
  const isoRe = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((m = isoRe.exec(text))) if (!allowed.has(m[0])) return false;
  const textual = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-zऀ-ॿ]+)\.?,?\s+(\d{4})/g;
  while ((m = textual.exec(text))) {
    const mon = MONTH_IDX[m[2].toLowerCase().slice(0, 3)] || MONTH_IDX[m[2]];
    if (mon && !allowed.has(iso(m[3], mon, +m[1]))) return false;
  }
  const bareYear = /\b(?:19|20)\d{2}\b/g;
  while ((m = bareYear.exec(text))) if (!years.has(m[0])) return false;
  if ((!verdict || verdict.verdict !== 'ELIGIBLE') && SPEAKS_OF_ENTITLEMENT.test(text)) return false;
  return true;
}
