import type { ThreadKindFilter, ThreadSort } from '@/lib/messaging';

/** Ce que la boîte retient d'une visite à l'autre : l'ordre de la liste et la
 *  nature des fils affichés. Le reste — le fil ouvert — vit dans l'adresse. */
export type MsgMemory = {
  sort: ThreadSort;
  kind: ThreadKindFilter;
};

const PREFIX = 'paperatlas:msg-memory:';

const EMPTY: MsgMemory = { sort: 'recent', kind: 'tout' };

/* Une clé par compte : deux personnes qui se connectent sur le même appareil
   ne se prêtent pas leur lecture. */
const keyFor = (userId: string) => `${PREFIX}${userId}`;

function isSort(value: unknown): value is ThreadSort {
  return value === 'recent' || value === 'lent' || value === 'aire';
}

function isKind(value: unknown): value is ThreadKindFilter {
  return value === 'tout' || value === 'candidature' || value === 'libre' || value === 'nonlus';
}

/** Ce que la boîte avait retenu pour ce compte, ou son état d'origine. */
export function readMsgMemory(userId: string): MsgMemory {
  if (typeof window === 'undefined' || !userId) return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return { ...EMPTY };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
    const record = parsed as Record<string, unknown>;
    return {
      sort: isSort(record.sort) ? record.sort : 'recent',
      kind: isKind(record.kind) ? record.kind : 'tout',
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Retient la lecture en cours. L'état d'origine n'est pas écrit : la boîte
 *  reste légère et se rouvre simplement sur son ordre naturel. */
export function saveMsgMemory(userId: string, memory: MsgMemory) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    if (memory.sort === 'recent' && memory.kind === 'tout') {
      window.localStorage.removeItem(keyFor(userId));
      return;
    }
    window.localStorage.setItem(keyFor(userId), JSON.stringify(memory));
  } catch {
    /* stockage indisponible — la lecture n'est simplement pas retenue */
  }
}