import { isFacturation, type Facturation } from '@/pages/offres/components/plans';

/**
 * The rhythm a reader last chose — month by month, or the year with its offered
 * month. It is kept exactly like the country of the prices: one small value,
 * remembered once, read again on every page that shows a Premium figure.
 */
const CLE = 'paperatlas:facturation';
const DEFAUT: Facturation = 'mois';

/** The rhythm kept on this device, when it is one the form knows. */
export function facturationMemorisee(): Facturation | null {
  if (typeof window === 'undefined') return null;
  try {
    const brut = window.localStorage.getItem(CLE);
    return isFacturation(brut) ? brut : null;
  } catch {
    return null;
  }
}

/** Writes the rhythm down, so the next visit opens on the same one. */
function memoriser(courante: Facturation): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, courante);
  } catch {
    /* storage unavailable — the choice simply is not remembered */
  }
}

/** The rhythm read right now, for code outside a component. */
let courante: Facturation = facturationMemorisee() ?? DEFAUT;

const abonnes = new Set<(rythme: Facturation) => void>();

/** The rhythm the prices are shown in, as kept at this moment. */
export function facturationDuPlan(): Facturation {
  return courante;
}

/** Listens to every change of rhythm, and stops listening on request. */
export function abonnerFacturation(fn: (rythme: Facturation) => void): () => void {
  abonnes.add(fn);
  return () => {
    abonnes.delete(fn);
  };
}

/**
 * Changes the rhythm, remembers it, and lets every price on screen follow at
 * once — the same gesture the country selector makes for the money.
 */
export function changerFacturation(valeur: Facturation): void {
  if (!isFacturation(valeur)) return;
  memoriser(valeur);
  if (valeur === courante) return;
  courante = valeur;
  abonnes.forEach((fn) => fn(valeur));
}