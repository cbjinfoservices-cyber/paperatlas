import { paysTrouve } from '@/lib/pays';

/**
 * La région choisie dans le menu d'un tableau.
 *
 * À côté de la rubrique lue, du pays et de l'ordre de lecture, la région fait
 * partie de ce qu'un tableau retient : on quitte les annonces d'Oran, on
 * revient le lendemain, et le tableau se rouvre sur cette région au lieu de
 * rendre l'Algérie entière. Le choix est posé sur l'appareil.
 *
 * Une région ne voyage jamais seule : elle est rangée avec le pays qu'elle
 * habite, et ne se relit que sous ce pays-là. Choisir un autre pays la rend,
 * comme le fait déjà le filtre de la page. Une adresse explicite l'emporte
 * toujours sur le souvenir.
 */
const KEY = 'paperatlas:board-region';

type Entry = { pays: string; wilaya: string };
type Store = Partial<Record<string, Entry>>;

function readStore(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

/** La région retenue sous ce pays, "" quand rien n'a été choisi. */
export function readBoardRegion(board: string, pays: string): string {
  if (!pays) return '';
  const entry = readStore()[board];
  if (!entry || typeof entry.pays !== 'string' || typeof entry.wilaya !== 'string') return '';
  if (entry.pays !== pays) return '';
  return entry.wilaya.trim();
}

/** Garde la région sous son pays, ou l'oublie quand on rend le pays entier. */
export function saveBoardRegion(board: string, pays: string, wilaya: string): void {
  if (typeof window === 'undefined') return;
  const next: Store = { ...readStore() };
  const region = wilaya.trim();
  if (pays && region && paysTrouve(pays)) next[board] = { pays, wilaya: region };
  else delete next[board];
  try {
    if (Object.keys(next).length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible — la région n'est simplement pas mémorisée */
  }
}