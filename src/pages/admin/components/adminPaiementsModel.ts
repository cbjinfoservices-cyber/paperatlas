import { estEssai, estFerme, joursAvant, type AdminAbonnement } from './adminTypes';

export type EtatEncaissement =
  | 'pret'
  | 'essai'
  | 'sansMontant'
  | 'sansCanal'
  | 'manuel'
  | 'retard'
  | 'ferme';

export type LectureEncaissement = {
  etat: EtatEncaissement;
  encaissable: boolean;
  cle: string;
};

const CANAL_MANUEL =
  /esp[eè]ce|cash|liquide|virement|ch[eè]que|cheque|manuel|main propre|sur place|à la main|a la main/i;

export function canalAutomatique(canal?: string | null): boolean {
  const texte = (canal || '').trim();
  return Boolean(texte) && !CANAL_MANUEL.test(texte);
}

export function lireEncaissement(row: AdminAbonnement): LectureEncaissement {
  const statut = (row.statut || '').trim().toLowerCase();
  const montant = Number(row.montant_mensuel ?? 0);
  const canal = (row.canal_paiement || '').trim();
  const jours = joursAvant(row.date_echeance);

  if (estFerme(statut)) {
    return { etat: 'ferme', encaissable: false, cle: 'ad.pay.why.ferme' };
  }
  if (!Number.isFinite(montant) || montant <= 0) {
    return { etat: 'sansMontant', encaissable: false, cle: 'ad.pay.why.sansMontant' };
  }
  if (!canal) {
    return { etat: 'sansCanal', encaissable: false, cle: 'ad.pay.why.sansCanal' };
  }
  if (!canalAutomatique(canal)) {
    return { etat: 'manuel', encaissable: false, cle: 'ad.pay.why.manuel' };
  }
  if (estEssai(statut)) {
    return { etat: 'essai', encaissable: false, cle: 'ad.pay.why.essai' };
  }
  if (jours !== null && jours < 0) {
    return { etat: 'retard', encaissable: false, cle: 'ad.pay.why.retard' };
  }
  return { etat: 'pret', encaissable: true, cle: 'ad.pay.why.pret' };
}

export const TON_ETAT: Record<EtatEncaissement, 'ok' | 'warn' | 'off' | 'soft'> = {
  pret: 'ok',
  essai: 'soft',
  sansMontant: 'warn',
  sansCanal: 'warn',
  manuel: 'warn',
  retard: 'off',
  ferme: 'off',
};

export type SynthesePaiements = {
  total: number;
  prets: number;
  aRegler: number;
  montantPret: number;
  montantRegler: number;
  parRaison: Array<{ etat: EtatEncaissement; n: number }>;
};

export function synthesePaiements(rows: AdminAbonnement[]): SynthesePaiements {
  const parRaison = new Map<EtatEncaissement, number>();
  let prets = 0;
  let montantPret = 0;
  let montantRegler = 0;

  rows.forEach((row) => {
    const lecture = lireEncaissement(row);
    parRaison.set(lecture.etat, (parRaison.get(lecture.etat) ?? 0) + 1);
    const montant = Number(row.montant_mensuel ?? 0);
    const chiffre = Number.isFinite(montant) && montant > 0 ? montant : 0;
    if (lecture.encaissable) {
      prets += 1;
      montantPret += chiffre;
    } else if (chiffre > 0 && lecture.etat !== 'ferme') {
      montantRegler += chiffre;
    }
  });

  const ordre: EtatEncaissement[] = [
    'pret',
    'retard',
    'sansCanal',
    'manuel',
    'sansMontant',
    'essai',
    'ferme',
  ];

  return {
    total: rows.length,
    prets,
    aRegler: rows.length - prets,
    montantPret,
    montantRegler,
    parRaison: ordre
      .filter((etat) => (parRaison.get(etat) ?? 0) > 0)
      .map((etat) => ({ etat, n: parRaison.get(etat) ?? 0 })),
  };
}

export function triPaiements(rows: AdminAbonnement[]): AdminAbonnement[] {
  const rang: Record<EtatEncaissement, number> = {
    retard: 0,
    sansCanal: 1,
    manuel: 2,
    sansMontant: 3,
    essai: 4,
    pret: 5,
    ferme: 6,
  };
  const stamp = (iso?: string | null) => {
    if (!iso) return Number.POSITIVE_INFINITY;
    const value = new Date(iso).getTime();
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  };

  return [...rows].sort((a, b) => {
    const aRang = rang[lireEncaissement(a).etat];
    const bRang = rang[lireEncaissement(b).etat];
    if (aRang !== bRang) return aRang - bRang;
    return stamp(a.date_echeance) - stamp(b.date_echeance);
  });
}
