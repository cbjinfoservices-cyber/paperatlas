import { estEssai, estFerme, joursAvant, type AdminAbonnement } from './adminTypes';

/**
 * Ce qu'un abonnement peut encore rapporter, lu sur la seule ligne que la base
 * enregistre : son état, son montant, son moyen de paiement et son échéance.
 *
 * L'écran « Paiements » ne devine rien : il nomme, ligne par ligne, ce qui
 * empêche un abonnement d'être encaissé, et laisse le reste au prélèvement.
 */
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
  /** Un abonnement encaissable sans intervention : ouvert, chiffré, prélevable. */
  encaissable: boolean;
  /** La clé de dictionnaire qui dit pourquoi il l'est, ou ne l'est pas. */
  cle: string;
};

/** Un moyen de paiement qui se prélève sans qu'on y touche. */
const CANAL_MANUEL = /esp[eè]ce|cash|liquide|virement|ch[eè]que|cheque|manuel|main propre|sur place|à la main|a la main/i;

/**
 * Un moyen de paiement est prélevable quand il est nommé et qu'il n'est pas
 * manuel. Un canal vide ne l'est pas : on ne prélève pas sur une case blanche.
 */
export function canalAutomatique(canal?: string | null): boolean {
  const texte = (canal || '').trim();
  if (!texte) return false;
  return !CANAL_MANUEL.test(texte);
}

/**
 * La lecture d'une ligne. L'ordre compte : un abonnement clos n'a plus rien à
 * encaisser, quel que soit son montant ; un montant vide ne se prélève pas ;
 * un essai n'est pas encore dû ; une échéance passée est à recouvrer, pas à
 * percevoir. Tout cela est dit avant de conclure « prêt ».
 */
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

/** La couleur d'une raison, celle des pastilles de la console. */
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
  /** Ce que le mois rapporte déjà, sur les seules lignes encaissables. */
  montantPret: number;
  /** Ce qui attend, montant renseigné, abonnement ouvert. */
  montantRegler: number;
  /** Le nombre de lignes par raison, pour dire ce qui bloque en un coup d'œil. */
  parRaison: Array<{ etat: EtatEncaissement; n: number }>;
};

/** Les quatre chiffres de l'écran, lus sur les mêmes lignes que le tableau. */
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

/**
 * L'ordre de lecture de la file : les échéances dépassées et les moyens de
 * paiement manquants d'abord, la plus ancienne en tête — c'est là que
 * l'encaissement se perd. Les lignes prêtes ferment la marche.
 */
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
    const ecart = rang[lireEncaissement(a).etat] - rang[lireEncaissement(b).etat];
    if (ecart !== 0) return ecart;
    return stamp(a.date_echeance) - stamp(b.date_echeance);
  });
}