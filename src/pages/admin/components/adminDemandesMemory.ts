import type { PeriodeDemandes } from './adminDemandesCsv';

/**
 * La fenêtre de lecture de l'onglet « Demandes » reste d'une visite à l'autre :
 * la période choisie et le jeton « file à traiter ». On retrouve la console
 * dans l'état où on l'a laissée, sans re-cliquer les mêmes boutons.
 *
 * Gardée sur l'appareil seulement : c'est une commodité de lecture, pas un
 * fait du dossier — elle ne se mélange jamais aux demandes elles-mêmes.
 */
const CLE = 'paperatlas:admin-demandes';

/** Les trois périodes connues, dans l'ordre de la barre. */
const PERIODES: PeriodeDemandes[] = ['mois', 'jours30', 'tout'];

export type FiltreDemandes = {
  periode: PeriodeDemandes;
  todoOnly: boolean;
};

/** L'état par défaut : le mois en cours, toute la file. */
export const FILTRE_DEMANDES_DEFAUT: FiltreDemandes = { periode: 'mois', todoOnly: false };

/** Vrai pour une période connue — une valeur abîmée retombe sur le défaut. */
function estPeriode(value: unknown): value is PeriodeDemandes {
  return typeof value === 'string' && PERIODES.includes(value as PeriodeDemandes);
}

/** Ce que la console avait laissé ouvert, ou le défaut si rien n'a été gardé. */
export function readFiltreDemandes(): FiltreDemandes {
  if (typeof window === 'undefined') return FILTRE_DEMANDES_DEFAUT;
  try {
    const raw = window.localStorage.getItem(CLE);
    if (!raw) return FILTRE_DEMANDES_DEFAUT;
    const parsed = JSON.parse(raw) as { periode?: unknown; todoOnly?: unknown } | null;
    if (!parsed) return FILTRE_DEMANDES_DEFAUT;
    return {
      periode: estPeriode(parsed.periode) ? parsed.periode : FILTRE_DEMANDES_DEFAUT.periode,
      todoOnly: parsed.todoOnly === true,
    };
  } catch {
    return FILTRE_DEMANDES_DEFAUT;
  }
}

/** Note l'état courant. Un stockage refusé ne casse rien : le filtre reste
 *  juste, il ne survit simplement pas à la fermeture. */
export function saveFiltreDemandes(filtre: FiltreDemandes): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CLE,
      JSON.stringify({ periode: filtre.periode, todoOnly: filtre.todoOnly }),
    );
  } catch {
    /* Stockage refusé ou plein : la console fonctionne sans mémoire. */
  }
}