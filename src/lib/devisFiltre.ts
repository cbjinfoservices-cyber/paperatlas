import type { StatutDevis } from '@/lib/devis';

/** The state a quote list is read through: everything, or one of the four. */
export type DevisFiltre = 'tous' | StatutDevis;

const KEY = 'paperatlas:devis-filtre';
const FILTRES: DevisFiltre[] = ['tous', 'recu', 'en_etude', 'confirme', 'expire'];

/** True when an address carries a state the list knows how to read. */
export function estDevisFiltre(value: string | null): value is DevisFiltre {
  return FILTRES.includes(value as DevisFiltre);
}

/**
 * The reading chosen last time stays on the device, so « Mon compte » reopens
 * on it instead of starting over on « Tous ». The strip at the top of « Offres »
 * reads the very same key: narrowing the list there, then opening the account,
 * lands on the same state — one member, one reading.
 */
export function readDevisFiltre(): DevisFiltre {
  if (typeof window === 'undefined') return 'tous';
  try {
    const raw = window.localStorage.getItem(KEY);
    return FILTRES.includes(raw as DevisFiltre) ? (raw as DevisFiltre) : 'tous';
  } catch {
    return 'tous';
  }
}

export function saveDevisFiltre(filtre: DevisFiltre) {
  if (typeof window === 'undefined') return;
  try {
    if (filtre === 'tous') window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, filtre);
  } catch {
    /* the list still filters, it just forgets which state was open */
  }
}