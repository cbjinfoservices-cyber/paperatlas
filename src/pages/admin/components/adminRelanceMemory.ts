/**
 * « Préparer une relance » laisse une trace : la date du dernier message
 * préparé pour un compte. Elle évite d'écrire deux fois la même chose à deux
 * jours d'intervalle — l'attente n'a pas eu le temps de changer, et le
 * destinataire lirait un rappel pour rien.
 *
 * Gardée sur l'appareil seulement : c'est une commodité de lecture, pas un
 * fait du dossier, et elle ne se mélange jamais aux dépôts eux-mêmes.
 */
const PREFIX = 'paperatlas:admin-relance';

/** Trois jours : en deçà, deux messages se suivent d'assez près pour gêner. */
export const JOURS_RELANCE_PROCHE = 3;

/** Sept jours : la fenêtre du jeton « Relancé cette semaine ». */
export const JOURS_RELANCE_SEMAINE = 7;

/** Les deux tranches que le tableau distingue : le jour même, puis la
 *  semaine écoulée. `today` est aussi compté dans `week`. */
export type RelanceTranche = 'none' | 'today' | 'week';

/** Une mémoire par compte, lue sur l'adresse — la seule clé commune. */
function cle(email?: string | null): string {
  return `${PREFIX}:${(email || '').trim().toLowerCase()}`;
}

/** La date de la dernière relance préparée pour ce compte, ou null. */
export function readRelanceAt(email?: string | null): string | null {
  if (typeof window === 'undefined') return null;
  if (!(email || '').trim()) return null;
  try {
    const raw = window.localStorage.getItem(cle(email));
    if (!raw) return null;
    if (!Number.isFinite(new Date(raw).getTime())) return null;
    return raw;
  } catch {
    return null;
  }
}

/** Note qu'une relance vient d'être préparée, et rend l'instant retenu. */
export function saveRelanceAt(email?: string | null): string | null {
  if (typeof window === 'undefined') return null;
  if (!(email || '').trim()) return null;
  const at = new Date().toISOString();
  try {
    window.localStorage.setItem(cle(email), at);
    return at;
  } catch {
    /* Stockage refusé : la relance reste juste, elle ne laisse pas de trace. */
    return at;
  }
}

/** Vrai quand une relance a été préparée pour ce compte il y a trois jours ou
 *  moins : le jeton du tableau et la pastille de la fiche lisent la même règle. */
export function relanceRecente(email?: string | null): boolean {
  return (joursDepuisRelance(readRelanceAt(email)) ?? 99) <= JOURS_RELANCE_PROCHE;
}

/** La tranche d'une relance : aujourd'hui, dans les sept derniers jours, ou
 *  plus rien à signaler. Une seule lecture de la date, deux jetons qui ne
 *  peuvent pas se contredire. */
export function relanceTranche(email?: string | null): RelanceTranche {
  const jours = joursDepuisRelance(readRelanceAt(email));
  if (jours === null) return 'none';
  if (jours === 0) return 'today';
  if (jours <= JOURS_RELANCE_SEMAINE) return 'week';
  return 'none';
}

/** Les jours écoulés depuis une relance préparée — négatif impossible, nul le
 *  jour même. `null` quand la date manque. */
export function joursDepuisRelance(iso?: string | null): number | null {
  if (!iso) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const stamp = parts
    ? Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(iso).getTime();
  if (!Number.isFinite(stamp)) return null;
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const jours = Math.round((today - stamp) / (24 * 60 * 60 * 1000));
  return jours < 0 ? 0 : jours;
}