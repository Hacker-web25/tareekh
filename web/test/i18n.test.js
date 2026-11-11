import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { S, LANGS } from '../js/i18n.js';

const here = new URL('..', import.meta.url);
const read = (p) => readFileSync(new URL(p, here), 'utf8');

test('every string exists in Hinglish, Hindi and English', () => {
  for (const [key, entry] of Object.entries(S)) {
    for (const l of LANGS) {
      assert.ok(typeof entry[l] === 'string' && entry[l].trim().length > 0, `${key} is missing "${l}"`);
    }
  }
});

test('the three languages use the same {placeholders}', () => {
  const names = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  for (const [key, entry] of Object.entries(S)) {
    const base = names(entry.en);
    for (const l of LANGS) assert.equal(names(entry[l]), base, `${key}: placeholders differ in "${l}"`);
  }
});

test('Hindi strings are in Devanagari and Hinglish strings are not', () => {
  const dev = /[ऀ-ॿ]/;
  for (const [key, entry] of Object.entries(S)) {
    if (/^(doc\.title)$/.test(key)) continue;
    assert.ok(dev.test(entry.hi) || !/[A-Za-z]{4,}/.test(entry.hi), `${key}: Hindi string has no Devanagari`);
    assert.ok(!dev.test(entry.hl), `${key}: Hinglish string contains Devanagari`);
    assert.ok(!dev.test(entry.en), `${key}: English string contains Devanagari`);
  }
});

test('every key the code and the page ask for exists', () => {
  const used = new Set();
  for (const f of readdirSync(new URL('js/', here))) {
    const src = read(`js/${f}`);
    for (const m of src.matchAll(/\bt\('([a-z0-9._]+)'/g)) used.add(m[1]);
    for (const m of src.matchAll(/'((?:cite|trace|flag|v|act|d|ics|share|im|ft|tour|ag|agent|offence|custom)\.[a-z0-9._]+)'/g)) used.add(m[1]);
  }
  for (const m of read('index.html').matchAll(/data-i18n(?:-ph|-label|-title)?="([^"]+)"/g)) used.add(m[1]);
  const missing = [...used].filter((k) => !(k in S));
  assert.deepEqual(missing, []);
});

test('keys built at run time exist', () => {
  const need = [];
  for (const g of ['property', 'body', 'excluded']) need.push(`offence.group.${g}`);
  for (const r of ['ipc', 'bns']) need.push(`trace.via.${r}`);
  for (const s of ['pass', 'fail']) need.push(`trace.death_life.${s}`, `trace.reached.${s}`);
  for (const s of ['pass', 'warn', 'info']) need.push(`trace.pending.${s}`);
  for (const r of ['arrest_in_future', 'arrest_date', 'bail_exceeds_custody', 'delay_exceeds_custody', 'negative_days', 'as_of']) need.push(`v.invalid.${r}`);
  for (const f of ['PENDING_CASES', 'SPECIAL_LAW', 'MAX_TERM_REACHED', 'VERIFY_PENDING_CASES', 'IPC_MAX_APPLIED', 'REPEAT_ENHANCED', 'SECOND_PROVISO', 'MULTIPLE_OFFENCES']) need.push(`flag.${f}`);
  for (let n = 1; n <= 7; n += 1) need.push(`tour.c${n}`);
  for (const v of ['ELIGIBLE', 'NOT_YET', 'NEEDS_INFO', 'EXCLUDED', 'INVALID']) need.push(`ag.v.${v}`);
  for (const w of ['rate_limited', 'budget', 'no_key', 'network', 'timeout', 'upstream', 'other']) need.push(`ag.why.${w}`);
  for (let n = 1; n <= 5; n += 1) need.push(`im.r${n}`);
  assert.deepEqual(need.filter((k) => !(k in S)), []);
});

test('ids the scripts look for are in the page', () => {
  const html = read('index.html');
  const ids = new Set();
  for (const f of readdirSync(new URL('js/', here))) {
    for (const m of read(`js/${f}`).matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g)) ids.add(m[1]);
  }
  // created by the scripts themselves
  for (const own of ['actDraft', 'actWa', 'actIcs', 'vsheet', 'pasteApply', 'appliedNote', 'printRoot', 'tourCap']) ids.delete(own);
  const missing = [...ids].filter((id) => !html.includes(`id="${id}"`));
  assert.deepEqual(missing, []);
});
