import type { RelectureLangue } from './adminRelectureCore';

/**
 * Le resserrement du panneau de relecture retenu d'une visite à l'autre :
 * la langue qu'une pastille d'en-tête avait nommée, et le jeton « cochées d'un
 * seul côté ». On retrouve le panneau dans l'état où on l'a laissé, comme les
 * autres filtres de la console — sans re-cliquer les mêmes boutons.
 *
 * Gardé sur l'appareil seulement : c'est une commodité de lecture, pas un fait
 * du dossier. Un stockage refusé rend simplement le panneau entier.
 */
const CLE = 'paperatlas:admin-relecture-filtre';

/** Les deux langues connues, dans l'ordre où le panneau les présente. */
const LANGUES: RelectureLangue[] = ['ar', 'en'];

export type RelectureFiltre = {
  /** La langue gardée seule, ou rien quand les trente pages sont rendues. */
  langue: RelectureLangue | null;
  /** Le jeton des pages cochées d'un seul côté. */
  desaccord: boolean;
};

/** Le panneau ouvert sur les trente pages : le point de départ. */
export const RELECTURE_FILTRE_DEFAUT: RelectureFiltre = { langue: null, desaccord: false };

/** Vrai pour une langue connue — une valeur abîmée rend le panneau entier. */
function estLangue(value: unknown): value is RelectureLangue {
  return typeof value === 'string' && LANGUES.includes(value as RelectureLangue);
}

/** Ce que la console avait laissé resserré, ou le défaut si rien n'est gardé. */
export function readRelectureFiltre(): RelectureFiltre {
  if (typeof window === 'undefined') return RELECTURE_FILTRE_DEFAUT;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return RELECTURE_FILTRE_DEFAUT;
    const parsed = JSON.parse(brut) as { langue?: unknown; desaccord?: unknown } | null;
    if (!parsed || typeof parsed !== 'object') return RELECTURE_FILTRE_DEFAUT;
    return {
      langue: estLangue(parsed.langue) ? parsed.langue : null,
      desaccord: parsed.desaccord === true,
    };
  } catch {
    return RELECTURE_FILTRE_DEFAUT;
  }
}

/** Note le resserrement courant. Un stockage refusé ne casse rien : le panneau
 *  reste juste, il ne se rejoue simplement pas à la visite suivante. */
export function saveRelectureFiltre(filtre: RelectureFiltre): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CLE,
      JSON.stringify({ langue: filtre.langue, desaccord: filtre.desaccord }),
    );
  } catch {
    /* Stockage refusé ou plein : le panneau fonctionne sans mémoire. */
  }
}