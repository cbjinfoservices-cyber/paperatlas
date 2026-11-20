import { useMemo } from 'react';

const REFS_KEY = 'paperatlas:quote-refs';
const SEQ_KEY = 'paperatlas:quote-seq';
const MAX_REFS = 40;

type RefStore = Record<string, string>;

function readStore(): RefStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(REFS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: RefStore = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([key, value]) => {
      if (typeof value === 'string') out[key] = value;
    });
    return out;
  } catch {
    return {};
  }
}

function writeStore(store: RefStore) {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(store);
    const trimmed: RefStore = {};
    keys.slice(Math.max(0, keys.length - MAX_REFS)).forEach((key) => {
      trimmed[key] = store[key];
    });
    window.localStorage.setItem(REFS_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage unavailable — the reference simply is not remembered */
  }
}

function nextSequence(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const current = Number(window.localStorage.getItem(SEQ_KEY) || '0');
    const next = Number.isFinite(current) && current > 0 ? current + 1 : 1;
    window.localStorage.setItem(SEQ_KEY, String(next));
    return next;
  } catch {
    return Math.floor(Math.random() * 900) + 100;
  }
}

/**
 * Reference of a selection, e.g. PA-2026-0421. The same selection always gets
 * the same reference, so a printed sheet and the grouped quote request can be
 * matched by the workshops.
 */
export function refForSelection(key: string): string {
  if (!key) return '';
  if (typeof window === 'undefined') return '';
  const store = readStore();
  if (store[key]) return store[key];
  const year = new Date().getFullYear();
  const reference = `PA-${year}-${String(nextSequence()).padStart(4, '0')}`;
  store[key] = reference;
  writeStore(store);
  return reference;
}

/** Stable reference for a given kind + set of ids (order does not matter). */
export function useQuoteRef(kind: string, ids: string[]): string {
  const key = `${kind}:${[...ids].sort().join(',')}`;
  return useMemo(() => refForSelection(key), [key]);
}