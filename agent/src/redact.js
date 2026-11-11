// Strips identifiers from a paper BEFORE it is sent to any model.
// This is a safety net, not a guarantee: names and addresses cannot be found reliably by pattern,
// so the prompt also tells the model not to repeat them, and the server never stores the text.

const DEV = /[०-९]/g;
const ascii = (s) => s.replace(DEV, (c) => String(c.charCodeAt(0) - 0x0966));

export function redact(input) {
  let text = ascii(String(input ?? ''));
  const removed = { emails: 0, phones: 0, ids: 0 };
  text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, () => { removed.emails += 1; return '[email]'; });
  // 12-digit identity numbers, written solid or in groups of four.
  text = text.replace(/(?<![\d/-])(?<!\d\.)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?![\d/-])(?!\.\d)/g, () => { removed.ids += 1; return '[id-number]'; });
  // Mobile numbers, with or without +91.
  text = text.replace(/(?<![\d/-])(?<!\d\.)(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\d/-])(?!\.\d)/g, () => { removed.phones += 1; return '[phone]'; });
  return { text, removed, changed: removed.emails + removed.phones + removed.ids > 0 };
}

export const MAX_PAPER_CHARS = 6000;
