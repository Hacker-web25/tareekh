// All words the interface shows, in three languages.
//   hl = Hinglish (Hindi in Roman script, with English words where people really use them)  [default]
//   hi = हिन्दी (Devanagari)
//   en = English
// Placeholders look like {n}. Strings that contain markup are rendered only where marked data-i18n-html.

export const LANGS = ['hl', 'hi', 'en'];
const HTML_LANG = { hl: 'hi-Latn', hi: 'hi', en: 'en' };

export const S = {
  // ---- page frame ------------------------------------------------------------------------
  'doc.title': { hl: 'Tareekh: undertrial rihaai saathi', hi: 'तारीख़: विचाराधीन बंदियों की रिहाई का साथी', en: 'Tareekh: a release-date companion for undertrials' },
  'doc.desc': {
    hl: 'Dhara 479 BNSS ke hisaab se kaun si tareekh par undertrial rihaai ka haqdaar ho jaata hai, ye ginta hai aur arzi taiyar karta hai.',
    hi: 'धारा 479 बीएनएसएस के हिसाब से किस तारीख़ पर विचाराधीन बंदी रिहाई का हक़दार हो जाता है, यह गिनता है और अर्ज़ी तैयार करता है।',
    en: 'Works out the date on which an undertrial becomes entitled to release under Section 479 BNSS, and prepares the application.',
  },
  'skip': { hl: 'Seedhe case jaanchne par jaayein', hi: 'सीधे केस जाँचने पर जाएँ', en: 'Skip to the case checker' },
  'brand.tag': { hl: 'Undertrial rihaai saathi', hi: 'विचाराधीन बंदियों का साथी', en: 'Release-date companion' },
  'nav.cta': { hl: 'Case jaanchein', hi: 'केस जाँचें', en: 'Check a case' },
  'lang.label': { hl: 'Bhasha', hi: 'भाषा', en: 'Language' },
  'noscript': { hl: 'Is page ko chalane ke liye JavaScript chahiye.', hi: 'इस पेज को चलाने के लिए JavaScript चाहिए।', en: 'This page needs JavaScript to run.' },

  // ---- hero -----------------------------------------------------------------------------
  'hero.h1a': {
    hl: 'Ramesh ki rihaai ki tareekh {n} din pehle aa chuki hai.',
    hi: 'रमेश की रिहाई की तारीख़ {n} दिन पहले आ चुकी है।',
    en: 'Ramesh’s release date came {n} days ago.',
  },
  'hero.h1b': { hl: 'Kisi ne ginti hi nahi ki.', hi: 'किसी ने गिनती ही नहीं की।', en: 'Nobody did the sums.' },
  'hero.p': {
    hl: 'Ramesh par chori ka aarop hai, jiski adhikatam sazaa {max} hai. Wo pehli baar ka aaropi hai. Dhara 479 BNSS ke hisaab se {thr} baad use zamaanat par chhodna tha. Abhi wo {since} se jail mein hai.',
    hi: 'रमेश पर चोरी का आरोप है, जिसकी अधिकतम सज़ा {max} है। वह पहली बार का आरोपी है। धारा 479 बीएनएसएस के हिसाब से {thr} बाद उसे ज़मानत पर छोड़ना था। अब वह {since} से जेल में है।',
    en: 'Ramesh is accused of theft, which carries a maximum of {max}. He is a first-time accused. Under Section 479 BNSS he should have been released on bond after {thr}. He has now been in jail for {since}.',
  },
  'hero.note': {
    hl: 'Ramesh ek kaalpanik udaharan hai. Jail mein band lagbhag 3.7 lakh undertrial log asli hain, aur kisi ka bhi doshi hona abhi sabit nahi hua.',
    hi: 'रमेश एक काल्पनिक उदाहरण है। जेल में बंद लगभग 3.7 लाख विचाराधीन लोग असली हैं, और किसी का भी दोषी होना अभी सिद्ध नहीं हुआ।',
    en: 'Ramesh is an illustrative example. The roughly 3.7 lakh undertrials in jail are real, and none of them has yet been proven guilty.',
  },
  'hero.cta1': { hl: 'Apna case jaanchein', hi: 'अपना केस जाँचें', en: 'Check a case' },
  'hero.cta2': { hl: '40 second mein samjhein', hi: '40 सेकंड में समझें', en: 'See it in 40 seconds' },
  'hero.cta2.stop': { hl: 'Tour rokein', hi: 'टूर रोकें', en: 'Stop the tour' },
  'hero.replay': { hl: 'Dobara dekhein', hi: 'दोबारा देखें', en: 'Replay' },
  'hero.scroll': { hl: 'Neeche: Tareekh kya karta hai', hi: 'नीचे: तारीख़ क्या करता है', en: 'Below: what Tareekh does' },

  // calendar
  'cal.day': { hl: 'Jail mein din {n}', hi: 'जेल में दिन {n}', en: 'Day {n} in jail' },
  'cal.law': { hl: 'Kanoon ki tareekh', hi: 'कानून की तारीख़', en: 'The date the law set' },
  'cal.late': { hl: 'Tareekh ke {n} din baad bhi jail mein', hi: 'तारीख़ के {n} दिन बाद भी जेल में', en: '{n} days past the date, still in jail' },
  'cal.arrest': { hl: 'Giraftaari', hi: 'गिरफ़्तारी', en: 'Arrested' },
  'cal.today': { hl: 'Aaj', hi: 'आज', en: 'Today' },
  'cal.alt': {
    hl: 'Deewaar ka tear-off calendar, jiske panne ek ek karke phat rahe hain. Rihaai ki tareekh guzar jaati hai, phir bhi panne phat-te rehte hain.',
    hi: 'दीवार का फाड़कर पढ़ने वाला कैलेंडर, जिसके पन्ने एक-एक करके फट रहे हैं। रिहाई की तारीख़ गुज़र जाती है और पन्ने फटते रहते हैं।',
    en: 'A tear-off wall calendar whose pages fall away one by one. The release date passes, and the pages keep falling.',
  },

  // ---- how it works -----------------------------------------------------------------------
  'kaise.h2': { hl: 'Kagaz se arzi tak, chaar kaam', hi: 'कागज़ से अर्ज़ी तक, चार काम', en: 'From a piece of paper to a court application, in four steps' },
  'kaise.lead': {
    hl: 'Tareekh ek agent hai. Ginti pakke niyam se hoti hai, andaaze se nahi.',
    hi: 'तारीख़ एक एजेंट है। गिनती पक्के नियम से होती है, अंदाज़े से नहीं।',
    en: 'Tareekh is an agent. The counting follows fixed rules, not guesses.',
  },
  's1.t': { hl: 'Padhta hai', hi: 'पढ़ता है', en: 'Reads' },
  's1.d': {
    hl: 'Giraftaari ya custody ke kagaz ka text padhkar dhara aur tareekh nikaalta hai.',
    hi: 'गिरफ़्तारी या हिरासत के कागज़ का पाठ पढ़कर धारा और तारीख़ निकालता है।',
    en: 'Reads the text of an arrest or custody paper and picks out the section and the date.',
  },
  's2.t': { hl: 'Ginti karta hai', hi: 'गिनती करता है', en: 'Counts' },
  's2.d': {
    hl: 'Dhara 479 ka hisaab: aadhi sazaa, ya pehli baar wale ke liye ek-tihai. Har kadam dikhta hai.',
    hi: 'धारा 479 का हिसाब: आधी सज़ा, या पहली बार वालों के लिए एक-तिहाई। हर कदम दिखता है।',
    en: 'Applies Section 479: half the maximum sentence, or one-third for a first-timer. Every step is shown.',
  },
  's3.t': { hl: 'Arzi likhta hai', hi: 'अर्ज़ी लिखता है', en: 'Drafts' },
  's3.d': {
    hl: 'Court ke liye arzi aur jail Superintendent ke liye patra, Hindi ya English mein.',
    hi: 'अदालत के लिए अर्ज़ी और जेल अधीक्षक के लिए पत्र, हिंदी या अंग्रेज़ी में।',
    en: 'An application for the court and a letter for the Jail Superintendent, in Hindi or English.',
  },
  's4.t': { hl: 'Pahunchata hai', hi: 'पहुँचाता है', en: 'Delivers' },
  's4.d': {
    hl: 'Vakeel ya legal aid tak WhatsApp, email ya print se. Tareekh paas aaye to yaad dilata hai.',
    hi: 'वकील या लीगल एड तक व्हाट्सऐप, ईमेल या प्रिंट से। तारीख़ पास आए तो याद दिलाता है।',
    en: 'Sent to a lawyer or legal aid by WhatsApp, email or print. Reminds you as the date nears.',
  },
  'kaise.owner': {
    hl: 'Dhara 479(3) kehti hai ki tareekh aate hi jail Superintendent ko khud adalat mein arzi deni hai. Tareekh unka ye kaam aasaan banata hai.',
    hi: 'धारा 479(3) कहती है कि तारीख़ आते ही जेल अधीक्षक को खुद अदालत में अर्ज़ी देनी है। तारीख़ उनका यह काम आसान बनाता है।',
    en: 'Section 479(3) says the Jail Superintendent must apply to the court as soon as the date arrives. Tareekh makes that duty easy to carry out.',
  },
  'kaise.human': {
    hl: 'Faisla hamesha insaan aur adalat ka hota hai. Tareekh sirf ginti aur kagaz taiyar karta hai.',
    hi: 'फ़ैसला हमेशा इंसान और अदालत का होता है। तारीख़ सिर्फ़ गिनती और कागज़ तैयार करता है।',
    en: 'The decision always belongs to people and the court. Tareekh only does the counting and prepares the paper.',
  },

  // ---- case checker -----------------------------------------------------------------------
  'bench.h2': { hl: 'Ek case jaanch ke dekhein', hi: 'एक केस जाँचकर देखें', en: 'Check a case' },
  'bench.lead': {
    hl: 'Kagaz agent se padhwaayein, ya khud jawab bhariye. Nateeja saath-saath badalta hai. Nateeje wale panel mein abhi Ramesh ka namuna hai.',
    hi: 'काग़ज़ एजेंट से पढ़वाएँ, या खुद जवाब भरिए। नतीजा साथ-साथ बदलता है। नतीजे वाले पैनल में अभी रमेश का नमूना है।',
    en: 'Let the agent read a paper, or fill in the answers yourself. The result changes as you go. The result panel shows Ramesh’s example for now.',
  },
  'tab.manual': { hl: 'Haath se bharein', hi: 'हाथ से भरें', en: 'Fill in by hand' },
  'q.offence': { hl: 'Aarop kis dhara mein hai?', hi: 'आरोप किस धारा में है?', en: 'Which section is the charge under?' },
  'q.offence.ph': { hl: 'Naam ya number: chori, 379', hi: 'नाम या नंबर: चोरी, 379', en: 'Name or number: theft, 379' },
  'offence.max': { hl: 'adhikatam {term}', hi: 'अधिकतम {term}', en: 'up to {term}' },
  'offence.maxvar': { hl: 'adhikatam {a} (IPC) ya {b} (BNS)', hi: 'अधिकतम {a} (IPC) या {b} (BNS)', en: 'up to {a} (IPC) or {b} (BNS)' },
  'offence.excluded': { hl: 'Dhara 479 lagu nahi', hi: 'धारा 479 लागू नहीं', en: 'Section 479 does not apply' },
  'offence.custom': { hl: 'Koi aur dhara (haath se bharein)', hi: 'कोई और धारा (हाथ से भरें)', en: 'Another section (enter by hand)' },
  'offence.none': { hl: 'Is naam ya number ki dhara list mein nahi. Neeche “Koi aur dhara” chuniye.', hi: 'इस नाम या नंबर की धारा सूची में नहीं है। नीचे “कोई और धारा” चुनिए।', en: 'No section in the list matches. Choose “Another section” below.' },
  'offence.group.property': { hl: 'Sampatti ke aparaadh', hi: 'संपत्ति के अपराध', en: 'Offences against property' },
  'offence.group.body': { hl: 'Sharir aur shaanti ke aparaadh', hi: 'शरीर और शांति के अपराध', en: 'Offences against the person and public peace' },
  'offence.group.excluded': { hl: 'Maut ya umrakaid ki sazaa wale', hi: 'मौत या उम्रकैद की सज़ा वाले', en: 'Punishable with death or life imprisonment' },
  'custom.section': { hl: 'Dhara aur kanoon (jaise BNS 125(b))', hi: 'धारा और कानून (जैसे BNS 125(b))', en: 'Section and law (for example BNS 125(b))' },
  'custom.max': { hl: 'Adhikatam sazaa jo kanoon mein likhi hai', hi: 'कानून में लिखी अधिकतम सज़ा', en: 'The maximum sentence written in the law' },
  'custom.years': { hl: 'saal', hi: 'साल', en: 'years' },
  'custom.months': { hl: 'mahine', hi: 'महीने', en: 'months' },
  'custom.life': { hl: 'Isme maut ya umrakaid ki sazaa bhi ho sakti hai', hi: 'इसमें मौत या उम्रकैद की सज़ा भी हो सकती है', en: 'Death or life imprisonment is also a possible punishment' },
  'custom.special': { hl: 'Ye vishesh kanoon (NDPS, UAPA, PMLA) ka maamla hai', hi: 'यह विशेष कानून (NDPS, UAPA, PMLA) का मामला है', en: 'This is under a special law (NDPS, UAPA, PMLA)' },
  'q.arrest': { hl: 'Giraftaari kis tareekh ko hui?', hi: 'गिरफ़्तारी किस तारीख़ को हुई?', en: 'On what date was the person arrested?' },
  'q.arrest.hint': { hl: 'Isi case mein jab se jail mein hain.', hi: 'इसी केस में जब से जेल में हैं।', en: 'Counted from the start of detention in this case.' },
  'q.first': { hl: 'Kya inhe pehle kabhi kisi mamle mein doshi theheraya gaya hai?', hi: 'क्या इन्हें पहले कभी किसी मामले में दोषी ठहराया गया है?', en: 'Has this person ever been convicted in an earlier case?' },
  'a.never': { hl: 'Kabhi nahi', hi: 'कभी नहीं', en: 'Never' },
  'a.before': { hl: 'Haan, pehle', hi: 'हाँ, पहले', en: 'Yes, before' },
  'a.unknown': { hl: 'Pata nahi', hi: 'पता नहीं', en: 'Don’t know' },
  'q.pending': { hl: 'Kya inke khilaaf koi aur case bhi chal raha hai?', hi: 'क्या इनके खिलाफ़ कोई और केस भी चल रहा है?', en: 'Is any other case pending against this person?' },
  'a.only': { hl: 'Nahi, sirf yeh ek', hi: 'नहीं, सिर्फ़ यही एक', en: 'No, only this one' },
  'a.others': { hl: 'Haan, aur bhi', hi: 'हाँ, और भी', en: 'Yes, there are others' },
  'q.regime': { hl: 'Ye ghatna kab hui?', hi: 'यह घटना कब हुई?', en: 'When did the incident happen?' },
  'q.regime.why': {
    hl: 'Is dhara mein purane IPC aur naye BNS ki adhikatam sazaa alag hai. Purani ghatna par purani sazaa lagti hai (Samvidhan ka Anuchhed 20).',
    hi: 'इस धारा में पुराने IPC और नए BNS की अधिकतम सज़ा अलग है। पुरानी घटना पर पुरानी सज़ा लागू होती है (संविधान का अनुच्छेद 20)।',
    en: 'For this section the old IPC and the new BNS set different maximums. For an older incident the older maximum applies (Article 20 of the Constitution).',
  },
  'a.ipc': { hl: '1 July 2024 se pehle', hi: '1 जुलाई 2024 से पहले', en: 'Before 1 July 2024' },
  'a.bns': { hl: '1 July 2024 ya uske baad', hi: '1 जुलाई 2024 या उसके बाद', en: 'On or after 1 July 2024' },
  'more.sum': { hl: 'Aur jaankari (zaroori nahi)', hi: 'और जानकारी (ज़रूरी नहीं)', en: 'More details (optional)' },
  'more.bail': { hl: 'Beech mein zamaanat par bahar rahe? Kitne din', hi: 'बीच में ज़मानत पर बाहर रहे? कितने दिन', en: 'Was the person out on bail in between? How many days' },
  'more.delay': { hl: 'Aaropi ki wajah se tali gayi tareekhon ke din', hi: 'आरोपी की वजह से टली तारीख़ों के दिन', en: 'Days lost to delay caused by the accused' },
  'more.delay.hint': { hl: 'Jaise aaropi gair-haazir raha ya jaanbujhkar deri karwayi. Ye din ginti se hat jaate hain.', hi: 'जैसे आरोपी गैर-हाज़िर रहा या जानबूझकर देरी करवाई। ये दिन गिनती से हट जाते हैं।', en: 'For example the accused stayed absent or caused delay on purpose. These days are left out of the count.' },
  'file.sample': { hl: 'Ramesh ka namuna', hi: 'रमेश का नमूना', en: 'Load Ramesh’s example' },
  'file.clear': { hl: 'Naya case', hi: 'नया केस', en: 'Start a new case' },

  // ---- the agent ---------------------------------------------------------------------------
  'tab.agent': { hl: 'Agent se padhwaayein', hi: 'एजेंट से पढ़वाएँ', en: 'Let the agent read it' },
  'tab.agent.badge': { hl: 'AI', hi: 'AI', en: 'AI' },
  'hero.agent': { hl: 'AI agent kagaz padhta hai, kanoon ka engine faisla karta hai', hi: 'AI एजेंट काग़ज़ पढ़ता है, क़ानून का इंजन फ़ैसला करता है', en: 'An AI agent reads the paper; a law engine decides' },
  'ag.label': { hl: 'Giraftaari, custody ya remand ke kagaz ka text yahan chipkayein', hi: 'गिरफ़्तारी, हिरासत या रिमांड के काग़ज़ का पाठ यहाँ चिपकाएँ', en: 'Paste the text of an arrest, custody or remand paper' },
  'ag.sample': { hl: 'Namuna kagaz se chalaayein', hi: 'नमूना काग़ज़ से चलाएँ', en: 'Run on a sample paper' },
  'ag.run': { hl: 'Agent se padhwaayein', hi: 'एजेंट से पढ़वाएँ', en: 'Read it with the agent' },
  'ag.running': { hl: 'Agent padh raha hai…', hi: 'एजेंट पढ़ रहा है…', en: 'The agent is reading…' },
  'ag.empty': { hl: 'Pehle kagaz ka text daalein.', hi: 'पहले काग़ज़ का पाठ डालें।', en: 'Paste the text of a paper first.' },
  'ag.privacy': { hl: 'Bhejne se pehle phone, ID number aur email hata diye jaate hain. Naam aur pata pehchaan nahi sakte, isliye unhein na daalein. Kagaz save nahi hota. Photo ya scan abhi nahi padhe jaate.', hi: 'भेजने से पहले फ़ोन, ID नंबर और ईमेल हटा दिए जाते हैं। नाम और पता पहचाने नहीं जा सकते, इसलिए उन्हें न डालें। काग़ज़ सेव नहीं होता। फ़ोटो या स्कैन अभी नहीं पढ़े जाते।', en: 'Phone numbers, ID numbers and emails are removed before anything is sent. Names and addresses cannot be detected, so leave them out. The paper is not saved. Photos and scans cannot be read yet.' },
  'ag.trace.label': { hl: 'Agent ne kya kiya', hi: 'एजेंट ने क्या किया', en: 'What the agent did' },
  'ag.privacy.free': { hl: 'Dhyan dein: AI mode mein text bahar ke model provider ko jaata hai, aur free plan par provider use rakh sakta hai aur padh sakta hai. Sample kagaz use karein, ya naam aur case ki details na daalein.', hi: 'ध्यान दें: AI मोड में पाठ बाहर के मॉडल प्रदाता को जाता है, और मुफ़्त प्लान पर प्रदाता उसे रख और पढ़ सकता है। नमूना काग़ज़ इस्तेमाल करें, या नाम और केस का ब्योरा न डालें।', en: 'Heads-up: in AI mode the text goes to an outside model provider, and on a free plan the provider may keep and review it. Use the sample paper, or leave out names and case details.' },
  'ag.mode.checking': { hl: 'AI ki sthiti dekh rahe hain…', hi: 'AI की स्थिति देख रहे हैं…', en: 'Checking whether the AI reader is on…' },
  'ag.mode.ai': { hl: 'AI model chalu: {model}', hi: 'AI मॉडल चालू: {model}', en: 'AI model on: {model}' },
  'ag.mode.off': { hl: 'Is site par AI band hai. Wahi agent loop bina AI model ke chal raha hai (offline reader).', hi: 'इस साइट पर AI बंद है। वही एजेंट लूप बिना AI मॉडल के चल रहा है (ऑफ़लाइन रीडर)।', en: 'AI is off on this site. The same agent loop runs without an AI model (offline reader).' },
  'ag.route.ai': { hl: 'AI model {model}', hi: 'AI मॉडल {model}', en: 'AI model {model}' },
  'ag.route.off': { hl: 'offline reader', hi: 'ऑफ़लाइन रीडर', en: 'offline reader' },
  'ag.tr.read': { hl: 'Kagaz padha', hi: 'काग़ज़ पढ़ा', en: 'Read the paper' },
  'ag.tr.lookup': { hl: 'Dhara dhoondhi', hi: 'धारा ढूँढी', en: 'Looked up the section' },
  'ag.tr.check': { hl: 'Dhara 479 ka hisaab', hi: 'धारा 479 का हिसाब', en: 'Section 479 count' },
  'ag.tr.draft': { hl: 'Arzi ka masauda banaya', hi: 'अर्ज़ी का मसौदा बनाया', en: 'Drafted the application' },
  'ag.tr.finish': { hl: 'Tippani aur sawaal taiyaar', hi: 'टिप्पणी और सवाल तैयार', en: 'Note and questions ready' },
  'ag.tag.table': { hl: 'dhara-sarni', hi: 'धारा-सारणी', en: 'section table' },
  'ag.tag.engine': { hl: 'kanoon ka engine', hi: 'क़ानून का इंजन', en: 'law engine' },
  'ag.tag.reader': { hl: 'padhne wala', hi: 'पढ़ने वाला', en: 'reader' },
  'ag.r.read': { hl: '{n} akshar padhe', hi: '{n} अक्षर पढ़े', en: '{n} characters read' },
  'ag.r.redacted': { hl: '{k} phone/ID/email hataye gaye', hi: '{k} फ़ोन/ID/ईमेल हटाए गए', en: '{k} phone/ID/email removed' },
  'ag.r.lookup': { hl: '{sec} → {name}, adhikatam {term}', hi: '{sec} → {name}, अधिकतम {term}', en: '{sec} → {name}, maximum {term}' },
  'ag.r.lookup.many': { hl: '{sec}: kai roop mile. Agent andaaza nahi lagata, puchhega.', hi: '{sec}: कई रूप मिले। एजेंट अंदाज़ा नहीं लगाता, पूछेगा।', en: '{sec}: several versions found. The agent does not guess; it will ask.' },
  'ag.r.lookup.none': { hl: '{sec}: list mein nahi. Sazaa andaaze se nahi lete.', hi: '{sec}: सूची में नहीं। सज़ा अंदाज़े से नहीं लेते।', en: '{sec}: not in the table. The maximum is never guessed.' },
  'ag.r.draft': { hl: '{title} taiyaar', hi: '{title} तैयार', en: '{title} ready' },
  'ag.r.finish': { hl: '{n} sawaal baaki', hi: '{n} सवाल बाकी', en: '{n} questions left' },
  'ag.r.rejected': { hl: 'Engine ne yeh jawaab nahi maana: kagaz mein iska saboot nahi mila. Agent ne dobara koshish ki.', hi: 'इंजन ने यह जवाब नहीं माना: काग़ज़ में इसका सबूत नहीं मिला। एजेंट ने फिर कोशिश की।', en: 'The engine refused this: the paper does not back it up. The agent tried again.' },
  'ag.r.c.eligible': { hl: '{d} se haq ban chuka', hi: '{d} से हक़ बन चुका', en: 'entitled since {d}' },
  'ag.r.c.notyet': { hl: '{d} ko haq banega, {n} din baaki', hi: '{d} को हक़ बनेगा, {n} दिन बाकी', en: 'entitled on {d}, {n} days to go' },
  'ag.r.c.two': { hl: 'Pehli baar ka aaropi: {a} · pehle doshi rahe hon: {b}', hi: 'पहली बार का आरोपी: {a} · पहले दोषी रहे हों: {b}', en: 'first offence: {a} · convicted before: {b}' },
  'ag.r.c.none': { hl: 'jaankari adhoori', hi: 'जानकारी अधूरी', en: 'information incomplete' },
  'ag.r.c.excluded': { hl: 'maut ya umrakaid wali dhara', hi: 'मौत या उम्रक़ैद वाली धारा', en: 'a death or life-imprisonment section' },
  'ag.r.c.invalid': { hl: 'di gayi tareekh galat', hi: 'दी गई तारीख़ ग़लत', en: 'a date is wrong' },
  'ag.v.ELIGIBLE': { hl: 'Haq ban chuka', hi: 'हक़ बन चुका', en: 'Entitled' },
  'ag.v.NOT_YET': { hl: 'Abhi nahi', hi: 'अभी नहीं', en: 'Not yet' },
  'ag.v.NEEDS_INFO': { hl: 'Jawaab chahiye', hi: 'जवाब चाहिए', en: 'Needs an answer' },
  'ag.v.EXCLUDED': { hl: 'Dhara 479 lagu nahi', hi: 'धारा 479 लागू नहीं', en: 'Not covered' },
  'ag.v.INVALID': { hl: 'Tareekh galat', hi: 'तारीख़ ग़लत', en: 'Check the date' },
  'ag.note.h': { hl: 'Padhne wale ki tippani', hi: 'पढ़ने वाले की टिप्पणी', en: 'The reader’s note' },
  'ag.note.model': { hl: 'AI ne likhi. Har tareekh engine se mili hai.', hi: 'AI ने लिखी। हर तारीख़ इंजन से मिली है।', en: 'Written by the AI. Every date comes from the engine.' },
  'ag.note.engine': { hl: 'Engine ke nateeje se bani, AI ke shabdon se nahi.', hi: 'इंजन के नतीजे से बनी, AI के शब्दों से नहीं।', en: 'Built from the engine’s result, not from AI wording.' },
  'ag.evidence': { hl: 'Kagaz mein likha hai: “{q}”', hi: 'काग़ज़ में लिखा है: “{q}”', en: 'The paper says: “{q}”' },
  'ag.ask.h': { hl: 'Agent aapse yeh puchta hai', hi: 'एजेंट आपसे यह पूछता है', en: 'The agent needs your answer' },
  'ag.seeverdict': { hl: 'Nateeja dekhein', hi: 'नतीजा देखें', en: 'See the result' },
  'ag.draft.open': { hl: 'Arzi ka masauda kholein', hi: 'अर्ज़ी का मसौदा खोलें', en: 'Open the draft application' },
  'ag.fallback': { hl: 'AI se jawaab nahi aaya ({why}). Offline reader se padha.', hi: 'AI से जवाब नहीं आया ({why})। ऑफ़लाइन रीडर से पढ़ा।', en: 'The AI did not answer ({why}). Read with the offline reader instead.' },
  'ag.why.rate_limited': { hl: 'bahut zyada koshishein', hi: 'बहुत ज़्यादा कोशिशें', en: 'too many tries' },
  'ag.why.budget': { hl: 'aaj ki seema poori', hi: 'आज की सीमा पूरी', en: 'daily limit reached' },
  'ag.why.no_key': { hl: 'AI band hai', hi: 'AI बंद है', en: 'AI is off' },
  'ag.why.network': { hl: 'network nahi mila', hi: 'नेटवर्क नहीं मिला', en: 'no network' },
  'ag.why.timeout': { hl: 'der ho gayi', hi: 'देर हो गई', en: 'took too long' },
  'ag.why.upstream': { hl: 'AI sewa mein dikkat', hi: 'AI सेवा में दिक़्क़त', en: 'the AI service had a problem' },
  'ag.why.other': { hl: 'dikkat aayi', hi: 'दिक़्क़त आई', en: 'a problem came up' },
  'ag.err.run': { hl: 'Agent poora nahi kar paaya. “Haath se bharein” mein jaakar dekhein.', hi: 'एजेंट पूरा नहीं कर पाया। “हाथ से भरें” में जाकर देखें।', en: 'The agent could not finish. Try “Fill in by hand”.' },
  'agent.h2': { hl: 'AI padhta hai. Faisla kanoon ka engine karta hai.', hi: 'AI पढ़ता है। फ़ैसला क़ानून का इंजन करता है।', en: 'The AI reads. The law engine decides.' },
  'agent.lead': { hl: 'Agent kagaz padhta hai, auzaar chalata hai aur har kadam dikhata hai. Tareekh aur nateeja kabhi AI ka andaaza nahi hota.', hi: 'एजेंट काग़ज़ पढ़ता है, औज़ार चलाता है और हर क़दम दिखाता है। तारीख़ और नतीजा कभी AI का अंदाज़ा नहीं होता।', en: 'The agent reads the paper, runs tools and shows every step. A date or a verdict is never an AI guess.' },
  'agent.flow.label': { hl: 'Agent kaise kaam karta hai', hi: 'एजेंट कैसे काम करता है', en: 'How the agent works' },
  'agent.n.paper': { hl: 'Kagaz', hi: 'काग़ज़', en: 'The paper' },
  'agent.n.paper.d': { hl: 'Custody certificate, remand order ya FIR ka text', hi: 'कस्टडी सर्टिफ़िकेट, रिमांड ऑर्डर या FIR का पाठ', en: 'Text of a custody certificate, remand order or FIR' },
  'agent.n.reader': { hl: 'AI model', hi: 'AI मॉडल', en: 'AI model' },
  'agent.n.reader.off': { hl: 'Offline reader', hi: 'ऑफ़लाइन रीडर', en: 'Offline reader' },
  'agent.n.reader.d': { hl: 'Padhta hai, auzaar chunta hai, sawaal puchta hai', hi: 'पढ़ता है, औज़ार चुनता है, सवाल पूछता है', en: 'Reads, picks tools, asks questions' },
  'agent.n.reader.off.d': { hl: 'Wahi loop, pakke patterns se padhta hai', hi: 'वही लूप, पक्के पैटर्न से पढ़ता है', en: 'Same loop, reads with fixed patterns' },
  'agent.n.tools': { hl: 'Auzaar', hi: 'औज़ार', en: 'Tools' },
  'agent.n.edge': { hl: 'AI yahan tak', hi: 'AI यहाँ तक', en: 'AI stops here' },
  'agent.n.engine': { hl: 'Kanoon ka engine', hi: 'क़ानून का इंजन', en: 'Law engine' },
  'agent.n.engine.d': { hl: 'Dhara 479 BNSS ka hisaab. Tareekh aur faisla sirf yahin banta hai.', hi: 'धारा 479 BNSS का हिसाब। तारीख़ और फ़ैसला सिर्फ़ यहीं बनता है।', en: 'Section 479 BNSS arithmetic. Dates and verdicts are made only here.' },
  'agent.n.out': { hl: 'Nateeja', hi: 'नतीजा', en: 'Result' },
  'agent.n.out.d': { hl: 'Tareekh, stamp, arzi', hi: 'तारीख़, मुहर, अर्ज़ी', en: 'Date, stamp, application' },
  'agent.g1.t': { hl: 'Tareekh AI se nahi aati.', hi: 'तारीख़ AI से नहीं आती।', en: 'No date comes from the AI.' },
  'agent.g1.d': { hl: 'Har tareekh engine ke jawaab se aati hai. AI ka likha note tabhi dikhta hai jab uski har tareekh engine se mile; warna note engine ke nateeje se banta hai.', hi: 'हर तारीख़ इंजन के जवाब से आती है। AI का लिखा नोट तभी दिखता है जब उसकी हर तारीख़ इंजन से मिले; वरना नोट इंजन के नतीजे से बनता है।', en: 'Every date comes from the engine’s answer. The AI’s note is shown only if each date in it matches the engine; otherwise the note is built from the engine’s result.' },
  'agent.g2.t': { hl: 'Pata na ho to puchta hai.', hi: 'पता न हो तो पूछता है।', en: 'If it doesn’t know, it asks.' },
  'agent.g2.d': { hl: 'Pehle doshi hain ya nahi, aur koi aur case pending hai ya nahi: kagaz mein na likha ho to agent andaaza nahi lagata. Jo bhi maanta hai, uske liye kagaz ke wahi shabd dikhata hai.', hi: 'पहले दोषी हैं या नहीं, और कोई और केस लंबित है या नहीं: काग़ज़ में न लिखा हो तो एजेंट अंदाज़ा नहीं लगाता। जो भी मानता है, उसके लिए काग़ज़ के वही शब्द दिखाता है।', en: 'Whether the person was convicted before, whether another case is pending: if the paper doesn’t say, the agent doesn’t guess. For anything it accepts, it shows the paper’s own words.' },
  'agent.g3.t': { hl: 'Har kadam dikhta hai.', hi: 'हर क़दम दिखता है।', en: 'Every step is visible.' },
  'agent.g3.d': { hl: 'Kaun sa auzaar chala, kya diya, kya jawaab aaya: sab neeche ke checker mein trace ki tarah dikhta hai. Wahi trace jaanch (evals) bhi padhti hai.', hi: 'कौन सा औज़ार चला, क्या दिया, क्या जवाब आया: सब नीचे के चेकर में ट्रेस की तरह दिखता है। वही ट्रेस जाँच (evals) भी पढ़ती है।', en: 'Which tool ran, what it was given, what came back: all of it shows as a trace in the checker below. The same trace is what the tests (evals) read.' },
  'agent.cta': { hl: 'Namuna kagaz par agent chalaayein', hi: 'नमूना काग़ज़ पर एजेंट चलाएँ', en: 'Run the agent on a sample paper' },
  'agent.proof.label': { hl: 'Jaanch ki sthiti', hi: 'जाँच की स्थिति', en: 'Test status' },
  'agent.proof.mode.ai': { hl: 'Abhi AI model chalu: {model}', hi: 'अभी AI मॉडल चालू: {model}', en: 'AI model is on: {model}' },
  'agent.proof.mode.off': { hl: 'Abhi is site par AI band hai; offline reader chal raha hai', hi: 'अभी इस साइट पर AI बंद है; ऑफ़लाइन रीडर चल रहा है', en: 'AI is off on this site right now; the offline reader is running' },
  'agent.proof.offline': { hl: '{p}/{n} kagaz-padhne ki jaanch pass (offline reader), {date} ko', hi: '{p}/{n} काग़ज़-पढ़ने की जाँच पास (ऑफ़लाइन रीडर), {date} को', en: '{p} of {n} paper-reading checks pass (offline reader), run on {date}' },
  'agent.proof.live': { hl: '{p}/{n} jaanch pass AI model {model} ke saath, {date} ko', hi: '{p}/{n} जाँच पास AI मॉडल {model} के साथ, {date} को', en: '{p} of {n} checks pass with AI model {model}, run on {date}' },
  'agent.proof.live.none': { hl: 'AI model ke saath jaanch abhi chalayi nahi gayi', hi: 'AI मॉडल के साथ जाँच अभी चलाई नहीं गई', en: 'Checks with an AI model have not been run yet' },
  'agent.proof.af': { hl: 'AgentFoundry mein banaya', hi: 'AgentFoundry में बनाया', en: 'Built in AgentFoundry' },
  'tour.c7': { hl: 'AI kagaz padhta hai, par tareekh sirf kanoon ka engine nikaalta hai.', hi: 'AI काग़ज़ पढ़ता है, पर तारीख़ सिर्फ़ क़ानून का इंजन निकालता है।', en: 'The AI reads the paper, but only the law engine works out the date.' },

  // ---- result -----------------------------------------------------------------------------
  'v.label': { hl: 'Rihaai ki tareekh', hi: 'रिहाई की तारीख़', en: 'Release date' },
  'v.eligible': { hl: 'Ye tareekh {n} din pehle aa chuki hai.', hi: 'यह तारीख़ {n} दिन पहले आ चुकी है।', en: 'This date came {n} days ago.' },
  'v.eligible.today': { hl: 'Ye tareekh aaj hai.', hi: 'यह तारीख़ आज है।', en: 'This date is today.' },
  'v.notyet': { hl: 'Ye tareekh {n} din baad aayegi.', hi: 'यह तारीख़ {n} दिन बाद आएगी।', en: 'This date is {n} days away.' },
  'v.progress': { hl: 'Ab tak {c} din poore, zaroorat {t} din ki.', hi: 'अब तक {c} दिन पूरे, ज़रूरत {t} दिन की।', en: '{c} days done, {t} needed.' },
  'v.stamp.eligible': { hl: 'Rihaai ka haq', hi: 'रिहाई का हक़', en: 'Entitled to release' },
  'v.stamp.notyet': { hl: 'Abhi nahi', hi: 'अभी नहीं', en: 'Not yet' },
  'v.stamp.excluded': { hl: 'Lagu nahi', hi: 'लागू नहीं', en: 'Not covered' },
  'v.stamp.info': { hl: 'Ek jawab baaki', hi: 'एक जवाब बाकी', en: 'One answer missing' },
  'v.excluded.t': { hl: 'Is dhara par 479 lagu nahi hoti.', hi: 'इस धारा पर 479 लागू नहीं होती।', en: 'Section 479 does not apply to this charge.' },
  'v.excluded.d': {
    hl: 'Jis aarop mein maut ya umrakaid ki sazaa ho sakti hai, us par dhara 479(1) lagu nahi hoti. Zamaanat ke baaki raaste khule hain; vakeel se baat karein.',
    hi: 'जिस आरोप में मौत या उम्रकैद की सज़ा हो सकती है, उस पर धारा 479(1) लागू नहीं होती। ज़मानत के बाकी रास्ते खुले हैं; वकील से बात करें।',
    en: 'Section 479(1) does not cover a charge that can carry death or life imprisonment. Other routes to bail remain open; speak to a lawyer.',
  },
  'v.info.t': { hl: 'Ek jawab chahiye.', hi: 'एक जवाब चाहिए।', en: 'One answer is needed.' },
  'v.info.first': {
    hl: 'Pehli baar ka aaropi ho to {a}. Pehle doshi ho chuka ho to {b}.',
    hi: 'पहली बार का आरोपी हो तो {a}। पहले दोषी हो चुका हो तो {b}।',
    en: 'If this is a first offence: {a}. If previously convicted: {b}.',
  },
  'v.info.regime': { hl: 'Pehle bataiye ki ghatna kab hui.', hi: 'पहले बताइए कि घटना कब हुई।', en: 'Please say when the incident happened.' },
  'v.info.offence': { hl: 'Pehle dhara chuniye.', hi: 'पहले धारा चुनिए।', en: 'Please choose the section first.' },
  'v.info.arrest': { hl: 'Giraftaari ki tareekh bhariye.', hi: 'गिरफ़्तारी की तारीख़ भरिए।', en: 'Please enter the arrest date.' },
  'v.info.maxMonths': { hl: 'Adhikatam sazaa bhariye (saal ya mahine).', hi: 'अधिकतम सज़ा भरिए (साल या महीने)।', en: 'Please enter the maximum sentence (years or months).' },
  'v.invalid.arrest_in_future': { hl: 'Giraftaari ki tareekh aaj se aage nahi ho sakti.', hi: 'गिरफ़्तारी की तारीख़ आज से आगे नहीं हो सकती।', en: 'The arrest date cannot be in the future.' },
  'v.invalid.arrest_date': { hl: 'Ye tareekh sahi nahi lagti.', hi: 'यह तारीख़ सही नहीं लगती।', en: 'That date does not look right.' },
  'v.invalid.bail_exceeds_custody': { hl: 'Zamaanat par bahar rahe din, jail ke kul dino se zyada nahi ho sakte.', hi: 'ज़मानत पर बाहर रहे दिन, जेल के कुल दिनों से ज़्यादा नहीं हो सकते।', en: 'Days on bail cannot exceed the total days since arrest.' },
  'v.invalid.delay_exceeds_custody': { hl: 'Deri ke din jail ke kul dino se zyada nahi ho sakte.', hi: 'देरी के दिन जेल के कुल दिनों से ज़्यादा नहीं हो सकते।', en: 'Days of delay cannot exceed the days in custody.' },
  'v.invalid.negative_days': { hl: 'Din ki ginti shunya ya usse zyada honi chahiye.', hi: 'दिनों की गिनती शून्य या उससे ज़्यादा होनी चाहिए।', en: 'The number of days must be zero or more.' },
  'v.invalid.as_of': { hl: 'Aaj ki tareekh padhi nahi ja saki.', hi: 'आज की तारीख़ पढ़ी नहीं जा सकी।', en: 'Could not read today’s date.' },

  // trace ("how it was worked out")
  'trace.h': { hl: 'Ginti kaise hui', hi: 'गिनती कैसे हुई', en: 'How this was worked out' },
  'trace.offence': { hl: 'Aarop ki adhikatam sazaa {term}{via}.', hi: 'आरोप की अधिकतम सज़ा {term}{via}।', en: 'The charge carries a maximum of {term}{via}.' },
  'trace.via.ipc': { hl: ' (purane IPC ke hisaab se)', hi: ' (पुराने IPC के हिसाब से)', en: ' (under the old IPC)' },
  'trace.via.bns': { hl: ' (naye BNS ke hisaab se)', hi: ' (नए BNS के हिसाब से)', en: ' (under the new BNS)' },
  'trace.death_life.pass': { hl: 'Maut ya umrakaid ki sazaa nahi, isliye dhara 479(1) lagu ho sakti hai.', hi: 'मौत या उम्रकैद की सज़ा नहीं, इसलिए धारा 479(1) लागू हो सकती है।', en: 'Death and life imprisonment are not punishments for this charge, so Section 479(1) can apply.' },
  'trace.death_life.fail': { hl: 'Maut ya umrakaid ki sazaa ho sakti hai, isliye dhara 479(1) lagu nahi.', hi: 'मौत या उम्रकैद की सज़ा हो सकती है, इसलिए धारा 479(1) लागू नहीं।', en: 'Death or life imprisonment is possible, so Section 479(1) does not apply.' },
  'trace.first_time.yes': { hl: 'Pehle kabhi doshi nahi theheraya gaya, isliye ek-tihai (1/3) hissa lagta hai.', hi: 'पहले कभी दोषी नहीं ठहराया गया, इसलिए एक-तिहाई (1/3) हिस्सा लगता है।', en: 'Never convicted before, so one-third (1/3) applies.' },
  'trace.first_time.no': { hl: 'Pehle doshi theheraya ja chuka hai, isliye aadha (1/2) hissa lagta hai.', hi: 'पहले दोषी ठहराया जा चुका है, इसलिए आधा (1/2) हिस्सा लगता है।', en: 'Convicted before, so one-half (1/2) applies.' },
  'trace.threshold': { hl: '{fr} hissa: {thr} ({days} din).', hi: '{fr} हिस्सा: {thr} ({days} दिन)।', en: '{fr} of the maximum: {thr} ({days} days).' },
  'trace.fr.third': { hl: 'Ek-tihai', hi: 'एक-तिहाई', en: 'One-third' },
  'trace.fr.half': { hl: 'Aadha', hi: 'आधा', en: 'One-half' },
  'trace.exclusions': { hl: 'Ginti se hataye gaye din: zamaanat par {b}, aaropi ki wajah se deri {d}.', hi: 'गिनती से हटाए गए दिन: ज़मानत पर {b}, आरोपी की वजह से देरी {d}।', en: 'Left out of the count: {b} days on bail, {d} days of delay by the accused.' },
  'trace.custody': { hl: 'Giraftaari se ab tak {c} din; ginti mein {k} din.', hi: 'गिरफ़्तारी से अब तक {c} दिन; गिनती में {k} दिन।', en: '{c} days since arrest; {k} days count.' },
  'trace.reached.pass': { hl: '{k} din, zaroorat {t} din. Tareekh {date} ko poori hui.', hi: '{k} दिन, ज़रूरत {t} दिन। तारीख़ {date} को पूरी हुई।', en: '{k} days against {t} needed. The date was reached on {date}.' },
  'trace.reached.fail': { hl: '{k} din, zaroorat {t} din. Tareekh {date} ko poori hogi.', hi: '{k} दिन, ज़रूरत {t} दिन। तारीख़ {date} को पूरी होगी।', en: '{k} days against {t} needed. The date will be reached on {date}.' },
  'trace.pending.pass': { hl: 'Koi aur case pending nahi, isliye dhara 479(2) rukawat nahi hai.', hi: 'कोई और केस लंबित नहीं, इसलिए धारा 479(2) रुकावट नहीं है।', en: 'No other case is pending, so Section 479(2) is no obstacle.' },
  'trace.pending.warn': { hl: 'Aur case bhi pending hain. Dhara 479(2) par adalatein ek mat nahi hain.', hi: 'और केस भी लंबित हैं। धारा 479(2) पर अदालतें एकमत नहीं हैं।', en: 'Other cases are pending. Courts do not agree on how Section 479(2) reads.' },
  'trace.pending.info': { hl: 'Aur case pending hai ya nahi, ye jail se pakka karna baaki hai.', hi: 'और केस लंबित है या नहीं, यह जेल से पक्का करना बाकी है।', en: 'Whether any other case is pending still has to be confirmed with the jail.' },
  'trace.third': { hl: 'Kisi bhi haal mein adhikatam sazaa ki avadhi ({date}) ke baad jail mein nahi rakha ja sakta.', hi: 'किसी भी हाल में अधिकतम सज़ा की अवधि ({date}) के बाद जेल में नहीं रखा जा सकता।', en: 'In no case can the person be held beyond the maximum term ({date}).' },
  'trace.third.warn': { hl: 'Adhikatam sazaa ki avadhi bhi poori ho chuki hai ({date}). Ab rakhna kisi bhi haal mein jaayaz nahi.', hi: 'अधिकतम सज़ा की अवधि भी पूरी हो चुकी है ({date})। अब रखना किसी भी हाल में जायज़ नहीं।', en: 'Even the maximum term has been served ({date}). Holding the person longer is not allowed in any case.' },
  'cite.1': { hl: 'Dhara 479(1)', hi: 'धारा 479(1)', en: 'S.479(1)' },
  'cite.p1': { hl: '479(1), pehla proviso', hi: '479(1), पहला परंतुक', en: 'S.479(1), 1st proviso' },
  'cite.expl': { hl: 'Spashtikaran', hi: 'स्पष्टीकरण', en: 'Explanation' },
  'cite.2': { hl: 'Dhara 479(2)', hi: 'धारा 479(2)', en: 'S.479(2)' },
  'cite.p3': { hl: '479(1), teesra proviso', hi: '479(1), तीसरा परंतुक', en: 'S.479(1), 3rd proviso' },

  // flags
  'flag.SECOND_PROVISO': {
    hl: 'Adalat Public Prosecutor ko sunkar, likhit karan dekar, zyada samay tak rakhne ka aadesh de sakti hai (doosra proviso). “Rihaai ka haq” ka matlab “rihaa” nahi hota.',
    hi: 'अदालत लोक अभियोजक को सुनकर, लिखित कारण देकर, ज़्यादा समय तक रखने का आदेश दे सकती है (दूसरा परंतुक)। “रिहाई का हक़” का मतलब “रिहा” नहीं होता।',
    en: 'The court may order longer detention after hearing the Public Prosecutor and recording reasons (second proviso). “Entitled to release” is not the same as “released”.',
  },
  'flag.PENDING_CASES': { hl: 'Aur case bhi pending hain. Dhara 479(2) ki vyakhya par vakeel ki raay zaroori hai.', hi: 'और केस भी लंबित हैं। धारा 479(2) की व्याख्या पर वकील की राय ज़रूरी है।', en: 'Other cases are pending. A lawyer’s opinion on Section 479(2) is essential here.' },
  'flag.MULTIPLE_OFFENCES': { hl: 'Ek se zyada dhara lagi hain. Hisaab sabse lambi sazaa wali dhara par kiya gaya hai (ehtiyaat ke taur par). Dhara 479(2) par vakeel ki raay zaroori hai.', hi: 'एक से ज़्यादा धाराएँ लगी हैं। हिसाब सबसे लंबी सज़ा वाली धारा पर किया गया है (एहतियात के तौर पर)। धारा 479(2) पर वकील की राय ज़रूरी है।', en: 'More than one section is charged. The count uses the section with the longest maximum (the cautious choice). A lawyer’s opinion on Section 479(2) is essential.' },
  'flag.VERIFY_PENDING_CASES': { hl: 'Jail record se pakka karein ki koi aur case pending nahi hai.', hi: 'जेल रिकॉर्ड से पक्का करें कि कोई और केस लंबित नहीं है।', en: 'Confirm from the jail record that no other case is pending.' },
  'flag.SPECIAL_LAW': { hl: 'Vishesh kanoon (jaise NDPS, UAPA, PMLA) ki apni zamaanat shartein hoti hain. Vakeel ki raay zaroori hai.', hi: 'विशेष कानूनों (जैसे NDPS, UAPA, PMLA) की अपनी ज़मानत शर्तें होती हैं। वकील की राय ज़रूरी है।', en: 'Special laws (such as NDPS, UAPA, PMLA) have their own bail conditions. A lawyer’s opinion is essential.' },
  'flag.IPC_MAX_APPLIED': { hl: 'Ghatna 1 July 2024 se pehle ki hai, isliye purane IPC ki adhikatam sazaa li gayi hai.', hi: 'घटना 1 जुलाई 2024 से पहले की है, इसलिए पुराने IPC की अधिकतम सज़ा ली गई है।', en: 'The incident is from before 1 July 2024, so the old IPC maximum was used.' },
  'flag.REPEAT_ENHANCED': { hl: 'Doosri baar doshi theherne par is aparaadh ki sazaa badh sakti hai (chori mein 5 saal tak). Vakeel se pakka karein ki charge-sheet mein kaun si sazaa lagi hai.', hi: 'दूसरी बार दोषी ठहराए जाने पर इस अपराध की सज़ा बढ़ सकती है (चोरी में 5 साल तक)। वकील से पक्का करें कि आरोप-पत्र में कौन सी सज़ा लगी है।', en: 'After an earlier conviction the sentence for this offence can go up (to 5 years for theft). Ask a lawyer which sentence the charge-sheet invokes.' },
  'flag.MAX_TERM_REACHED': { hl: 'Adhikatam sazaa ki avadhi poori ho chuki hai. Isse zyada jail mein rakhna kisi bhi haal mein jaayaz nahi.', hi: 'अधिकतम सज़ा की अवधि पूरी हो चुकी है। इससे ज़्यादा जेल में रखना किसी भी हाल में जायज़ नहीं।', en: 'The maximum term has already been served. Holding the person any longer is not allowed in any case.' },

  // actions
  'act.draft': { hl: 'Arzi taiyar karein', hi: 'अर्ज़ी तैयार करें', en: 'Prepare the application' },
  'act.whatsapp': { hl: 'WhatsApp par bhejein', hi: 'व्हाट्सऐप पर भेजें', en: 'Send on WhatsApp' },
  'act.gcal': { hl: 'Google Calendar mein jodein', hi: 'गूगल कैलेंडर में जोड़ें', en: 'Add to Google Calendar' },
  'act.remind': { hl: 'Ya .ics file lein (Apple, Outlook)', hi: 'या .ics फ़ाइल लें (Apple, Outlook)', en: 'Or download an .ics file (Apple, Outlook)' },
  'act.wait': { hl: 'Arzi tab banegi jab tareekh aa jaayegi. Tab tak yaad dilane wala calendar rakh lein.', hi: 'अर्ज़ी तब बनेगी जब तारीख़ आ जाएगी। तब तक याद दिलाने वाला कैलेंडर रख लें।', en: 'The application can be prepared once the date arrives. Until then, keep a reminder.' },
  'minibar.open': { hl: 'Poora nateeja', hi: 'पूरा नतीजा', en: 'Full result' },

  // draft panel
  'd.h': { hl: 'Arzi ka masauda', hi: 'अर्ज़ी का मसौदा', en: 'Draft application' },
  'd.tab.court': { hl: 'Court ko arzi', hi: 'अदालत को अर्ज़ी', en: 'Application to the court' },
  'd.tab.jail': { hl: 'Jail Superintendent ko patra', hi: 'जेल अधीक्षक को पत्र', en: 'Letter to the Jail Superintendent' },
  'd.lang': { hl: 'Masaude ki bhasha', hi: 'मसौदे की भाषा', en: 'Language of the draft' },
  'd.fields': { hl: 'Ye jaankari bharein. Masauda saath-saath badalta hai.', hi: 'यह जानकारी भरें। मसौदा साथ-साथ बदलता है।', en: 'Add these details. The draft updates as you type.' },
  'd.f.name': { hl: 'Bandi ka naam', hi: 'बंदी का नाम', en: 'Name of the prisoner' },
  'd.f.jail': { hl: 'Jail ka naam', hi: 'जेल का नाम', en: 'Name of the jail' },
  'd.f.court': { hl: 'Court ka naam aur sthaan', hi: 'अदालत का नाम और स्थान', en: 'Name and place of the court' },
  'd.f.caseNo': { hl: 'Case ya FIR number', hi: 'केस या एफ़आईआर नंबर', en: 'Case or FIR number' },
  'd.f.ps': { hl: 'Thana', hi: 'थाना', en: 'Police station' },
  'd.f.place': { hl: 'Sthaan (hastakshar ke paas)', hi: 'स्थान (हस्ताक्षर के पास)', en: 'Place (next to the signature)' },
  'd.f.sender': { hl: 'Aapka naam aur pad', hi: 'आपका नाम और पद', en: 'Your name and role' },
  'd.copy': { hl: 'Copy karein', hi: 'कॉपी करें', en: 'Copy' },
  'd.copied': { hl: 'Copy ho gaya', hi: 'कॉपी हो गया', en: 'Copied' },
  'd.print': { hl: 'Print ya PDF', hi: 'प्रिंट या PDF', en: 'Print or save as PDF' },
  'd.mail': { hl: 'Email', hi: 'ईमेल', en: 'Email' },
  'd.wa': { hl: 'WhatsApp', hi: 'व्हाट्सऐप', en: 'WhatsApp' },
  'd.note': { hl: 'Masauda dakhil karne se pehle vakeel se jaanchwayein.', hi: 'मसौदा दाखिल करने से पहले वकील से जँचवाएँ।', en: 'Have a lawyer check the draft before it is filed.' },
  'd.close': { hl: 'Masauda band karein', hi: 'मसौदा बंद करें', en: 'Close the draft' },

  // share text
  'share.wa': {
    hl: 'Namaste. Dhara 479 BNSS ke hisaab se ek undertrial ki jaanch:\nAarop: {offence}\nGiraftaari: {arrest}\nRihaai ki tareekh: {date} ({n} din pehle aa chuki)\nKripya arzi dakhil karne mein madad karein.\n(Tareekh se; kanooni salah nahi)',
    hi: 'नमस्ते। धारा 479 बीएनएसएस के हिसाब से एक विचाराधीन बंदी की जाँच:\nआरोप: {offence}\nगिरफ़्तारी: {arrest}\nरिहाई की तारीख़: {date} ({n} दिन पहले आ चुकी)\nकृपया अर्ज़ी दाखिल करने में मदद करें।\n(तारीख़ से; कानूनी सलाह नहीं)',
    en: 'Hello. A check under Section 479 BNSS for an undertrial:\nCharge: {offence}\nArrested: {arrest}\nRelease date: {date} ({n} days ago)\nPlease help file the application.\n(From Tareekh; not legal advice)',
  },
  'ics.title': { hl: 'Rihaai ki tareekh (Dhara 479 BNSS)', hi: 'रिहाई की तारीख़ (धारा 479 बीएनएसएस)', en: 'Release date (Section 479 BNSS)' },
  'ics.desc': { hl: 'Is tareekh se arzi dakhil ho sakti hai. Ye Tareekh ki ginti hai; vakeel se jaanch lein.', hi: 'इस तारीख़ से अर्ज़ी दाखिल हो सकती है। यह तारीख़ की गिनती है; वकील से जँचवा लें।', en: 'The application can be filed from this date. This is Tareekh’s count; have a lawyer check it.' },

  // ---- scale -----------------------------------------------------------------------------
  'sc.h2': { hl: 'Jail mein band logon mein se kitne ginti mein aaye?', hi: 'जेल में बंद लोगों में से कितने गिनती में आए?', en: 'Of the people in jail, how many were counted?' },
  'sc.dot': { hl: 'Har dot ek hazaar log hai.', hi: 'हर बिंदु एक हज़ार लोग है।', en: 'Each dot is a thousand people.' },
  'sc.gold': {
    hl: 'Ek adhyayan ke mutabiq jail ke record mein sirf 968 log “rihaai ke yogya” darj hue. Ek dot se bhi kam.',
    hi: 'एक अध्ययन के मुताबिक़ जेल के रिकॉर्ड में सिर्फ़ 968 लोग “रिहाई के योग्य” दर्ज हुए। एक बिंदु से भी कम।',
    en: 'A study of prison records found only 968 people recorded as eligible for release. Less than one dot.',
  },
  'sc.caveat': {
    hl: 'Ye 3.7 lakh sab eligible nahi hain. Par kaun eligible hai, ye jaanchna hi pehli rukawat hai, aur wahi kaam Tareekh karta hai.',
    hi: 'ये 3.7 लाख सब योग्य नहीं हैं। पर कौन योग्य है, यह जाँचना ही पहली रुकावट है, और वही काम तारीख़ करता है।',
    en: 'Not all 3.7 lakh are eligible. But finding out who is eligible is the first obstacle, and that is the job Tareekh does.',
  },
  'sc.stat1.n': { hl: '5.11 lakh', hi: '5.11 लाख', en: '5.11 lakh' },
  'sc.stat1.d': { hl: 'log jail mein, jinmein 72.6% undertrial', hi: 'लोग जेल में, जिनमें 72.6% विचाराधीन', en: 'people in jail, 72.6% of them undertrials' },
  'sc.stat2.n': { hl: '1,333', hi: '1,333', en: '1,333' },
  'sc.stat2.d': { hl: 'jail, har ek mein yahi sawal', hi: 'जेल, हर एक में यही सवाल', en: 'jails, the same question in each' },
  'sc.stat3.n': { hl: '4.99 crore', hi: '4.99 करोड़', en: '4.99 crore' },
  'sc.stat3.d': { hl: 'case nichli adalaton mein pending', hi: 'केस निचली अदालतों में लंबित', en: 'cases pending in subordinate courts' },
  'sc.w1.t': { hl: 'Ek kanoon, poora desh', hi: 'एक कानून, पूरा देश', en: 'One law, the whole country' },
  'sc.w1.d': { hl: 'BNSS ki dhara 479 har rajya mein ek jaisi hai. Naye rajya ke liye naya code nahi likhna padta.', hi: 'बीएनएसएस की धारा 479 हर राज्य में एक जैसी है। नए राज्य के लिए नया कोड नहीं लिखना पड़ता।', en: 'Section 479 BNSS reads the same in every state. A new state needs no new code.' },
  'sc.w2.t': { hl: 'Pakka hisaab', hi: 'पक्का हिसाब', en: 'Fixed rules' },
  'sc.w2.d': { hl: 'Ginti niyam se hoti hai, isliye 1,333 jailon mein ek hi sawal ka ek hi jawab aata hai.', hi: 'गिनती नियम से होती है, इसलिए 1,333 जेलों में एक ही सवाल का एक ही जवाब आता है।', en: 'The count follows rules, so all 1,333 jails get the same answer to the same question.' },
  'sc.w3.t': { hl: 'Bhasha badalti hai, niyam nahi', hi: 'भाषा बदलती है, नियम नहीं', en: 'The language changes, the rules do not' },
  'sc.w3.d': { hl: 'Abhi Hindi, Hinglish aur English. Baaki bhashayein agle charan mein; niyam wahi rahenge.', hi: 'अभी हिंदी, हिंग्लिश और अंग्रेज़ी। बाकी भाषाएँ अगले चरण में; नियम वही रहेंगे।', en: 'Hindi, Hinglish and English today. More languages next; the rules stay the same.' },
  'sc.src': {
    hl: 'Srot: NCRB Prison Statistics India 2024; NJDG (28 July 2026). 968 ka aankda ek adhyayan se hai jo LiveLaw mein ullekhit hai, aur sirf ek chhote samay ke data par hai.',
    hi: 'स्रोत: NCRB Prison Statistics India 2024; NJDG (28 जुलाई 2026)। 968 का आँकड़ा एक अध्ययन से है जो LiveLaw में उल्लिखित है, और सिर्फ़ एक छोटे समय के आँकड़ों पर है।',
    en: 'Sources: NCRB Prison Statistics India 2024; NJDG (28 July 2026). The 968 figure comes from a study cited by LiveLaw and covers only a short period of data.',
  },

  // ---- impact ledger -----------------------------------------------------------------------
  'im.h2': { hl: 'Asli asar ka khaata', hi: 'असली असर का खाता', en: 'The ledger of real impact' },
  'im.lead': {
    hl: 'Is khaate mein sirf wahi likha jaata hai jo kisi legal-aid vakeel ya jail adhikari ne asli case par pushti kiya ho. Pilot abhi shuru nahi hua, isliye sab shunya hai. Yahan andaaze nahi likhe jaate.',
    hi: 'इस खाते में सिर्फ़ वही लिखा जाता है जो किसी लीगल-एड वकील या जेल अधिकारी ने असली केस पर पुष्ट किया हो। पायलट अभी शुरू नहीं हुआ, इसलिए सब शून्य है। यहाँ अंदाज़े नहीं लिखे जाते।',
    en: 'Only what a legal-aid lawyer or jail officer has confirmed on a real case is written here. The pilot has not started, so everything reads zero. Estimates are never entered.',
  },
  'im.r1': { hl: 'Case jaanche gaye', hi: 'केस जाँचे गए', en: 'Cases checked' },
  'im.r2': { hl: 'Jinki tareekh aa chuki thi', hi: 'जिनकी तारीख़ आ चुकी थी', en: 'Whose date had already come' },
  'im.r3': { hl: 'Arzi court tak pahunchi', hi: 'अर्ज़ी अदालत तक पहुँची', en: 'Applications that reached a court' },
  'im.r4': { hl: 'Rihaa hue', hi: 'रिहा हुए', en: 'Released' },
  'im.r5': { hl: 'Arzi se rihaai tak, madhya din', hi: 'अर्ज़ी से रिहाई तक, मध्य दिन', en: 'Application to release, median days' },
  'im.pilot': { hl: 'Pilot saathi', hi: 'पायलट साथी', en: 'Pilot partner' },
  'im.pilot.none': { hl: 'Abhi koi nahi. Legal aid clinic, law school clinic ya NGO ka intezaar.', hi: 'अभी कोई नहीं। लीगल एड क्लिनिक, लॉ स्कूल क्लिनिक या NGO का इंतज़ार।', en: 'None yet. Waiting for a legal-aid clinic, law-school clinic or NGO.' },
  'im.join': { hl: 'Pilot mein judein', hi: 'पायलट से जुड़ें', en: 'Join the pilot' },

  // ---- footer -----------------------------------------------------------------------------
  'ft.disclaimer': { hl: 'Tareekh kanooni salah nahi hai. “Rihaai ka haq” ka matlab “rihaa” nahi hota; faisla adalat karti hai.', hi: 'तारीख़ कानूनी सलाह नहीं है। “रिहाई का हक़” का मतलब “रिहा” नहीं होता; फ़ैसला अदालत करती है।', en: 'Tareekh is not legal advice. “Entitled to release” does not mean “released”; the court decides.' },
  'ft.privacy': { hl: 'Haath se bharne par, ya jab AI band ho, aapka data browser se bahar nahi jaata. Agent se AI model par padhwaane par kagaz ka text (phone, ID aur email hata kar) model ko bheja jaata hai aur hum use save nahi karte; model provider ke apne niyam us text par lagu hote hain.', hi: 'हाथ से भरने पर, या जब AI बंद हो, आपका डेटा ब्राउज़र से बाहर नहीं जाता। एजेंट से AI मॉडल पर पढ़वाने पर काग़ज़ का पाठ (फ़ोन, ID और ईमेल हटाकर) मॉडल को भेजा जाता है और हम उसे सेव नहीं करते; मॉडल प्रदाता के अपने नियम उस पाठ पर लागू होते हैं।', en: 'When you fill things in by hand, or when the AI is off, your data never leaves the browser. When the agent reads a paper with the AI model, the text (with phone numbers, ID numbers and emails removed) is sent to the model and is not saved by us; the model provider’s own rules apply to what it receives.' },
  'ft.review': { hl: 'Dhara-sarni vakeel se jaanchi nahi gayi hai. Aakhri milaan: {date}.', hi: 'धारा-सारणी वकील से जँची नहीं है। आखिरी मिलान: {date}।', en: 'The table of sections has not yet been reviewed by an advocate. Last checked: {date}.' },
  'ft.oss': { hl: 'Open source, MIT licence.', hi: 'ओपन सोर्स, MIT लाइसेंस।', en: 'Open source, MIT licence.' },
  'ft.src.h': { hl: 'Kanoon aur aankdon ke srot', hi: 'कानून और आँकड़ों के स्रोत', en: 'Sources for the law and the numbers' },
  'ft.src.1': { hl: 'Dhara 479 BNSS ka paath: Himachal Pradesh High Court, Ravi Hans v. State of H.P. (10 January 2025) mein uddhrit', hi: 'धारा 479 बीएनएसएस का पाठ: हिमाचल प्रदेश उच्च न्यायालय, Ravi Hans v. State of H.P. (10 जनवरी 2025) में उद्धृत', en: 'Text of Section 479 BNSS: as quoted by the High Court of Himachal Pradesh in Ravi Hans v. State of H.P. (10 January 2025)' },
  'ft.src.2': { hl: 'Jail aur undertrial ke aankde: NCRB, Prison Statistics India 2024', hi: 'जेल और विचाराधीन बंदियों के आँकड़े: NCRB, Prison Statistics India 2024', en: 'Prison and undertrial figures: NCRB, Prison Statistics India 2024' },
  'ft.src.3': { hl: 'Pending case: National Judicial Data Grid, 28 July 2026', hi: 'लंबित केस: नेशनल ज्यूडिशियल डेटा ग्रिड, 28 जुलाई 2026', en: 'Pending cases: National Judicial Data Grid, 28 July 2026' },
  'ft.src.4': { hl: 'Dhara-wise adhikatam sazaa: BNS aur IPC ki sarni, kam se kam do prakashit srot se milaai gayi', hi: 'धारा-वार अधिकतम सज़ा: BNS और IPC की सारणी, कम से कम दो प्रकाशित स्रोतों से मिलाई गई', en: 'Maximum sentence by section: BNS and IPC tables, each cross-checked against at least two published sources' },

  // ---- guided tour captions -----------------------------------------------------------------
  'tour.c1': { hl: 'Ramesh ki rihaai ki tareekh nikal chuki hai. Kisi ne ginti nahi ki.', hi: 'रमेश की रिहाई की तारीख़ निकल चुकी है। किसी ने गिनती नहीं की।', en: 'Ramesh’s release date has passed. Nobody did the sums.' },
  'tour.c2': { hl: 'Kagaz padhna, ginti, arzi, aage bhejna. Chaar kaam, ek jagah.', hi: 'कागज़ पढ़ना, गिनती, अर्ज़ी, आगे भेजना। चार काम, एक जगह।', en: 'Read, count, draft, send. Four jobs in one place.' },
  'tour.c3': { hl: 'Case bharte hi nateeja: tareekh aa gayi, ya kitne din baaki hain.', hi: 'केस भरते ही नतीजा: तारीख़ आ गई, या कितने दिन बाकी हैं।', en: 'Fill in a case and the answer appears: the date has come, or how many days remain.' },
  'tour.c4': { hl: 'Tareekh aate hi court aur jail Superintendent ke liye arzi taiyar.', hi: 'तारीख़ आते ही अदालत और जेल अधीक्षक के लिए अर्ज़ी तैयार।', en: 'Once the date has come, the court application and the Superintendent’s letter are ready.' },
  'tour.c5': { hl: 'Itne log, aur ek hi kanoon poore desh mein.', hi: 'इतने लोग, और एक ही कानून पूरे देश में।', en: 'This many people, and one law across the whole country.' },
  'tour.c6': { hl: 'Asar ka khaata abhi shunya hai. Yahan andaaze nahi likhe jaate.', hi: 'असर का खाता अभी शून्य है। यहाँ अंदाज़े नहीं लिखे जाते।', en: 'The impact ledger still reads zero. Estimates are never entered here.' },
  'tour.hint': { hl: 'Kahin bhi chhuyein to tour ruk jaata hai.', hi: 'कहीं भी छूएँ तो टूर रुक जाता है।', en: 'Touch anything and the tour stops.' },
};

