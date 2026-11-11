// Drafts for the two documents Section 479 turns on:
//   1. the application to the Court for release, and
//   2. the letter asking the Jail Superintendent to do what S.479(3) already requires.
// Everything is filled from the engine's result. Any fact the engine does not know stays as a
// visible [bracketed placeholder], never as an invented value.
// The drafts are starting points for a lawyer or legal-aid volunteer; they are not legal advice.

import { formatDate, termText } from './format.js';

const L = {
  en: {
    ph: { court: 'Name of the Court and place', caseNo: 'Case / FIR No.', ps: 'Police Station', name: 'Name of the accused', father: 'Father’s name', jail: 'Name of the jail', place: 'Place', sender: 'Name and designation of sender' },
    first: 'one-third', half: 'one-half',
    bond: 'on his personal bond', bail: 'on bail',
    bondWord: 'bond', bailWord: 'bail',
  },
  hi: {
    ph: { court: 'न्यायालय का नाम और स्थान', caseNo: 'प्रकरण / एफ़आईआर क्र.', ps: 'थाना', name: 'अभियुक्त का नाम', father: 'पिता का नाम', jail: 'जेल का नाम', place: 'स्थान', sender: 'भेजने वाले का नाम और पद' },
    first: 'एक-तिहाई', half: 'आधी',
    bond: 'निजी बंधपत्र पर', bail: 'ज़मानत पर',
  },
};

const blank = (given) => (given && String(given).trim() ? String(given).trim() : '[__________]');
const ph = (lang, key, given) => (given && String(given).trim() ? String(given).trim() : `[${L[lang].ph[key]}]`);

export function offenceText(offence, lang = 'en') {
  if (!offence) return '';
  if (offence.custom) return offence.section;
  const name = lang === 'hi' ? offence.names.hi : offence.names.en;
  return `${name} (BNS ${offence.bns} / IPC ${offence.ipc})`;
}

function thresholdText(result, lang) {
  const m = result.thresholdMonths;
  return Number.isInteger(m) ? termText(m, lang) : `${result.thresholdDays} ${lang === 'hi' ? 'दिन' : 'days'}`;
}

function usableResult(result) {
  if (!result || result.verdict !== 'ELIGIBLE') {
    throw new Error('A court application can be drafted only when the verdict is ELIGIBLE.');
  }
}

/**
 * @returns {{ title: string, blocks: {type: 'line'|'heading'|'para'|'numbered'|'prayer'|'sign'|'note', text: string}[] }}
 */
