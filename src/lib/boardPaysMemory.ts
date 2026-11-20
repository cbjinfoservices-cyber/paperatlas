import { paysTrouve } from '@/lib/pays';

/**
 * Le pays choisi dans le menu d'un tableau.
 *
 * À côté de la rubrique lue et de l'ordre de lecture, le pays fait partie de ce
 * qu'un tableau retient : on quitte les annonces d'Algérie, on revient le
 * lendemain, et le tableau se rouvre sur ce même pays au lieu de rendre le
 * monde arabe entier. Le choix est posé sur l'appareil, comme la rubrique —
 * une adresse explicite, elle, l'emporte toujours : un lien partagé montre ce
 * qu'il annonce, jamais ce dont on se souvient.
 *
 * Un pays inconnu n'est pas retenu : la mémoire ne garde qu'un code que la
 * liste des pays sait nommer.
 */
const KEY = 'paperatlas:board-pays';

type Store = Partial<Record<string, string>>;

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

/** Le pays retenu la dernière fois sur ce tableau, "" quand rien n'a été choisi. */
export function readBoardPays(board: string): string {
  const value = readStore()[board];
  if (typeof value !== 'string' || !value) return '';
  return paysTrouve(value) ? value : '';
}

/** Garde le pays choisi, ou l'oublie quand on rend le tableau entier. */
export function saveBoardPays(board: string, code: string): void {
  if (typeof window === 'undefined') return;
  const next: Store = { ...readStore() };
  if (code && paysTrouve(code)) next[board] = code;
  else delete next[board];
  try {
    if (Object.keys(next).length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible — le pays n'est simplement pas mémorisé */
  }
}