// ---- runtime ------------------------------------------------------------------------------

let lang = 'hl';
const listeners = new Set();

export function getLang() { return lang; }

export function t(key, params = {}) {
  const entry = S[key];
  if (!entry) return key;
  const raw = entry[lang] ?? entry.en;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`));
}

export function onLang(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.setAttribute('placeholder', t(n.dataset.i18nPh)); });
  root.querySelectorAll('[data-i18n-label]').forEach((n) => { n.setAttribute('aria-label', t(n.dataset.i18nLabel)); });
  root.querySelectorAll('[data-i18n-title]').forEach((n) => { n.setAttribute('title', t(n.dataset.i18nTitle)); });
}

export function setLang(next, { silent = false } = {}) {
  if (!LANGS.includes(next)) return;
  lang = next;
  document.documentElement.lang = HTML_LANG[lang];
  document.documentElement.dataset.lang = lang;
  document.title = t('doc.title');
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', t('doc.desc'));
  try { localStorage.setItem('tareekh.lang', lang); } catch { /* storage may be unavailable */ }
  applyStatic();
  if (!silent) listeners.forEach((fn) => fn(lang));
}

export function initialLang() {
  try {
    const saved = localStorage.getItem('tareekh.lang');
    if (LANGS.includes(saved)) return saved;
  } catch { /* ignore */ }
  return 'hl';
}
