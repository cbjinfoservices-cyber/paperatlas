import { useCallback, useEffect, useState } from 'react';

export type ListKind = 'entreprises' | 'auteurs';

const MAX = 4;
const EVT = 'paperatlas:shortlist-change';
const keyOf = (kind: ListKind) => `paperatlas:shortlist:${kind}`;

function read(kind: ListKind): string[] {
  try {
    const raw = window.localStorage.getItem(keyOf(kind));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function write(kind: ListKind, ids: string[]) {
  try {
    window.localStorage.setItem(keyOf(kind), JSON.stringify(ids));
  } catch {
    /* storage unavailable — selection stays in memory */
  }
  window.dispatchEvent(new Event(EVT));
}

export function useShortlist(kind: ListKind) {
  const [ids, setIds] = useState<string[]>(() => (typeof window === 'undefined' ? [] : read(kind)));

  useEffect(() => {
    setIds(read(kind));
    const sync = () => setIds(read(kind));
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [kind]);

  const toggle = useCallback((id: string) => {
    const current = read(kind);
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id].slice(-MAX);
    write(kind, next);
    setIds(next);
  }, [kind]);

  const clear = useCallback(() => {
    write(kind, []);
    setIds([]);
  }, [kind]);

  /** Replace the whole selection, used when a shared link carries a selection. */
  const replace = useCallback((next: string[]) => {
    const cleaned = next.filter((v): v is string => typeof v === 'string' && v.length > 0).slice(0, MAX);
    write(kind, cleaned);
    setIds(cleaned);
  }, [kind]);

  return {
    ids,
    max: MAX,
    toggle,
    clear,
    replace,
    has: (id: string) => ids.includes(id),
    isFull: ids.length >= MAX,
  };
}