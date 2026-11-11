# Tareekh (तारीख़)

Tareekh works out the date on which an undertrial becomes entitled to release under **Section 479 of the Bharatiya Nagarik Suraksha Sanhita (BNSS)**, shows every step of the working, and drafts the court application and the Jail Superintendent's letter in Hindi or English.

Section 479 says an undertrial who has served one-third of the maximum sentence (one-half if previously convicted) for an offence not punishable with death or life imprisonment is to be released on bond. Most people in jail do not know their date. Neither, in practice, does anyone else.

The interface is in Hinglish, Hindi (Devanagari) and English. The legal document drafts are in Hindi or English.

**An agent reads the paper; the law engine decides.** Paste an arrest or custody paper and an agent reads it, looks the sections up, calls the rules engine, asks whatever the paper does not say, and prepares the application. Every step is shown as a trace. The AI never computes a date: see [The agent](#the-agent).

## Run it

```sh
npm install
npm run build        # writes dist/index.html, one self-contained file
npm run dev          # serves it with the agent endpoint on http://localhost:8787
```

Filling the form by hand needs no server, no database and no account, and nothing leaves the browser. Opening `dist/index.html` straight from disk also works; the agent then runs in its offline mode (below).

```sh
npm test             # rules engine, drafts, translations, agent loop, tools, guards, HTTP handler
npm run eval         # the paper-reading checks on the offline reader
```

To switch the AI model on for free, get a key from Google AI Studio (no card) and run `GEMINI_API_KEY=your-key npm run dev`. On Vercel, set the same variable in the project's environment variables. Other providers are listed in [Which model](#which-model).

## What is in the box

| Folder | What it does |
| --- | --- |
| `engine/` | The rules. Plain JavaScript with no dependencies, so it also runs under Node. |
| `engine/section479.js` | `assess()` returns a verdict (`ELIGIBLE`, `NOT_YET`, `EXCLUDED`, `NEEDS_INFO`, `INVALID`), the date, a step-by-step trace, and flags that tell a person when to see a lawyer. |
| `engine/offences.js` | A starter table of common offences with the maximum sentence under both the BNS and the old IPC. |
| `engine/reader.js` | Pattern reader for an arrest or custody paper: picks out the arrest date and the sections. It is the offline reader's eyes. |
| `engine/draft.js` | Builds the application and the letter. Facts that are not known are left as visible `[placeholders]`, never invented. |
| `agent/src/` | The agent: `agent.js` (the loop), `tools.js` (three tools and `finish`), `prompt.js`, `openai.js` and `anthropic.js` (model clients), `provider.js` (which model to use), `local.js` (offline reader), `summary.js` (guards), `redact.js`, `handler.js` (HTTP). |
| `agent/evals/` | `cases.json` (16 papers) and `run.js`. |
| `api/agent.js` | The Vercel function: `POST /api/agent` streams the trace. |
| `web/` | The interface: the tear-off calendar, the case checker, the draft panel, the scale section and the impact ledger. |
| `scripts/build.mjs` | Bundles the interface and the two fonts into `dist/index.html`. |

## How it decides

The engine never guesses. If it is missing a fact, it says which one (`NEEDS_INFO`) and shows what the date would be under each answer. These cases raise a "speak to a lawyer" flag instead of an answer:

- another case is pending against the person (the courts have read Section 479(2) in different ways)
- the offence falls under a special law such as NDPS, UAPA or PMLA
- the offence was committed before 1 July 2024 and the old IPC maximum is lower than the BNS maximum (Article 20(1) of the Constitution applies the lower one, so the form asks when the incident happened)

Offences punishable with death or life imprisonment are marked as not covered.

## The agent

```
paper ─▶ reader (AI model, or the offline reader) ─▶ tools ─┃─▶ law engine ─▶ result
                       ▲                                │    ┃
                       └────────── results ◀────────────┘    ┗ the AI stops here
```

The reader (a language model, or a deterministic offline reader) works in a loop. It may call four tools and nothing else:

| Tool | What it does |
| --- | --- |
| `lookup_offence` | Finds a section in the table and returns its maximum sentence under the BNS and the old IPC. Reports "several versions" or "not in the table" instead of guessing. |
| `check_section_479` | Runs `assess()` from the rules engine. This is the only source of dates and verdicts. |
| `draft_papers` | Builds the court application or the Jail Superintendent letter, only if the verdict is `ELIGIBLE`. |
| `finish` | Ends the run with a short note and the questions the paper left open. |

What keeps it honest:

- **No date comes from the model.** The page draws the verdict and every date from tool results. The model's own note is shown only if every date and year in it matches what a tool returned, and only if it does not talk about entitlement when the verdict is not `ELIGIBLE`. Otherwise the note is rebuilt from the tool result (`agent/src/summary.js`).
- **Nothing is guessed.** A date must be written in the paper. "Never convicted before" and "no other case pending" must come with the exact words from the paper, and the quote is checked against the paper. If the paper is silent the value is `null`, the engine returns `NEEDS_INFO` with both possible dates, and the page asks the person.
- **The paper is data, not instructions.** It is wrapped in `<paper>` tags and the prompt says so. The grounding checks above mean an instruction hidden in a paper cannot invent a date or a quote.
- **Several sections charged:** the tool takes the section with the longest maximum (the cautious choice), any death/life section excludes the case, and the case is flagged for a lawyer (`MULTIPLE_OFFENCES`).
- **Privacy:** phone numbers, ID numbers and emails are stripped in the browser before anything is sent. Names and addresses cannot be found reliably by pattern, so the page tells people to leave them out. The server does not store or log the paper. What the model provider does with it is the provider's rule: Google's free Gemini tier may keep and human-review what it receives, and its terms say not to send personal information, so the page shows a warning in AI mode and the demo should be used with the sample paper or made-up cases. A paid plan with a provider that does not retain data is the right setup for real use.
- **Limits:** 6,000 characters per paper, 8 loop steps, a 25-second timeout per model call and 50 seconds per paper. Per visitor and per day: 6 and 1,500 by default, or 4 and 50 on the free Gemini preset because free quotas are small and shared by every visitor (`TAREEKH_PER_MINUTE`, `TAREEKH_DAILY_LIMIT`). These counters are best-effort on a serverless host; the real limit is the quota or spend limit on the model account. When a quota runs out the page falls back to the offline reader and says so.

**Two modes, one loop.** With a model key set, a model reads the paper. Without one, or when the call fails or the quota runs out, the same loop runs in the browser with the offline reader (`engine/reader.js`). The page says which one ran and why. The offline reader cannot tell from a paper whether the person is a first-time accused, so it always asks.

### Which model

The server picks the first key it finds, free options first (`agent/src/provider.js`):

| Set | Uses | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | Google's free Gemini tier, default model `gemini-3.8-flash` | Free key from Google AI Studio, no card. Small quotas. If the default runs out, try `TAREEKH_MODEL=gemini-3.5-flash-lite`, and check the limits shown in AI Studio. |
| `NVIDIA_API_KEY` | NVIDIA's free hosted models (build.nvidia.com), default `nvidia/nemotron-3.5-bolt-e4b` | Free key, no card, about 40 requests a minute. NVIDIA's trial terms allow testing and evaluation only (not production) and say not to send personal data. |
| `TAREEKH_API_KEY` + `TAREEKH_BASE_URL` + `TAREEKH_MODEL` | Any OpenAI-style endpoint with tool calling (Groq, OpenRouter, a local Ollama) | Not tested here beyond a fake server; read the provider's terms on retention. |
| `ANTHROPIC_API_KEY` | The Anthropic API (paid), default `claude-haiku-5-5` | |

`TAREEKH_PROVIDER=gemini|nvidia|custom|anthropic` forces one when several keys are set.

**Check a model before you rely on it:** `npm run check:model` (with the key set) tests the key, the model name and our tool format in one go and prints the provider's own error if something fails. When the page says "the AI service had a problem", run it, or start the server with `TAREEKH_DEBUG=1` to see the provider's reason in the server log. Neither prints the key or any paper text. `npm run check:model -- --list nemotron` lists the model names your key can use that contain "nemotron". The Gemini and custom paths speak the OpenAI chat format (`agent/src/openai.js`) and convert to and from the loop's own format, so the tools and the guards are the same for every provider.

**Evals.** `agent/evals/cases.json` holds 16 papers: Hinglish and Devanagari notes, two sections at once, a death-or-life section, an unknown section, an ambiguous section, a missing date, a future date, a non-legal paper, and an injected instruction. The expected answers are not typed in by hand; the facts a careful person reads off each paper are fed to the rules engine and the agent must land on the same verdict and dates.

```sh
npm run eval                                          # offline reader, 11 cases that need no model
GEMINI_API_KEY=... npm run eval -- --live --only-ai   # a real model on the 5 cases that need one
GEMINI_API_KEY=... npm run eval -- --live             # a real model on all 16
npm run eval -- --live --only-ai --write              # store the result for the page to show
```

On a free tier the live run spaces its calls out (`TAREEKH_CALL_GAP_MS`, default 6.5 s on Gemini). If cases fail with `rate_limited`, raise it to 13000 or wait for the quota to reset.

The live-model path is covered by tests with a scripted model and a fake model server, but it was written without access to a real model. Run `--live` and read the result before trusting it; the page only shows live-eval numbers once such a run has been written to `web/data/agent-proof.json`.

## Honest limits

- **Not legal advice.** "Entitled to release" is not "released". The court decides, and it can order longer detention after hearing the Public Prosecutor and recording reasons.
- **The offence table is a starter.** It has not yet been reviewed by an advocate; the page says so and shows the date it was last checked. For any other section there is a manual path: enter the maximum sentence written in the law.
- **Ramesh is fictional.** The example on the first screen is computed live from today's date so the number is always right. The real figures on the scale section are from NCRB (Prison Statistics India 2024) and the National Judicial Data Grid; the sources are listed in the page footer.
- **The impact ledger reads zero** and will until a legal-aid partner confirms real cases. Numbers go into `web/data/impact.json` only after a lawyer or jail officer has confirmed them. Estimates are never entered.
- Reading photos and scans of papers is not built yet. Pasted text only.
- With several sections in one case, how Section 479 applies is for a lawyer to say; the tool computes on the longest maximum and flags it.

## Licence

MIT. See `LICENSE`.
