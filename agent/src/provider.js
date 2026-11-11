// Which model the server talks to, decided from environment variables. Free options come first.
//
//   GEMINI_API_KEY     Google's free Gemini tier (a key from Google AI Studio, no card needed)
//   NVIDIA_API_KEY     NVIDIA's free hosted models at build.nvidia.com (trial terms: testing and evaluation only)
//   TAREEKH_API_KEY    any OpenAI-style endpoint: also set TAREEKH_BASE_URL and TAREEKH_MODEL
//   ANTHROPIC_API_KEY  the Anthropic API (paid)
//
// TAREEKH_PROVIDER=gemini|nvidia|custom|anthropic forces one; otherwise the first key found wins, in that order.
// TAREEKH_MODEL overrides the model name for whichever provider is chosen.

import { createAnthropicClient, DEFAULT_MODEL as ANTHROPIC_MODEL } from './anthropic.js';
import { createOpenAIClient } from './openai.js';

export const PRESETS = {
  gemini: {
    kind: 'openai',
    keyEnv: 'GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.8-flash',
    style: 'gemini',
    extras: { reasoning_effort: 'low' },
    free: true,
    // Google's free tier may keep and review what it receives, and its own terms say not to send personal information.
    disclose: true,
    // Free quotas are small and shared by every visitor, so the defaults are small too.
    perMinute: 4,
    dailyLimit: 50,
  },
  nvidia: {
    kind: 'openai',
    keyEnv: 'NVIDIA_API_KEY',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    model: 'nvidia/nemotron-3.5-bolt-e4b',
    style: 'json',
    extras: {},
    free: true,
    disclose: true, // trial terms: not for production, and no personal data
    perMinute: 6,
    dailyLimit: 100,
  },
  custom: {
    kind: 'openai',
    keyEnv: 'TAREEKH_API_KEY',
    style: 'json',
    extras: {},
    free: false,
    disclose: true, // we cannot know what an arbitrary provider keeps, so say so
  },
  anthropic: {
    kind: 'anthropic',
    keyEnv: 'ANTHROPIC_API_KEY',
    model: ANTHROPIC_MODEL,
    free: false,
    disclose: false,
  },
};

const ORDER = ['gemini', 'nvidia', 'custom', 'anthropic'];

/** @returns {null | {name: string, apiKey: string, model: string, baseUrl?: string, kind: string, style?: string, extras?: object, free: boolean, disclose: boolean, perMinute?: number, dailyLimit?: number}} */
export function resolveProvider(env = process.env) {
  const forced = String(env.TAREEKH_PROVIDER || '').toLowerCase();
  const names = forced ? [forced] : ORDER;
  for (const name of names) {
    const p = PRESETS[name];
    if (!p) continue;
    const apiKey = env[p.keyEnv] || '';
    if (!apiKey) continue;
    const model = env.TAREEKH_MODEL || p.model || '';
    const baseUrl = env.TAREEKH_BASE_URL || p.baseUrl || '';
    if (p.kind === 'openai' && (!model || !baseUrl)) continue; // a custom endpoint needs both
    return { name, apiKey, model, baseUrl, kind: p.kind, style: p.style, extras: p.extras, free: p.free, disclose: p.disclose, perMinute: p.perMinute, dailyLimit: p.dailyLimit };
  }
  return null;
}

export function createClient(provider, { fetchImpl, callGapMs = 0, onError } = {}) {
  if (provider.kind === 'anthropic') return createAnthropicClient({ apiKey: provider.apiKey, model: provider.model, fetchImpl });
  return createOpenAIClient({
    apiKey: provider.apiKey,
    model: provider.model,
    baseUrl: provider.baseUrl,
    style: provider.style,
    extras: provider.extras,
    fetchImpl,
    callGapMs,
    onError,
  });
}