export function buildApplication({ lang = 'en', result, offence, input, details = {} }) {
  usableResult(result);
  const hi = lang === 'hi';
  const fd = (iso) => formatDate(iso, lang);
  const label = offenceText(offence, lang);
  const fraction = result.fraction === '1/3' ? L[lang].first : L[lang].half;
  const out = [];
  const add = (type, text) => out.push({ type, text });
  const firstTime = result.firstTime === true;
  const maxTerm = termText(result.maxMonths, lang);
  const thr = thresholdText(result, lang);
  const bailDays = input.daysOnBail || 0;
  const delayDays = input.accusedDelayDays || 0;

  add('line', hi
    ? `माननीय ${ph(lang, 'court', details.court)}`
    : `IN THE COURT OF ${ph(lang, 'court', details.court)}`);
  add('line', hi
    ? `${L.hi.ph.caseNo}: ${blank(details.caseNo)}      ${L.hi.ph.ps}: ${blank(details.ps)}`
    : `${L.en.ph.caseNo}: ${blank(details.caseNo)}      ${L.en.ph.ps}: ${blank(details.ps)}`);
  add('line', hi
    ? `राज्य बनाम ${ph(lang, 'name', details.name)}`
    : `State v. ${ph(lang, 'name', details.name)}`);
  add('heading', hi
    ? 'भारतीय नागरिक सुरक्षा संहिता, 2023 की धारा 479 के अंतर्गत विचाराधीन बंदी की रिहाई हेतु आवेदन'
    : 'APPLICATION UNDER SECTION 479 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 FOR RELEASE OF AN UNDERTRIAL PRISONER');
  add('para', hi ? 'सविनय निवेदन है कि:' : 'Most respectfully showeth:');

  add('numbered', hi
    ? `यह कि आवेदक उपर्युक्त प्रकरण में ${label} के आरोप में विचाराधीन बंदी के रूप में ${ph(lang, 'jail', details.jail)} में निरुद्ध है।`
    : `That the applicant is an undertrial prisoner lodged in ${ph(lang, 'jail', details.jail)} in connection with the above case, in which he is charged with ${label}.`);

  const bailPart = bailDays
    ? (hi ? ` (बीच के ${bailDays} दिन वह ज़मानत पर रहा; उन्हें गणना में शामिल नहीं किया गया है)` : ` (he was on bail for ${bailDays} days in between; those days are not counted)`)
    : '';
  add('numbered', hi
    ? `यह कि आवेदक को दिनांक ${fd(input.arrestDate)} को गिरफ़्तार किया गया और तब से वह निरुद्ध है${bailPart}। दिनांक ${fd(input.asOf)} तक उसकी निरोध अवधि ${result.counted} दिन बैठती है।`
    : `That the applicant was arrested on ${fd(input.arrestDate)} and has been in detention since${bailPart}. As on ${fd(input.asOf)}, the period of detention to be counted is ${result.counted} days.`);

  add('numbered', hi
    ? `यह कि उक्त अपराध के लिए विधि में अधिकतम ${maxTerm} के कारावास का दंड निर्धारित है। उक्त अपराध मृत्युदंड या आजीवन कारावास से दंडनीय नहीं है।`
    : `That the maximum punishment provided by law for the said offence is imprisonment for ${maxTerm}. The offence is not punishable with death or life imprisonment.`);

  add('numbered', firstTime
    ? (hi
      ? `यह कि आवेदक प्रथम बार का अभियुक्त है और अतीत में उसे कभी किसी अपराध में दोषसिद्ध नहीं किया गया। अतः धारा 479(1) के प्रथम परंतुक के अनुसार अधिकतम कारावास की ${fraction} अवधि, अर्थात् ${thr}, पूर्ण होने पर वह निजी बंधपत्र पर रिहा किए जाने का अधिकारी है। यह अवधि दिनांक ${fd(result.eligibleOn)} को पूर्ण हो चुकी है।`
      : `That the applicant is a first-time offender who has never been convicted of any offence in the past. Under the first proviso to Section 479(1), he is entitled to be released on bond on completing ${fraction} of the maximum period of imprisonment, that is ${thr}. That period was completed on ${fd(result.eligibleOn)}.`)
    : (hi
      ? `यह कि धारा 479(1) के अनुसार अधिकतम कारावास की ${fraction} अवधि, अर्थात् ${thr}, पूर्ण होने पर आवेदक जमानत पर रिहा किए जाने का अधिकारी है। यह अवधि दिनांक ${fd(result.eligibleOn)} को पूर्ण हो चुकी है।`
      : `That under Section 479(1), the applicant is entitled to be released on bail on completing ${fraction} of the maximum period of imprisonment, that is ${thr}. That period was completed on ${fd(result.eligibleOn)}.`));

  add('numbered', delayDays
    ? (hi
      ? `यह कि स्पष्टीकरण के अनुसार अभियुक्त के कारण हुई देरी के ${delayDays} दिन गणना से अलग रखे गए हैं; इसके बावजूद निर्धारित अवधि पूर्ण हो चुकी है।`
      : `That, as the Explanation to Section 479 requires, ${delayDays} days of delay attributable to the applicant have been excluded; the required period is complete even after that exclusion.`)
    : (hi
      ? 'यह कि कार्यवाही में हुई किसी देरी के लिए आवेदक उत्तरदायी नहीं है।'
      : 'That no delay in the proceedings has been caused by the applicant.'));

  const pending = input.otherCasesPending;
  add('numbered', pending === false
    ? (hi ? 'यह कि आवेदक के विरुद्ध इसके अतिरिक्त कोई अन्य अपराध या प्रकरण विचाराधीन नहीं है, अतः धारा 479(2) बाधक नहीं है।'
          : 'That no other offence or case is pending against the applicant, so Section 479(2) does not stand in the way.')
    : pending === true
      ? (hi ? 'यह कि आवेदक के विरुद्ध अन्य प्रकरण भी लंबित हैं। [धारा 479(2) की व्याख्या पर विधिक तर्क अधिवक्ता द्वारा जोड़ा जाए।]'
            : 'That other cases are also pending against the applicant. [Counsel to add the legal submission on the reading of Section 479(2).]')
      : (hi ? 'यह कि [जेल रिकॉर्ड से पुष्टि करें कि आवेदक के विरुद्ध कोई अन्य प्रकरण लंबित नहीं है; तभी यह कथन रखें]।'
            : 'That [confirm from jail records that no other case is pending against the applicant, then keep this statement].'));

  add('numbered', hi
    ? 'यह कि धारा 479 बीएनएसएस 1 जुलाई 2024 को लंबित कार्यवाहियों पर भी लागू होती है, जैसा कि माननीय सर्वोच्च न्यायालय ने स्पष्ट किया है। [अधिवक्ता द्वारा निर्णय का उद्धरण जोड़ा जाए।]'
    : 'That Section 479 BNSS applies also to proceedings pending on 1 July 2024, as clarified by the Hon’ble Supreme Court. [Counsel to add the citation of the judgment.]');

  add('numbered', hi
    ? 'यह कि धारा 479(3) के अनुसार निर्धारित अवधि पूर्ण होने पर जेल अधीक्षक का कर्तव्य है कि वे तुरंत न्यायालय को लिखित आवेदन करें। इस आवेदन की एक प्रति जेल अधीक्षक को भी भेजी जा रही है।'
    : 'That under Section 479(3), on completion of the period the Superintendent of Jail is bound to apply to the Court in writing forthwith. A copy of this application is being sent to the Superintendent of Jail.');

  add('heading', hi ? 'प्रार्थना' : 'PRAYER');
  add('prayer', hi
    ? `अतः श्रीमान् से विनम्र प्रार्थना है कि आवेदक को ${firstTime ? L.hi.bond : L.hi.bail} रिहा करने का आदेश दें तथा जो अन्य आदेश उचित समझें, पारित करें।`
    : `It is therefore most respectfully prayed that this Hon’ble Court may be pleased to release the applicant ${firstTime ? L.en.bond : L.en.bail} and pass such other order as it deems fit.`);
  add('sign', hi
    ? `${L.hi.ph.place}: ${ph(lang, 'place', details.place)}      दिनांक: ${fd(input.asOf)}\nआवेदक / उसके अधिवक्ता द्वारा: [हस्ताक्षर]`
    : `${L.en.ph.place}: ${ph(lang, 'place', details.place)}      Date: ${fd(input.asOf)}\nApplicant / through counsel: [signature]`);
  add('note', hi
    ? 'मसौदा: गणना Tareekh ने की है। दाखिल करने से पहले अधिवक्ता से जाँच अवश्य करवाएँ। यह कानूनी सलाह नहीं है।'
    : 'Draft: the calculation was made by Tareekh. Have an advocate check it before filing. This is not legal advice.');

  return { title: hi ? 'न्यायालय में आवेदन' : 'Application to the Court', blocks: out };
}

