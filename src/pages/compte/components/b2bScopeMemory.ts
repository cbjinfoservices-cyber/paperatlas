import type { B2bStatut } from '@/lib/b2b';

/**
 * The states counted in the « Synthèse » tab of the export, remembered per
 * account: an export opened a week later must not count a scope nobody chose
 * again — the picker reopens where it was left.
 */
const PREFIX = 'paperatlas.b2b.exportScope';

/** The three states, in the order the inbox names them. */
export const SCOPE_ALL: B2bStatut[] = ['nouvelle', 'vue', 'traitee'];

/** One memory per account: two members on the same browser never share it. */
export function scopeKey(userId: string) {
  return `${PREFIX}.${userId}`;
}

/**
 * The stored scope, in the inbox order, or the three states when nothing
 * readable is there. At least one state always comes back: a summary that
 * counts nothing would look like an empty inbox rather than a choice.
 */
export function readScope(key: string): B2bStatut[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return SCOPE_ALL;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SCOPE_ALL;
    const kept = SCOPE_ALL.filter((statut) => parsed.includes(statut));
    return kept.length > 0 ? kept : SCOPE_ALL;
  } catch {
    return SCOPE_ALL;
  }
}

/** Best-effort, like the rest of the account memory: private mode must not break the export. */
export function saveScope(key: string, statuts: B2bStatut[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(statuts));
  } catch {
    /* the export still works, it just forgets the scope */
  }
}