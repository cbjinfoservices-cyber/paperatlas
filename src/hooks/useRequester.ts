export type Requester = {
  name: string;
  email: string;
  org: string;
};

const KEY = 'paperatlas:requester';

const EMPTY: Requester = { name: '', email: '', org: '' };

/**
 * Contact details of the person who last sent a quote request. Kept on this
 * device only, so the next request opens already filled in.
 */
export function readRequester(): Requester {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
    const record = parsed as Record<string, unknown>;
    return {
      name: typeof record.name === 'string' ? record.name : '',
      email: typeof record.email === 'string' ? record.email : '',
      org: typeof record.org === 'string' ? record.org : '',
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveRequester(next: Requester) {
  if (typeof window === 'undefined') return;
  const cleaned: Requester = {
    name: next.name.trim(),
    email: next.email.trim(),
    org: next.org.trim(),
  };
  if (!cleaned.name && !cleaned.email && !cleaned.org) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cleaned));
  } catch {
    /* storage unavailable — the details simply are not remembered */
  }
}

export function clearRequester() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}