export function buildSuperintendentLetter({ lang = 'en', result, offence, input, details = {} }) {
  usableResult(result);
  const hi = lang === 'hi';
  const fd = (iso) => formatDate(iso, lang);
  const label = offenceText(offence, lang);
  const fraction = result.fraction === '1/3' ? L[lang].first : L[lang].half;
  const out = [];
  const add = (type, text) => out.push({ type, text });
  const name = ph(lang, 'name', details.name);

  add('line', hi ? 'सेवा में,' : 'To,');
  add('line', hi ? `जेल अधीक्षक, ${ph(lang, 'jail', details.jail)}` : `The Superintendent, ${ph(lang, 'jail', details.jail)}`);
  add('heading', hi
    ? `विषय: विचाराधीन बंदी ${name} के संबंध में धारा 479(3) बीएनएसएस, 2023 के अंतर्गत न्यायालय में आवेदन प्रस्तुत करने का अनुरोध`
    : `Subject: Request to move the Court under Section 479(3) BNSS, 2023 in respect of undertrial prisoner ${name}`);
  add('para', hi ? 'महोदय/महोदया,' : 'Sir / Madam,');
  add('numbered', hi
    ? `उपर्युक्त बंदी आपके कारागार में प्रकरण ${ph(lang, 'caseNo', details.caseNo)} में ${label} के आरोप में विचाराधीन है।`
    : `The above-named undertrial is lodged in your jail in case ${ph(lang, 'caseNo', details.caseNo)}, charged with ${label}.`);
  add('numbered', hi
    ? `मेरी गणना के अनुसार उसे दिनांक ${fd(input.arrestDate)} को गिरफ़्तार किया गया था। उक्त अपराध में अधिकतम कारावास ${termText(result.maxMonths, lang)} है। अधिकतम अवधि की ${fraction} अवधि दिनांक ${fd(result.eligibleOn)} को पूर्ण हो चुकी है (${fd(input.asOf)} तक ${result.daysOverdue} दिन अधिक)।`
    : `On my calculation he was arrested on ${fd(input.arrestDate)}. The maximum imprisonment for the offence is ${termText(result.maxMonths, lang)}. ${fraction[0].toUpperCase() + fraction.slice(1)} of the maximum period was completed on ${fd(result.eligibleOn)} (${result.daysOverdue} days ago as on ${fd(input.asOf)}).`);
  add('numbered', hi
    ? 'धारा 479(3) के अनुसार, एक-तिहाई या आधी अवधि पूर्ण होने पर कारागार अधीक्षक को तुरंत न्यायालय में, धारा 479(1) के अंतर्गत बंदी की रिहाई हेतु, लिखित आवेदन करना होता है।'
    : 'Section 479(3) requires the Superintendent of Jail, on completion of one-half or one-third of the period, to make an application in writing to the Court forthwith, to proceed under sub-section (1) for the release of the person on bail.');
  add('numbered', hi
    ? 'अनुरोध है कि कृपया जेल रिकॉर्ड से निरोध अवधि का सत्यापन करें, न्यायालय में आवेदन प्रस्तुत करें और आवेदन की तारीख़ से बंदी/उसके परिवार को अवगत कराएँ।'
    : 'You are requested to verify the period of detention from the jail records, move the Court accordingly, and inform the prisoner or his family of the date of filing.');
  add('sign', hi
    ? `भवदीय,\n${ph(lang, 'sender', details.sender)}\nदिनांक: ${fd(input.asOf)}`
    : `Yours faithfully,\n${ph(lang, 'sender', details.sender)}\nDate: ${fd(input.asOf)}`);
  add('note', hi
    ? 'मसौदा: गणना Tareekh ने की है। यह कानूनी सलाह नहीं है।'
    : 'Draft: the calculation was made by Tareekh. This is not legal advice.');
  return { title: hi ? 'जेल अधीक्षक को पत्र' : 'Letter to the Jail Superintendent', blocks: out };
}

/** Plain text for copy, WhatsApp and print. */
export function toPlainText(doc) {
  let n = 0;
  return doc.blocks
    .map((b) => {
      if (b.type === 'numbered') { n += 1; return `${n}. ${b.text}`; }
      if (b.type === 'heading') return `\n${b.text}\n`;
      return b.text;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
