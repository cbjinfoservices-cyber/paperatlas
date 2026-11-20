import { useCallback, useEffect, useState } from 'react';
import type { ListKind } from '@/hooks/useShortlist';

export type Dossier = {
  /** Dossier reference, e.g. PA-2026-0421 */
  ref: string;
  kind: ListKind;
  ids: string[];
  names: string[];
  at: number;
};

const KEY = 'paperatlas:dossiers';
const EVT = 'paperatlas:dossiers-change';
const MAX = 6;

function read(): Dossier[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
      .map((entry) => {
        const kind: ListKind = entry.kind === 'auteurs' ? 'auteurs' : 'entreprises';
        const ids = Array.isArray(entry.ids) ? entry.ids.filter((v): v is string => typeof v === 'string') : [];
        const names = Array.isArray(entry.names) ? entry.names.filter((v): v is string => typeof v === 'string') : [];
        return {
          ref: typeof entry.ref === 'string' ? entry.ref : '',
          kind,
          ids,
          names,
          at: typeof entry.at === 'number' ? entry.at : Date.now(),
        };
      })
      .filter((entry) => entry.ref && entry.ids.length > 0)
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function write(list: Dossier[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage unavailable — the dossier list stays empty */
  }
  window.dispatchEvent(new Event(EVT));
}

/** Remember a dossier so it can be reopened from the directory later. */
export function saveDossier(next: Omit<Dossier, 'at'>) {
  if (typeof window === 'undefined') return;
  if (!next.ref || next.ids.length === 0) return;
  const rest = read().filter((entry) => entry.ref !== next.ref);
  write([{ ...next, at: Date.now() }, ...rest]);
}

export function readDossiers(): Dossier[] {
  return read();
}

export function useDossiers() {
  const [list, setList] = useState<Dossier[]>(() => read());

  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const remove = useCallback((ref: string) => {
    write(read().filter((entry) => entry.ref !== ref));
  }, []);

  const clear = useCallback(() => {
    write([]);
  }, []);

  return { list, remove, clear };
}