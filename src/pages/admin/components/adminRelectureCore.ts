/**
 * Les trente lignes de relecture du plan (§11), lues dans la console.
 *
 * Le contenu reste en français : c'est la langue du document de travail, et
 * ces lignes décrivent des écrans et des fichiers, pas un texte destiné au
 * visiteur. Chaque ligne porte une case arabe et une case anglais, gardées sur
 * l'appareil : la relecture se mène dans la console, sans rien écrire en base.
 */

import { useEffect, useState } from 'react';
import type { TriTranchesOuvertes } from './adminFriseTriMemory';

export type RelectureLigne = {
  /** Le rang de passage, de 1 à 30 — l'ordre du plan, pas un identifiant. */
  n: number;
  /** L'écran tel qu'il se nomme dans le plan. */
  page: string;
  /** Son adresse, ou « toutes » quand elle vaut partout. */
  path: string;
  /** Le fichier de textes qu'elle traverse. */
  textes: string;
  /** Ce qui se relit là, d'un coup d'œil. */
  vigilance: string;
};

export const RELECTURE_LIGNES: RelectureLigne[] = [
  {
    n: 1,
    page: 'Accueil, les cinq chapitres',
    path: '/',
    textes: 'dict.ts (b1–b5, man)',
    vigilance: 'Chiffres (22 pays, 50 000 exemplaires), titres à deux lignes, mots mis en accent',
  },
  {
    n: 2,
    page: 'Cartographie et sous-traitance',
    path: '/',
    textes: 'dict.ts (map, mk, sub)',
    vigilance: 'Noms de villes, phrase de la recherche intelligente',
  },
  {
    n: 3,
    page: 'Barre et pied de page',
    path: 'toutes',
    textes: 'dict.ts (nav, foot, lang), dict.navmenu.ts',
    vigilance: 'Les deux marques, les huit familles, les six portes',
  },
  {
    n: 4,
    page: 'Annuaire, filtres et cartes',
    path: '/annuaire',
    textes: 'dict.ts (dir, gen, sort, radius, share)',
    vigilance: '« Tout rendre », états vides nommant le lieu, compteurs',
  },
  {
    n: 5,
    page: 'Page d’un type',
    path: '/annuaire/imprimeries',
    textes: 'dict.trade.ts',
    vigilance: 'Paragraphe éditorial du métier, nom de famille',
  },
  {
    n: 6,
    page: 'Page type et pays',
    path: '/annuaire/imprimeries/algerie',
    textes: 'dict.tradePlace.ts',
    vigilance: 'Phrase d’ouverture propre au pays, région la plus active',
  },
  {
    n: 7,
    page: 'Fiche d’un atelier',
    path: '/entreprise/:id',
    textes: 'dict.ts (pro), dict.walk.ts',
    vigilance: 'Horaires, certifications, carnet de parcours, porte vide',
  },
  {
    n: 8,
    page: 'Onglet Auteurs',
    path: '/annuaire (Auteurs)',
    textes: 'dict.ts (auth, genre, dir.authors)',
    vigilance: 'Genres littéraires, distinctions, états vides',
  },
  {
    n: 9,
    page: 'Fiche d’un auteur',
    path: '/auteur/:id',
    textes: 'dict.ts (auth), dict.walk.ts',
    vigilance: 'Ouvrages, disponibilité, plumes voisines',
  },
  {
    n: 10,
    page: 'Une carte par pays',
    path: '/annuaire (Carte)',
    textes: 'dict.cmaps.ts',
    vigilance: '22 pays, noms de régions, « déjà exportés »',
  },
  {
    n: 11,
    page: 'Arabe World',
    path: '/arabe-world',
    textes: 'dict.world.ts',
    vigilance: 'Les deux noms de la maison, les trois langues',
  },
  {
    n: 12,
    page: 'Formules et tarifs',
    path: '/offres',
    textes: 'dict.offres.ts',
    vigilance: '1 500 DZD, « sur devis », six lignes du comparatif',
  },
  {
    n: 13,
    page: 'Composeur de devis',
    path: '/offres/devis',
    textes: 'dict.devis.ts',
    vigilance: 'Montants, mensuel/annuel, envoi et relance',
  },
  {
    n: 14,
    page: 'Guichets réunis',
    path: '/demandes',
    textes: 'dict.guichets.ts',
    vigilance: 'Les trois usages, ce qui suit l’envoi',
  },
  {
    n: 15,
    page: 'Demande B2B',
    path: '/demande-b2b',
    textes: 'dict.b2b.ts',
    vigilance: 'Grand tirage, sous-traitance, pièces jointes',
  },
  {
    n: 16,
    page: 'Marché public',
    path: '/demande-marche',
    textes: 'dict.marche.ts',
    vigilance: 'Vocabulaire de l’appel d’offres, deux PDF',
  },
  {
    n: 17,
    page: 'Annonces et fiche',
    path: '/annonces, /annonces/:id',
    textes: 'dict.ts (ann)',
    vigilance: 'Rubriques, prix et devise, texte copié',
  },
  {
    n: 18,
    page: 'Emplois et fiche',
    path: '/emplois, /emplois/:id',
    textes: 'dict.ts (job, jobd), dict.recrutement.ts',
    vigilance: 'Contrats, salaire, référence partagée',
  },
  {
    n: 19,
    page: 'Vivier de candidats',
    path: '/candidats',
    textes: 'dict.candidats.ts',
    vigilance: '« profils », compteurs, profils à porte vide',
  },
  {
    n: 20,
    page: 'Fiche d’un candidat',
    path: '/candidats/:id',
    textes: 'dict.candidat.ts',
    vigilance: 'Profil anonyme, métier, rayon d’origine',
  },
  {
    n: 21,
    page: 'Déposer une annonce',
    path: '/deposer',
    textes: 'dict.ts (dep)',
    vigilance: 'Promesse de relecture sous 24 h, 500 caractères',
  },
  {
    n: 22,
    page: 'Compte, connexion, inscription',
    path: '/compte, /compte/connexion, /compte/inscription',
    textes: 'dict.ts (acct)',
    vigilance: 'Messages d’erreur, sécurité, suppression',
  },
  {
    n: 23,
    page: 'Profil candidat et CV',
    path: '/compte/profil-candidat',
    textes: 'dict.candidat.ts',
    vigilance: 'Dépôt et remplacement du CV',
  },
  {
    n: 24,
    page: 'Messagerie',
    path: '/messages',
    textes: 'dict.candidat.ts (msg), dict.b2b.ts',
    vigilance: '« fil libre » / « fil de candidature », non-lus',
  },
  {
    n: 25,
    page: 'Suivi d’un dossier',
    path: '/suivi',
    textes: 'dict.suivi.ts',
    vigilance: 'Référence, portes rappelées, portes vides',
  },
  {
    n: 26,
    page: 'Plan du site',
    path: '/plan-du-site',
    textes: 'dict.ts, dict.walk.ts',
    vigilance: 'Les huit familles, les portes du réseau',
  },
  {
    n: 27,
    page: 'Console d’administration',
    path: '/admin',
    textes: 'dict.admin.ts',
    vigilance: 'Huit onglets ; texte interne, ton plus sec accepté',
  },
  {
    n: 28,
    page: 'Mentions légales, confidentialité',
    path: '/mentions-legales, /confidentialite',
    textes: 'dict.legal.ts',
    vigilance: 'Relecture juridique, pas seulement linguistique',
  },
  {
    n: 29,
    page: 'Page introuvable, états vides',
    path: '*',
    textes: 'dict.ts',
    vigilance: 'Toutes les phrases vides, avec et sans lieu',
  },
  {
    n: 30,
    page: 'E-mails des fonctions serveur',
    path: 'hors site',
    textes: 'supabase/functions/*',
    vigilance:
      'Les trois confirmations existent en arabe et en anglais ; le reçu B2B et celui de la candidature se relisent sur téléphone : sens de lecture, police, formulations',
  },
];

export const RELECTURE_TOTAL = RELECTURE_LIGNES.length;

/**
 * La première tournée : les dix premiers écrans du plan, dans l'ordre de
 * passage. C'est par eux que la relecture commence — l'accueil, ses chapitres,
 * la barre et le pied de page, l'annuaire et sa première page de type —, parce
 * que ce sont ceux que tout visiteur voit, et ceux dont les mots reviennent
 * partout ailleurs.
 *
 * Le chiffre vit ici et non dans le panneau : la tournée se compte sur la même
 * liste que le reste, et changer son étendue ne demande qu'une ligne.
 */
export const PREMIERE_TOURNEE = 10;

/** Le dernier rang de la seconde tournée : les écrans 11 à 20 du plan. */
export const SECONDE_TOURNEE = 20;

/**
 * Une tournée : une tranche de la liste de relecture, parcourue dans l'ordre du
 * plan, l'arabe d'abord puis les mêmes écrans en anglais.
 *
 * La tournée n'est pas un filtre de plus : c'est par elle que la relecture
 * commence, parce que ces écrans sont ceux que tout visiteur voit et ceux dont
 * les mots reviennent partout ailleurs. Deux tranches aujourd'hui, et la même
 * mécanique les porte toutes : compter ce qui reste, puis cocher d'un geste.
 */
export type RelectureTournee = {
  /** Le rang de la tournée, celui que l'écran affiche. */
  id: number;
  /** Le premier rang qu'elle couvre. */
  de: number;
  /** Le dernier rang qu'elle couvre. */
  a: number;
};

export const RELECTURE_TOURNEE_1: RelectureTournee = { id: 1, de: 1, a: PREMIERE_TOURNEE };
export const RELECTURE_TOURNEE_2: RelectureTournee = {
  id: 2,
  de: PREMIERE_TOURNEE + 1,
  a: SECONDE_TOURNEE,
};

/** Les tournées, dans l'ordre où la relecture les traverse. */
export const RELECTURE_TOURNEES: RelectureTournee[] = [
  RELECTURE_TOURNEE_1,
  RELECTURE_TOURNEE_2,
];

/** Une tournée par son rang, ou rien quand le rang n'en désigne aucune. */
export function tourneeParId(id: number): RelectureTournee | null {
  return RELECTURE_TOURNEES.find((tournee) => tournee.id === id) ?? null;
}

/** La tournée qui couvre un rang du plan, ou rien quand il reste hors tournée. */
export function tourneeDeRang(n: number): RelectureTournee | null {
  return RELECTURE_TOURNEES.find((tournee) => n >= tournee.de && n <= tournee.a) ?? null;
}

/** Les rangs d'une tournée, lus sur la liste du plan et jamais recomptés. */
export function rangsTournee(tournee: RelectureTournee): number[] {
  return RELECTURE_LIGNES
    .filter((ligne) => ligne.n >= tournee.de && ligne.n <= tournee.a)
    .map((ligne) => ligne.n);
}

/** Ce que la première tournée porte, langue par langue, et ce qui lui reste. */
export type TourneeCompte = {
  /** Le rang de la tournée comptée. */
  id: number;
  /** Le premier écran qu'elle couvre. */
  de: number;
  /** Le dernier écran qu'elle couvre. */
  a: number;
  /** Combien de ses écrans sont cochés en arabe. */
  ar: number;
  /** Combien le sont en anglais. */
  en: number;
  /** Combien le sont des deux côtés. */
  deux: number;
  /** Combien il reste à cocher en arabe. */
  resteAr: number;
  /** Combien il reste à cocher en anglais. */
  resteEn: number;
  /** Les écrans qui restent à cocher en arabe, dans l'ordre du plan : la
   *  pastille d'en-tête les nomme au survol, pour choisir par où reprendre. */
  restantsAr: number[];
  /** Les mêmes, côté anglais. */
  restantsEn: number[];
  /** Le nombre d'écrans de la tournée. */
  total: number;
};

/**
 * Le compte d'une tournée, lu sur le même carnet que les trente pages :
 * l'arabe se lit en premier, l'anglais reprend les mêmes écrans ensuite, et
 * l'accord des deux ferme le compte.
 */
export function compteTournee(
  etat: RelectureEtat,
  tournee: RelectureTournee = RELECTURE_TOURNEE_1,
): TourneeCompte {
  const rangs = rangsTournee(tournee);
  const ar = rangs.filter((n) => etat.ar.includes(n)).length;
  const en = rangs.filter((n) => etat.en.includes(n)).length;
  const deux = rangs.filter((n) => etat.ar.includes(n) && etat.en.includes(n)).length;
  return {
    id: tournee.id,
    de: tournee.de,
    a: tournee.a,
    ar,
    en,
    deux,
    resteAr: Math.max(rangs.length - ar, 0),
    resteEn: Math.max(rangs.length - en, 0),
    /* Les rangs eux-mêmes, et pas seulement leur nombre : une pastille qui dit
       « 4 encore » ne dit pas lesquels. */
    restantsAr: rangs.filter((n) => !etat.ar.includes(n)),
    restantsEn: rangs.filter((n) => !etat.en.includes(n)),
    total: rangs.length,
  };
}

/** Le compte de la première tournée — les dix premiers écrans du plan. */
export function comptePremiereTournee(etat: RelectureEtat): TourneeCompte {
  return compteTournee(etat, RELECTURE_TOURNEE_1);
}

/**
 * Le côté par lequel une tournée continue : l'arabe tant qu'il n'est pas
 * complet, puis l'anglais sur les mêmes écrans. `null` quand ses écrans sont
 * relus des deux côtés — le geste n'a alors plus rien à cocher.
 */
export function prochainCoteTournee(
  etat: RelectureEtat,
  tournee: RelectureTournee = RELECTURE_TOURNEE_1,
): RelectureLangue | null {
  const rangs = rangsTournee(tournee);
  if (rangs.some((n) => !etat.ar.includes(n))) return 'ar';
  if (rangs.some((n) => !etat.en.includes(n))) return 'en';
  return null;
}

/**
 * Le premier écran d'une tournée que la relecture n'a pas encore fermé —
 * coché d'un seul côté ou d'aucun —, dans l'ordre du plan. C'est celui par
 * lequel on reprend : la ligne de la tournée en fait une porte, pour
 * enchaîner sans chercher son rang dans la liste.
 *
 * `null` quand les dix écrans sont relus des deux côtés : il n'y a plus rien
 * à rouvrir, et le panneau le dit au lieu d'inventer une porte.
 */
export function premierEcranTournee(
  etat: RelectureEtat,
  tournee: RelectureTournee = RELECTURE_TOURNEE_1,
): number | null {
  return (
    rangsTournee(tournee).find((n) => !etat.ar.includes(n) || !etat.en.includes(n)) ?? null
  );
}

/**
 * Coche d'un geste les écrans d'une tournée dans une langue — l'arabe d'abord,
 * puis les mêmes en anglais. Le carnet n'est jamais écrasé : les rangs déjà
 * cochés restent, et rien hors de la tournée ne bouge.
 */
export function marquerTournee(
  etat: RelectureEtat,
  langue: RelectureLangue,
  tournee: RelectureTournee = RELECTURE_TOURNEE_1,
): RelectureEtat {
  const liste = Array.from(new Set([...etat[langue], ...rangsTournee(tournee)])).sort(
    (a, b) => a - b,
  );
  return { ...etat, [langue]: liste };
}

/**
 * Le nom d'une tournée tel qu'il se lit dans les fichiers emportés —
 * « Tournée 2 (11–20) » —, ou rien pour un écran qui n'appartient à aucune.
 */
export function etiquetteTournee(n: number): string {
  const tournee = tourneeDeRang(n);
  return tournee ? `Tournée ${tournee.id} (${tournee.de}–${tournee.a})` : '';
}

/**
 * L'adresse que chaque ligne ouvre d'un clic, pour que le relecteur n'ait pas
 * à retaper « /entreprise/… » dans un autre onglet.
 *
 * Les pages à paramètre reçoivent un exemple réel et non un gabarit : la fiche
 * d'un atelier qui existe vraiment, un auteur qui existe vraiment. Une ligne
 * sans adresse — la trentième, qui décrit les e-mails des fonctions serveur —
 * n'en a pas, et le panneau le dit au lieu de fabriquer un lien mort.
 *
 * Les deux portes de l'annuaire passent par les paramètres que la page lit
 * vraiment : `kind=auteurs` pour l'onglet des auteurs, `view=map` pour la
 * carte.
 */
export const RELECTURE_OUVRIR: Record<number, string> = {
  1: '/',
  2: '/',
  3: '/',
  4: '/annuaire',
  5: '/annuaire/imprimeries',
  6: '/annuaire/imprimeries/algerie',
  7: '/entreprise/imprimerie-el-bahia',
  8: '/annuaire?kind=auteurs',
  9: '/auteur/nadia-bensalem',
  10: '/annuaire?view=map',
  11: '/arabe-world',
  12: '/offres',
  13: '/offres/devis',
  14: '/demandes',
  15: '/demande-b2b',
  16: '/demande-marche',
  17: '/annonces',
  18: '/emplois',
  19: '/candidats',
  /* La fiche d'un candidat se lit sur un profil réel, que seule la base
     connaît : la ligne ouvre donc le vivier, d'où le relecteur entre dans une
     fiche. */
  20: '/candidats',
  21: '/deposer',
  22: '/compte',
  23: '/compte/profil-candidat',
  24: '/messages',
  25: '/suivi',
  26: '/plan-du-site',
  27: '/admin',
  28: '/mentions-legales',
  /* Une adresse qui n'existe pas, choisie exprès : c'est ainsi que la page
     introuvable se relit, et ses états vides avec elle. */
  29: '/ecran-introuvable',
};

/** L'adresse d'une ligne, ou `null` quand l'écran ne se lit pas sur le site. */
export function adresseEcran(n: number): string | null {
  return RELECTURE_OUVRIR[n] ?? null;
}

/**
 * Le vocabulaire figé du §11.2 du plan, posé dans le panneau de relecture.
 *
 * Dix termes, trois langues chacun : un même mot doit se lire de la même façon
 * d'une page à l'autre, sinon la relecture se contredit. Le tableau vit ici
 * plutôt que dans le seul document, pour que le relecteur l'ait sous les yeux
 * au moment où il coche.
 */
export type RelectureTerme = {
  fr: string;
  ar: string;
  en: string;
};

export const RELECTURE_TERMES: RelectureTerme[] = [
  { fr: 'Annuaire', ar: 'الدليل', en: 'Directory' },
  { fr: 'Fiche / atelier', ar: 'بطاقة / ورشة', en: 'Profile / workshop' },
  { fr: 'Vivier de candidats', ar: 'ملف المرشحين', en: 'Candidate pool' },
  { fr: 'Devis', ar: 'عرض سعر', en: 'Quote' },
  { fr: 'Demande B2B', ar: 'طلب B2B', en: 'B2B request' },
  { fr: 'Marché public', ar: 'صفقة عمومية', en: 'Public tender' },
  { fr: 'Région (wilaya, gouvernorat…)', ar: 'المنطقة', en: 'Region' },
  { fr: 'Façonnier', ar: 'وحدة تجهيز', en: 'Finishing house' },
  { fr: 'Référence de dossier', ar: 'مرجع الملف', en: 'Case reference' },
  { fr: 'Formules', ar: 'الصيغ', en: 'Plans' },
];

/** Les deux langues relues ici : l'arabe et l'anglais, jamais le français. */
export type RelectureLangue = 'ar' | 'en';

/** Ce que l'appareil retient : deux listes de rangs cochés. */
export type RelectureEtat = Record<RelectureLangue, number[]>;

const CLE = 'paperatlas.relecture.v1';
const LANGUES: RelectureLangue[] = ['ar', 'en'];

/** Une liste de rangs lue d'un côté ou de l'autre : jamais un rang inventé. */
function rangs(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const vus = new Set<number>();
  value.forEach((entree) => {
    const n = Number(entree);
    if (!Number.isInteger(n) || n < 1 || n > RELECTURE_TOTAL) return;
    vus.add(n);
  });
  return Array.from(vus).sort((a, b) => a - b);
}

/**
 * Ce que l'appareil a retenu. Un stockage fermé, vide ou abîmé rend une
 * relecture vierge plutôt qu'une erreur : la console doit toujours s'ouvrir.
 */
export function readRelecture(): RelectureEtat {
  const vide: RelectureEtat = { ar: [], en: [] };
  if (typeof window === 'undefined') return vide;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return vide;
    const parsed = JSON.parse(brut) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return vide;
    return { ar: rangs(parsed.ar), en: rangs(parsed.en) };
  } catch {
    return vide;
  }
}

/**
 * Le nom de l'avis que l'appareil émet à chaque écriture : l'en-tête de la
 * console compte les pages restantes sur le même carnet que le panneau, sans
 * le relire à la main ni attendre un rechargement.
 */
export const RELECTURE_AVIS = 'paperatlas:relecture';

/**
 * Le geste de la miniature : fermer d'un seul coup, des deux côtés, les écrans
 * d'une tournée qui restent ouverts — l'arabe et l'anglais ensemble, sans
 * descendre jusqu'aux lignes ni ouvrir le panneau.
 *
 * Le carnet n'est jamais écrasé : les rangs déjà cochés restent, et rien hors
 * de la tournée ne bouge. Le geste rend ce qu'il a touché et le compte atteint,
 * pour que la feuille datée dise les deux, comme le geste de la frise.
 */
export function fermerResteTournee(
  etat: RelectureEtat,
  tournee: RelectureTournee | TourneeCompte,
): { etat: RelectureEtat; n: number; apres: number } {
  const tranche: RelectureTournee = { id: tournee.id, de: tournee.de, a: tournee.a };
  const rangs = rangsTournee(tranche);
  const ouverts = rangs.filter((n) => !etat.ar.includes(n) || !etat.en.includes(n));
  if (ouverts.length === 0) {
    return { etat, n: 0, apres: compteRelecture(etat).deux };
  }
  const ajouter = (liste: number[]) =>
    Array.from(new Set([...liste, ...rangs])).sort((a, b) => a - b);
  const suivant: RelectureEtat = { ar: ajouter(etat.ar), en: ajouter(etat.en) };
  return {
    etat: suivant,
    n: ouverts.length,
    apres: compteRelecture(suivant).deux,
  };
}

/** Le geste d'écriture ne casse jamais l'écran quand il est refusé. */
export function writeRelecture(etat: RelectureEtat): void {
  if (typeof window === 'undefined') return;
  try {
    const propre: RelectureEtat = { ar: rangs(etat.ar), en: rangs(etat.en) };
    window.localStorage.setItem(CLE, JSON.stringify(propre));
    window.dispatchEvent(new Event(RELECTURE_AVIS));
  } catch {
    /* Un navigateur en navigation privée refuse d'écrire : la case reste
       cochée pour cette visite, elle ne se garde simplement pas. */
  }
}

/** Une page est relue dans une langue quand son rang y est coché. */
export function estRelue(etat: RelectureEtat, langue: RelectureLangue, n: number): boolean {
  return etat[langue].includes(n);
}

/** Les pages qu'il reste à relire des deux côtés : le complément de l'accord. */
export function resteRelecture(etat: RelectureEtat): number {
  return Math.max(RELECTURE_TOTAL - compteRelecture(etat).deux, 0);
}

/**
 * Ce que l'en-tête de la console compte : les deux langues séparément, pour
 * voir de quel côté la relecture traîne, et l'accord des deux — le chiffre
 * qui dit vraiment qu'une page est faite.
 *
 * Les restes sont des compléments, jamais un second comptage : une page
 * cochée en arabe ne change que le reste arabe.
 */
export type RelectureCompteLu = {
  ar: number;
  en: number;
  deux: number;
  resteAr: number;
  resteEn: number;
  /** Les pages cochées d'un seul côté : l'écart entre les deux langues. */
  unCote: number[];
  /**
   * Le carnet lui-même, tel que l'en-tête le lit : les deux listes de rangs
   * cochés. La frise en miniature du survol y prend l'état écran par écran,
   * sans second comptage ni seconde source.
   */
  etat: RelectureEtat;
  /**
   * La première tournée, comptée sur le même carnet : ses dix écrans en arabe,
   * en anglais, des deux côtés, et ce qui lui reste. L'en-tête la porte à côté
   * des trente pages, sans second comptage.
   */
  tournee: TourneeCompte;
  /**
   * Toutes les tournées, dans l'ordre du plan : l'en-tête en porte une pastille
   * par tournée, chacune comptée sur le même carnet et sans second comptage.
   */
  tournees: TourneeCompte[];
};

/**
 * Le carnet de l'appareil, lu une fois puis tenu à jour à chaque case cochée :
 * l'en-tête affiche les deux comptes sans rien écrire en base, et sans
 * attendre un rechargement.
 */
export function useRelectureCompte(): RelectureCompteLu {
  const [etat, setEtat] = useState<RelectureEtat>(() => readRelecture());
  useEffect(() => {
    const rafraichir = () => setEtat(readRelecture());
    rafraichir();
    window.addEventListener(RELECTURE_AVIS, rafraichir);
    window.addEventListener('storage', rafraichir);
    return () => {
      window.removeEventListener(RELECTURE_AVIS, rafraichir);
      window.removeEventListener('storage', rafraichir);
    };
  }, []);
  const compte = compteRelecture(etat);
  return {
    ...compte,
    etat,
    resteAr: Math.max(RELECTURE_TOTAL - compte.ar, 0),
    resteEn: Math.max(RELECTURE_TOTAL - compte.en, 0),
    unCote: pagesUnCote(etat),
    tournee: comptePremiereTournee(etat),
    tournees: RELECTURE_TOURNEES.map((tournee) => compteTournee(etat, tournee)),
  };
}

/**
 * Le nombre de pages encore à relire des deux côtés, lu sur le carnet de
 * l'appareil et tenu à jour à chaque case cochée : le chiffre d'accord, celui
 * qui ne bouge que lorsqu'une page est faite dans les deux langues.
 */
export function useRelectureReste(): number {
  const compte = useRelectureCompte();
  return Math.max(RELECTURE_TOTAL - compte.deux, 0);
}  

/**
 * Les pages cochées d'un seul côté : l'arabe est coché et l'anglais non — ou
 * l'inverse. Ce sont exactement les pages où les deux langues ne s'accordent
 * pas, celles qu'un relecteur doit reprendre avant de dire une page faite.
 *
 * L'ordre est celui du plan, jamais celui des cases cochées : le relecteur
 * retrouve la liste telle qu'il la parcourt d'habitude.
 */
export function pagesUnCote(etat: RelectureEtat): number[] {
  return RELECTURE_LIGNES.filter(
    (ligne) => estRelue(etat, 'ar', ligne.n) !== estRelue(etat, 'en', ligne.n),
  ).map((ligne) => ligne.n);
}

/** Le compte d'une langue, et le compte des pages relues des deux côtés. */
export function compteRelecture(etat: RelectureEtat): {
  ar: number;
  en: number;
  deux: number;
} {
  const ar = etat.ar.length;
  const en = etat.en.length;
  const deux = RELECTURE_LIGNES.filter(
    (ligne) => etat.ar.includes(ligne.n) && etat.en.includes(ligne.n),
  ).length;
  return { ar, en, deux };
}

/** Les langues du panneau, dans l'ordre où il les présente. */
export const RELECTURE_LANGUES = LANGUES;

/* ---- la liste emportée en CSV, pour la confier à un relecteur ---- */

/** Une cellule de CSV : toujours citée, guillemets intérieurs doublés. */
function cellule(valeur: string | number): string {
  return `"${String(valeur).replace(/"/g, '""')}"`;
}

/** Un rang écrit comme dans le panneau et le CSV : deux chiffres. */
function rangEcrit(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * La reprise d'une tournée dans les fichiers emportés : le premier écran que la
 * relecture n'a pas encore fermé, ou un tiret quand la tournée est faite des
 * deux côtés. C'est la même lecture que la porte du panneau — une seule règle,
 * pour que la feuille et l'écran ne se contredisent jamais.
 */
function repriseEcrite(etat: RelectureEtat, tournee: RelectureTournee): string {
  const rang = premierEcranTournee(etat, tournee);
  return rang === null ? '—' : rangEcrit(rang);
}

/**
 * Les rangs d'une tournée encore ouverts, écrits avec le côté qui manque :
 * « 02 (AR), 05 (EN), 07 (AR+EN) ». Un simple compte dit combien ; cette
 * écriture dit lesquels, et de quel côté — le relecteur sait ainsi ce qui
 * l'attend avant même d'ouvrir le fichier.
 *
 * Une tournée fermée des deux côtés le dit au lieu de laisser une cellule
 * vide, qu'on lirait comme un oubli.
 */
export function rangsOuvertsEcrits(
  etat: RelectureEtat,
  tournee: RelectureTournee,
): string {
  const restes = rangsTournee(tournee)
    .filter((n) => !etat.ar.includes(n) || !etat.en.includes(n))
    .map((n) => {
      const ar = !etat.ar.includes(n);
      const en = !etat.en.includes(n);
      const cote = ar && en ? 'AR+EN' : ar ? 'AR' : 'EN';
      return `${rangEcrit(n)} (${cote})`;
    });
  return restes.length === 0 ? '— tournée faite' : restes.join(', ');
}

/** Le nom du fichier : il dit ce qu'il porte, sans dater un carnet de travail. */
export const NOM_FICHIER_RELECTURE = 'paperatlas-relecture.csv';

/* ---- les gestes de tranche, datés, gardés avec le carnet ---- */

/**
 * Un geste de tranche : le clic qui ferme — ou rouvre — les dix écrans d'une
 * tranche d'un seul coup, depuis la frise du panneau.
 *
 * Le geste n'est pas une case : c'est un événement, et il se date. La feuille
 * emportée le trace pour que le relecteur voie qu'une tournée a été fermée
 * d'un trait, quand, et sur combien d'écrans — sans le déduire des trente
 * lignes.
 */
export type RelectureGeste = {
  /** L'instant du clic, en ISO : l'horloge de l'appareil, pas celle du site. */
  at: string;
  /** Le premier rang de la tranche touchée. */
  de: number;
  /** Le dernier rang de la tranche touchée. */
  a: number;
  /** Vrai quand le geste a fermé, faux quand il a rouvert. */
  ferme: boolean;
  /** Combien d'écrans le clic a réellement touchés. */
  n: number;
  /**
   * Le compte atteint juste après le clic : combien d'écrans du plan sont
   * fermés des deux côtés à cet instant. La feuille dit ainsi non seulement ce
   * que le geste a touché, mais où il a laissé la relecture — un geste de
   * tranche ne se lit pas seul, il se lit dans la progression.
   *
   * `null` pour un geste noté avant que ce compte n'existe : la feuille écrit
   * alors un tiret plutôt qu'un chiffre inventé.
   */
  apres: number | null;
  /**
   * Combien d'écrans de sa tranche étaient déjà fermés des deux côtés avant
   * le geste. Le chiffre sépare un vrai changement d'un simple repassage :
   * fermer une tranche déjà aux trois quarts close ne remue qu'un écran, et
   * une réouverture part, elle, d'une tranche entièrement fermée.
   *
   * `null` pour un geste noté avant que ce compte n'existe.
   */
  deja: number | null;
};

const CLE_GESTES = 'paperatlas.relecture.gestes.v1';
/** Ce que l'appareil retient : les derniers gestes, les plus récents en tête. */
const GESTES_MAX = 40;

/**
 * Les jours où le carnet des gestes a été remis à zéro sur cet appareil.
 *
 * Oublier les gestes efface la trace datée des clics groupés, et la feuille
 * emportée n'en dit plus rien. Garder le jour de l'oubli permet de dater la
 * remise à zéro elle-même : un carnet vierge n'est pas un carnet qui n'a jamais
 * servi, et la feuille doit pouvoir distinguer les deux.
 */
const CLE_OUBLIS = 'paperatlas.relecture.gestes.oubli.v1';
/** Combien de remises à zéro l'appareil garde, les plus récentes en tête. */
const OUBLIS_MAX = 6;

/**
 * Les jours des remises à zéro du carnet des gestes, les plus récents en tête.
 * Un stockage fermé ou abîmé rend une liste vide plutôt qu'une erreur : la
 * feuille doit toujours pouvoir partir.
 */
export function lireOublisGestes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const brut = window.localStorage.getItem(CLE_OUBLIS);
    if (!brut) return [];
    const parsed = JSON.parse(brut) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entree): entree is string => typeof entree === 'string')
      .filter((entree) => !Number.isNaN(new Date(entree).getTime()));
  } catch {
    return [];
  }
}

/**
 * Le nom de l'avis que l'appareil émet dès que le carnet des gestes change —
 * un geste noté, ou le carnet oublié. La frise l'écoute : la ligne du dernier
 * geste et la date de chaque tranche se relisent sans rechargement.
 */
export const GESTES_AVIS = 'paperatlas:relecture.gestes';

/** Un geste relu d'un côté ou de l'autre : jamais un rang inventé. */
function gesteLu(value: unknown): RelectureGeste | null {
  if (!value || typeof value !== 'object') return null;
  const brut = value as Record<string, unknown>;
  const de = Number(brut.de);
  const a = Number(brut.a);
  const n = Number(brut.n);
  const at = typeof brut.at === 'string' ? brut.at : '';
  const apres = Number(brut.apres);
  const deja = Number(brut.deja);
  if (!Number.isInteger(de) || !Number.isInteger(a) || !Number.isInteger(n)) return null;
  if (!at || Number.isNaN(new Date(at).getTime())) return null;
  return {
    at,
    de,
    a,
    ferme: brut.ferme === true,
    n,
    /* Un carnet écrit avant l'invention du compte n'en porte pas : il reste
       lisible, avec un tiret dans la feuille. */
    apres: Number.isInteger(apres) ? apres : null,
    deja: Number.isInteger(deja) ? deja : null,
  };
}

/**
 * Les gestes de tranche que l'appareil a retenus, les plus récents en tête.
 * Un stockage fermé ou abîmé rend une liste vide plutôt qu'une erreur : la
 * feuille doit toujours pouvoir partir.
 */
export function lireGestesBande(): RelectureGeste[] {
  if (typeof window === 'undefined') return [];
  try {
    const brut = window.localStorage.getItem(CLE_GESTES);
    if (!brut) return [];
    const parsed = JSON.parse(brut) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(gesteLu)
      .filter((geste): geste is RelectureGeste => geste !== null);
  } catch {
    return [];
  }
}

/**
 * Note un geste de tranche au moment du clic : son instant, sa tranche, son
 * sens et le nombre d'écrans qu'il a touchés. L'appareil garde les derniers,
 * les plus récents en tête — un carnet de travail, pas un journal sans fin.
 */
export function noterGesteBande(
  de: number,
  a: number,
  ferme: boolean,
  n: number,
  apres: number | null,
  deja: number | null = null,
  /* L'instant du clic, quand plusieurs tranches se notent d'un seul geste :
     elles partagent alors la même date à la milliseconde, et le carnet les
     relit comme un seul clic au lieu de plusieurs gestes voisins. */
  at: string = new Date().toISOString(),
): void {
  if (typeof window === 'undefined') return;
  try {
    const geste: RelectureGeste = {
      at,
      de,
      a,
      ferme,
      n,
      apres,
      deja,
    };
    const gestes = [geste, ...lireGestesBande()].slice(0, GESTES_MAX);
    window.localStorage.setItem(CLE_GESTES, JSON.stringify(gestes));
    window.dispatchEvent(new Event(GESTES_AVIS));
  } catch {
    /* Un navigateur en navigation privée refuse d'écrire : le geste reste
       vrai à l'écran, il ne se garde simplement pas dans la feuille. */
  }
}

/**
 * Oublie tous les gestes de tranche de cet appareil : la feuille emportée
 * repart d'un carnet vierge, et la tête de la frise n'a plus de dernier geste
 * à rappeler. Les cases cochées restent — oublier les gestes n'efface pas la
 * relecture elle-même, seulement la trace datée des clics groupés.
 */
export function effacerGestesBande(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CLE_GESTES);
    /* Le jour de l'oubli se garde à part : la feuille datée dit ainsi qu'un
       carnet a été remis à zéro, et quand — sans quoi un carnet vierge se
       lirait comme un carnet qui n'a jamais servi. */
    const oublis = [new Date().toISOString(), ...lireOublisGestes()].slice(0, OUBLIS_MAX);
    window.localStorage.setItem(CLE_OUBLIS, JSON.stringify(oublis));
  } catch {
    /* Un stockage fermé laisse le carnet tel quel : rien n'est perdu. */
  }
  window.dispatchEvent(new Event(GESTES_AVIS));
}

/** Le jour seul d'un instant : « 18/11/2026 », pour la liste collée. */
function jourEcrit(iso: string): string {
  const jour = new Date(iso);
  if (Number.isNaN(jour.getTime())) return '—';
  const deux = (valeur: number) => String(valeur).padStart(2, '0');
  return `${deux(jour.getDate())}/${deux(jour.getMonth() + 1)}/${jour.getFullYear()}`;
}

/**
 * Ce que le carnet des gestes retient, écrit pour un message : combien de
 * gestes, du plus ancien au plus récent, puis les jours où le carnet a été
 * remis à zéro sur cet appareil.
 *
 * La liste collée n'emporte pas la feuille CSV : cette ligne-là lui suffit pour
 * dire, sans pièce jointe, ce qu'un oubli a emporté et quand il a eu lieu — un
 * carnet vidé ne se confond plus avec un carnet qui n'a jamais servi.
 */
function carnetEcrit(): string[] {
  const gestes = lireGestesBande();
  const oublis = lireOublisGestes();
  const lignes: string[] = [];
  if (gestes.length > 0) {
    const plusAncien = gestes[gestes.length - 1];
    /* Les remises à zéro tombées entre le plus ancien et le plus récent des
       gestes retenus : elles ont eu lieu pendant la période que ces gestes
       couvrent, et le message les compte au lieu de laisser le lecteur les
       deviner en recoupant deux lignes. */
    const debut = new Date(plusAncien.at).getTime();
    const fin = new Date(gestes[0].at).getTime();
    const comprises = oublis.filter((iso) => {
      const quand = new Date(iso).getTime();
      return !Number.isNaN(quand) && quand >= debut && quand <= fin;
    });
    lignes.push(
      `Carnet · ${gestes.length} geste(s) retenu(s) · du ${jourEcrit(
        plusAncien.at,
      )} au ${jourEcrit(gestes[0].at)} · ${
        comprises.length === 0
          ? 'aucune remise à zéro comprise'
          : `${comprises.length} remise(s) à zéro comprise(s) dans ces gestes`
      }`,
    );
  } else {
    lignes.push('Carnet · aucun geste de tranche retenu sur cet appareil');
  }
  if (oublis.length > 0) {
    lignes.push(
      `Carnet remis à zéro · ${oublis.length} fois · ${oublis
        .map((iso) => jourEcrit(iso))
        .join(' · ')}`,
    );
  }
  return lignes;
}

/** Un instant daté pour la feuille : « 2026-11-18 09:42 », lisible en tableur. */
function gesteEcrit(iso: string): string {
  const jour = new Date(iso);
  if (Number.isNaN(jour.getTime())) return '—';
  const deux = (valeur: number) => String(valeur).padStart(2, '0');
  return `${jour.getFullYear()}-${deux(jour.getMonth() + 1)}-${deux(jour.getDate())} ${deux(
    jour.getHours(),
  )}:${deux(jour.getMinutes())}`;
}

/**
 * Les trente écrans tels que cet appareil les a cochés : le rang, l'écran, son
 * adresse, le fichier de textes, ce qu'il faut y surveiller, puis les deux
 * cases et leur accord. Le total ferme la feuille, et rappelle d'où il vient —
 * un carnet d'appareil, jamais une donnée du site. Une seconde feuille, sous
 * une ligne vide, donne la synthèse de chaque tournée : son étendue, ses deux
 * comptes, leur accord et sa reprise — pour un envoi sans filtre à un
 * relecteur, qui voit d'un coup d'œil où en est chaque passage.
 *
 * Le fichier se lit sur le même carnet que le panneau : il part au moment du
 * clic, donc il dit exactement ce qui est coché à cet instant. Une troisième
 * feuille, datée, trace les gestes de tranche — ces clics qui ferment ou
 * rouvrent dix écrans d'un coup —, pour que la tournée fermée d'un trait se
 * lise dans le fichier et pas seulement à l'écran.
 */
export function relectureCsv(): string {
  const etat = readRelecture();
  const compte = compteRelecture(etat);
  const lignes: string[] = [];

  lignes.push(
    [
      'Rang',
      'Tournée',
      /* La colonne de reprise : le premier écran que sa tournée n'a pas encore
         fermé. Un envoi à un relecteur dit ainsi par où reprendre, tournée par
         tournée, sans relire les cases une à une. */
      'Reprise',
      'Écran',
      'Adresse',
      'Fichiers de textes',
      'À surveiller',
      'Arabe (AR)',
      'Anglais (EN)',
      'Les deux',
      'Côté coché',
    ]
      .map(cellule)
      .join(';'),
  );

  RELECTURE_LIGNES.forEach((ligne) => {
    const ar = estRelue(etat, 'ar', ligne.n);
    const en = estRelue(etat, 'en', ligne.n);
    const tournee = tourneeDeRang(ligne.n);
    lignes.push(
      [
        rangEcrit(ligne.n),
        /* Les tournées se repèrent d'un coup d'œil dans un tableur : ce sont
           les écrans par lesquels la relecture commence, et ceux dont les mots
           reviennent partout ailleurs. */
        etiquetteTournee(ligne.n),
        /* Hors tournée, la colonne reste vide : un écran des trente n'a pas de
           reprise à lui, c'est la tranche qui en porte une. */
        tournee ? repriseEcrite(etat, tournee) : '',
        ligne.page,
        ligne.path,
        ligne.textes,
        ligne.vigilance,
        ar ? 'x' : '',
        en ? 'x' : '',
        ar && en ? 'x' : '',
        /* La langue en avance sur cette page : le relecteur qui reçoit la
           feuille voit d'un coup d'œil quel côté il lui reste à reprendre. */
        ar && !en ? 'Arabe seul' : en && !ar ? 'Anglais seul' : '',
      ]
        .map(cellule)
        .join(';'),
    );
  });

  lignes.push(
    [
      'Total',
      `${compte.deux} page(s) relue(s) des deux côtés`,
      /* La reprise de chaque tournée, nommée une fois pour toutes dans la
         ligne qui ferme la feuille. */
      RELECTURE_TOURNEES.map(
        (tournee) =>
          `Tournée ${tournee.id} → écran ${repriseEcrite(etat, tournee)}`,
      ).join(' · '),
      'Carnet de cet appareil, jamais en base',
      RELECTURE_TOURNEES.map((tournee) => `Tournée ${tournee.id} (${tournee.de}–${tournee.a})`).join(
        ' · ',
      ),
      '',
      '',
      `${compte.ar} / ${RELECTURE_TOTAL}`,
      `${compte.en} / ${RELECTURE_TOTAL}`,
      `${compte.deux} / ${RELECTURE_TOTAL}`,
      `${pagesUnCote(etat).length} page(s) d’un seul côté`,
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la seconde feuille : la synthèse de chaque tournée ---- */
  /* Une ligne vide sépare les deux feuilles : le tableur lit la première comme
     la liste écran par écran, la seconde comme le résumé que l'on confie à un
     relecteur — son étendue, ses deux comptes, leur accord et sa reprise. */
  lignes.push('');
  lignes.push(
    [
      'Synthèse par tournée',
      'Écrans',
      'Cochés en arabe',
      'Cochés en anglais',
      'Les deux',
      'Reste en arabe',
      'Reste en anglais',
      /* La colonne qui nomme les rangs, et pas seulement leur nombre : le
         relecteur sait lesquels l'attendent avant d'ouvrir le fichier. */
      'Rangs encore ouverts',
      'Reprise',
    ]
      .map(cellule)
      .join(';'),
  );

  RELECTURE_TOURNEES.forEach((tournee) => {
    const c = compteTournee(etat, tournee);
    lignes.push(
      [
        `Tournée ${tournee.id}`,
        `${tournee.de}–${tournee.a}`,
        `${c.ar} / ${c.total}`,
        `${c.en} / ${c.total}`,
        `${c.deux} / ${c.total}`,
        String(c.resteAr),
        String(c.resteEn),
        rangsOuvertsEcrits(etat, tournee),
        repriseEcrite(etat, tournee),
      ]
        .map(cellule)
        .join(';'),
    );
  });

  /* La ligne qui ferme la synthèse additionne les tournées, sans toucher aux
     écrans 21 à 30 : ils ne sont d'aucune tranche, et les compter ici ferait
     mentir le résumé d'un envoi sans filtre. */
  const somme = RELECTURE_TOURNEES.reduce(
    (acc, tournee) => {
      const c = compteTournee(etat, tournee);
      return {
        ar: acc.ar + c.ar,
        en: acc.en + c.en,
        deux: acc.deux + c.deux,
        resteAr: acc.resteAr + c.resteAr,
        resteEn: acc.resteEn + c.resteEn,
        total: acc.total + c.total,
      };
    },
    { ar: 0, en: 0, deux: 0, resteAr: 0, resteEn: 0, total: 0 },
  );
  const premiere = RELECTURE_TOURNEES[0];
  const derniere = RELECTURE_TOURNEES[RELECTURE_TOURNEES.length - 1];
  lignes.push(
    [
      'Les deux tournées',
      `${premiere.de}–${derniere.a}`,
      `${somme.ar} / ${somme.total}`,
      `${somme.en} / ${somme.total}`,
      `${somme.deux} / ${somme.total}`,
      String(somme.resteAr),
      String(somme.resteEn),
      RELECTURE_TOURNEES.map(
        (tournee) => `T${tournee.id} → ${rangsOuvertsEcrits(etat, tournee)}`,
      ).join(' · '),
      RELECTURE_TOURNEES.map(
        (tournee) => `T${tournee.id} → ${repriseEcrite(etat, tournee)}`,
      ).join(' · '),
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la troisième feuille : les gestes de tranche, datés ---- */
  /* Un geste n'est pas une case : il se date. La feuille retrace les clics qui
     ont fermé — ou rouvert — une tranche entière, le plus récent en tête, pour
     qu'un relecteur voie qu'une tournée a été finie d'un trait et quand. */
  lignes.push('');
  lignes.push(
    [
      'Geste de tranche',
      'Date',
      'Tranche',
      'Écrans',
      'Geste',
      'Écrans touchés',
      /* Le compte atteint après le clic : ce que le geste a laissé derrière
         lui, et non seulement ce qu'il a remué. */
      'Fermés au total après',
    ]
      .map(cellule)
      .join(';'),
  );
  const gestes = lireGestesBande();
  const oublis = lireOublisGestes();
  /* Les remises à zéro, datées avant les gestes : une feuille qui part d'un
     carnet vierge dit quand il a été vidé, et ce jour-là n'est pas un oubli
     du fichier mais un fait du carnet. */
  oublis.forEach((iso) => {
    lignes.push(
      [
        `Carnet remis à zéro le ${gesteEcrit(iso)}`,
        gesteEcrit(iso),
        '—',
        '—',
        'Gestes de tranche oubliés sur cet appareil',
        '0',
        `${compte.deux} / ${RELECTURE_TOTAL}`,
      ]
        .map(cellule)
        .join(';'),
    );
  });
  if (gestes.length === 0) {
    lignes.push(
      [
        'Geste de tranche',
        '—',
        '—',
        '—',
        'Aucun geste de tranche retenu sur cet appareil',
        '0',
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  } else {
    gestes.forEach((geste) => {
      lignes.push(
        [
          'Geste de tranche',
          gesteEcrit(geste.at),
          etiquetteTournee(geste.de) || `Hors tournée (${geste.de}–${geste.a})`,
          `${geste.de}–${geste.a}`,
          geste.ferme ? 'Fermé d’un coup' : 'Rouvert d’un coup',
          String(geste.n),
          geste.apres === null ? '—' : `${geste.apres} / ${RELECTURE_TOTAL}`,
        ]
          .map(cellule)
          .join(';'),
      );
    });
    /* La ligne qui ferme la feuille compte les gestes et les écrans qu'ils ont
       touchés : de quoi voir d'un coup d'œil combien de tournées sont passées
       par le geste groupé, et non par les trente lignes. */
    lignes.push(
      [
        'Geste de tranche',
        '—',
        '—',
        '—',
        `${gestes.length} geste(s) retenu(s) sur cet appareil`,
        String(gestes.reduce((total, geste) => total + geste.n, 0)),
        /* Là où la relecture se tient maintenant : le compte d'accord du
           carnet, au moment où la feuille part. */
        `${compte.deux} / ${RELECTURE_TOTAL}`,
      ]
        .map(cellule)
        .join(';'),
    );
  }

  /* Un BOM, pour que le tableur lise les accents dès l'ouverture. */
  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/* ---- la même liste en texte, pour un message ---- */

/** Une case cochée dans le texte : deux signes qui survivent à tout envoi. */
const CASE = { on: 'x', off: '·' } as const;

/**
 * Les trente écrans en texte brut, une ligne chacun : collée dans un message,
 * la liste reste lisible sur un téléphone, sans tableau ni pièce jointe. Le
 * rang ouvre la ligne, les deux cases suivent, puis l'écran et son adresse.
 *
 * Le texte se lit sur le même carnet que le panneau, au moment du clic : il dit
 * exactement ce qui est coché, et son en-tête rappelle d'où vient le chiffre.
 */
export function relectureTexte(): string {
  const etat = readRelecture();
  const compte = compteRelecture(etat);
  /* Les tournées se comptent sur le même carnet que le CSV : la ligne collée
     dans un message dit la même chose que la feuille, sans être recalculée
     ailleurs. Chaque tournée porte sa propre ligne, dans l'ordre du plan. */
  const tournees = RELECTURE_TOURNEES.map((tournee) => ({
    tournee,
    compte: compteTournee(etat, tournee),
  }));
  const lignes: string[] = [
    'PaperAtlas · relecture AR / EN — les 30 écrans, dans l’ordre de passage',
    `${compte.ar} / ${RELECTURE_TOTAL} en arabe · ${compte.en} / ${RELECTURE_TOTAL} en anglais · ${compte.deux} relue(s) des deux côtés`,
    /* Le dernier geste de tranche, rappelé avec sa date et le compte atteint :
       la liste collée dit qu'une tournée a été fermée d'un trait, quand, et où
       elle a laissé la relecture — sans le déduire des trente lignes. */
    (() => {
      const dernier = lireGestesBande()[0] ?? null;
      if (!dernier) return 'Dernier geste de tranche · aucun geste retenu sur cet appareil';
      const tranche =
        etiquetteTournee(dernier.de) || `Hors tournée (${dernier.de}–${dernier.a})`;
      const atteint =
        dernier.apres === null
          ? 'compte atteint non noté'
          : `${dernier.apres} / ${RELECTURE_TOTAL} fermés des deux côtés`;
      return `Dernier geste de tranche · ${gesteEcrit(dernier.at)} · ${tranche} · ${
        dernier.ferme ? 'fermé d’un coup' : 'rouvert d’un coup'
      } · ${dernier.n} écran(s) · ${atteint}`;
    })(),
    /* Ce que le carnet retient, et les jours où il a été vidé : le message
       date ainsi les remises à zéro, sans emporter la feuille CSV. */
    ...carnetEcrit(),
    ...tournees.map(({ tournee, compte: c }) => {
      /* La reprise : le premier écran encore ouvert de la tournée, écrit dans
         la même numérotation que les lignes qui suivent. Une tournée faite des
         deux côtés le dit au lieu de renvoyer à un écran déjà fermé. */
      const reprise = premierEcranTournee(etat, tournee);
      /* Les rangs eux-mêmes, et pas seulement leur nombre : la ligne collée dit
         « 02 (AR), 05 (EN) », exactement comme la feuille de synthèse du CSV —
         le relecteur sait lesquels l’attendent avant d’ouvrir quoi que ce soit. */
      const ouverts = rangsOuvertsEcrits(etat, tournee);
      return `Tournée ${tournee.id} (${tournee.de}–${tournee.a}) · ${c.deux} / ${c.total} écran(s) relu(s) des deux côtés · ${c.resteAr} encore à cocher en arabe · encore ouverts : ${ouverts} · reprise ${reprise === null ? '— tournée faite' : `à l’écran ${rangEcrit(reprise)}`}`;
    }),
    '',
  ];

  RELECTURE_LIGNES.forEach((ligne) => {
    const ar = estRelue(etat, 'ar', ligne.n) ? CASE.on : CASE.off;
    const en = estRelue(etat, 'en', ligne.n) ? CASE.on : CASE.off;
    const tournee = tourneeDeRang(ligne.n);
    lignes.push(
      `${rangEcrit(ligne.n)} · AR ${ar} · EN ${en} · ${ligne.page} (${ligne.path})${tournee ? ` · T${tournee.id}` : ''}`,
    );
  });

  lignes.push('', 'Carnet de cet appareil, jamais en base.');
  return lignes.join('\n');
}

/**
 * La liste des rangs encore à fermer, tranche par tranche, écrite pour un
 * message : chaque tranche ouverte y porte ses rangs et le côté qui manque.
 *
 * Collée dans une conversation, elle dit d'un coup d'œil ce qui reste à faire
 * et où — sans emporter la feuille CSV ni déplier les cartes datées.
 */
export function rangsOuvertsTexte(
  etat: RelectureEtat = readRelecture(),
  tri: TriTranchesOuvertes = 'plan',
  gestes: RelectureGeste[] = lireGestesBande(),
): string {
  const ouvertes = trierTranchesOuvertes(tranchesEncoreOuvertes(etat), tri);
  const dedans = (n: number) =>
    ouvertes.some((tranche) => n >= tranche.de && n <= tranche.a);
  const ecrans = RELECTURE_LIGNES.filter(
    (ligne) =>
      dedans(ligne.n) &&
      (!etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n)),
  ).length;
  /* Le poids du rangement, lu sur les tranches emportées : la liste collée dit
     ainsi, dès son en-tête, combien de tranches le tri a réellement déplacées. */
  const deplacees = tranchesDeplaceesParTri(ouvertes, tri);
  const lignes: string[] = [
    /* L'en-tête porte le compte des tranches et l'étendue du rangement — de la
       position 1 à la dernière —, comme le CSV et le tableau daté : la liste
       collée se relit rangement en main. Il ajoute le compte des tranches que
       le tri a réellement déplacées, à côté du nombre de tranches ouvertes. */
    `PaperAtlas · rangs encore à fermer, tranche par tranche · ${ecrans} écran(s) · ${ouvertes.length} tranche(s) ouverte(s) · ${
      deplacees === 0
        ? 'aucune tranche déplacée par le tri'
        : `${deplacees} tranche(s) déplacée(s) par le tri`
    } · ${
      ouvertes.length === 0
        ? '— aucune tranche à ranger'
        : `rangement de la position 1 à la position ${ouvertes.length}`
    }`,
    /* L'ordre retenu dans la tête de frise descend jusqu'à la liste collée :
       une conversation relue seule sait dans quel sens les tranches sont
       rangées, sans la tête de frise pour porter le choix. */
    `Ordre des tranches ouvertes : ${ordreTranchesEcritCompte(ouvertes, tri)}`,
    /* La tranche encore ouverte qui attend depuis le plus longtemps, avec son
       délai : la liste collée dit par où le retard a commencé, sans rouvrir le
       carnet ni déplier une seule carte. */
    (() => {
      const ancienne = trancheAncienneOuverte(ouvertes, gestes);
      if (!ancienne) {
        return 'Tranche la plus ancienne encore ouverte · — aucun geste retenu sur ces tranches';
      }
      /* Ce que cette tranche-là garde encore ouvert, lu sur ses écrans : le
         délai dit depuis quand elle attend, le compte dit ce qui l'attend. */
      const gardesAncienne = rangsOuvertsTranche(etat, ancienne.tranche).length;
      /* L'écart au plus chargé, lu sur les mêmes tranches que la colonne du
         CSV : la ligne dit de combien d'écrans cette tranche ancienne se tient
         de celle qui en garde le plus — 0 quand c'est elle. */
      const plusCharge = ouvertes.reduce(
        (max, tranche) => Math.max(max, rangsOuvertsTranche(etat, tranche).length),
        0,
      );
      const ecartAncienne = Math.max(plusCharge - gardesAncienne, 0);
      return `Tranche la plus ancienne encore ouverte · ${nomTrancheFrise(
        ancienne.tranche,
      )} · dernier geste ${gesteEcrit(ancienne.geste.at)} · il y a ${delaiEcritCourt(
        ancienne.geste.at,
      )} · ${gardesAncienne} écran(s) encore ouvert(s) des deux côtés · écart au plus chargé ${ecartAncienne} · ${
        deplacees === 0
          ? 'aucune tranche déplacée par le tri'
          : `${deplacees} tranche(s) déplacée(s) par le tri`
      }`;
    })(),
    /* La borne de fermeture, datée : la liste collée dit quand la tranche qui
       referme le rangement a bougé pour la dernière fois, sans rouvrir le
       carnet ni déplier sa carte. Une liste sans tranche à ranger le dit. */
    (() => {
      const fermante = ouvertes.length > 0 ? ouvertes[ouvertes.length - 1] : null;
      if (!fermante) {
        return 'Dernier geste de la tranche qui ferme le rangement · — aucune tranche à ranger';
      }
      const geste =
        gestes.find((entree) => entree.de === fermante.de && entree.a === fermante.a) ??
        null;
      return `Dernier geste de la tranche qui ferme le rangement · ${nomTrancheFrise(
        fermante,
      )} · ${geste ? gesteEcrit(geste.at) : '— aucun geste retenu sur cette tranche'}`;
    })(),
  ];
  if (ouvertes.length === 0) {
    lignes.push('Toutes les tranches sont fermées des deux côtés.');
  } else {
    ouvertes.forEach((tranche, rang) => {
      /* La position de la tranche dans l'ordre retenu, posée à côté de son
         nom comme dans la colonne du CSV : la liste collée se relit rangement
         en main, sans la tête de frise. */
      lignes.push(
        `${nomTrancheFrise(tranche)} · position ${positionTrancheEcrit(
          ouvertes,
          tranche,
          tri,
        )} → ${rangsOuvertsEcritsDe(etat, tranche.de, tranche.a)}`,
      );
      /* Sous la tranche qui ferme le rangement, le poids qu'elle garde encore :
         la liste collée dit ainsi, à côté de ses rangs, ce que cette borne-là
         doit encore fermer — sans compter les autres tranches. */
      if (rang === ouvertes.length - 1) {
        lignes.push(
          `Écrans gardés par la tranche qui ferme le rangement · ${nomTrancheFrise(
            tranche,
          )} · ${rangsOuvertsTranche(etat, tranche).length} écran(s) encore ouvert(s) des deux côtés`,
        );
      }
    });
  }
  /* La synthèse des écrans gardés, comme la ligne du CSV : ce que l'ensemble
     des tranches ouvertes garde encore, le total devant, puis chaque tranche
     nommée avec son poids — la répartition se lit sans additionner. */
  if (ouvertes.length > 0) {
    const plusChargeOuvertes = ouvertes.reduce(
      (max, tranche) => Math.max(max, rangsOuvertsTranche(etat, tranche).length),
      0,
    );
    lignes.push(
      `Synthèse des écrans gardés · ${ouvertes.length} tranche(s) ouverte(s) · ${ecrans} écran(s) gardés encore ouverts des deux côtés · ${ouvertes
        .map(
          (tranche) =>
            `${nomTrancheFrise(tranche)} : ${rangsOuvertsTranche(etat, tranche).length}`,
        )
        .join(' · ')}`,
    );
    /* La tranche la plus légère, lue sur le même rangement que la synthèse :
       la ligne de synthèse se relit depuis ses deux bords — ce que la plus
       chargée pèse, et de combien la plus légère s'en tient. Une égalité
       garde la première tranche rencontrée dans l'ordre retenu. */
    const legere = trancheQuiGardeLeMoins(etat, ouvertes, tri);
    if (legere) {
      const ecartLegereLigne = Math.max(plusChargeOuvertes - legere.n, 0);
      lignes.push(
        `Tranche la plus légère · ${nomTrancheFrise(legere.tranche)} · ${legere.n} écran(s) encore ouvert(s) des deux côtés · ${
          ecartLegereLigne === 0
            ? 'c’est aussi celle qui en garde le plus, et son écart vaut 0'
            : `écart au plus chargé ${ecartLegereLigne}`
        }`,
      );
    }
    /* Sous la plus légère, la borne de fermeture : les deux bords du rangement
       et sa borne se lisent dans un même bloc — la plus chargée dans la
       synthèse, la plus légère ici, puis la tranche sur laquelle l’ordre se
       referme, avec son poids et son écart. */
    const fermanteLigne = ouvertes[ouvertes.length - 1];
    const gardesFermante = rangsOuvertsTranche(etat, fermanteLigne).length;
    const ecartFermante = Math.max(plusChargeOuvertes - gardesFermante, 0);
    const memeLegere =
      legere !== null &&
      legere.tranche.de === fermanteLigne.de &&
      legere.tranche.a === fermanteLigne.a;
    lignes.push(
      `Tranche qui ferme le rangement · ${nomTrancheFrise(
        fermanteLigne,
      )} · ${gardesFermante} écran(s) encore ouvert(s) des deux côtés · ${
        ecartFermante === 0
          ? 'c’est aussi celle qui en garde le plus, et son écart vaut 0'
          : `écart au plus chargé ${ecartFermante}`
      }${memeLegere ? ' · c’est aussi la plus légère du rangement' : ''}`,
    );
  }
  lignes.push('Carnet de cet appareil, jamais en base.');
  return lignes.join('\n');
}

/**
 * Copie un texte dans le presse-papiers. Un navigateur qui le refuse (page non
 * sécurisée, permission fermée) retombe sur la zone de texte : le geste répond
 * vrai ou faux, il ne laisse jamais l'écran sans réponse.
 */
async function copierTexte(texte: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch {
    /* Le presse-papiers est fermé : le repli ci-dessous essaie encore. */
  }
  try {
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.setAttribute('readonly', 'true');
    zone.style.position = 'fixed';
    zone.style.top = '-1000px';
    zone.style.opacity = '0';
    document.body.appendChild(zone);
    zone.select();
    const parti = document.execCommand('copy');
    zone.remove();
    return parti;
  } catch {
    return false;
  }
}

/** Le geste de la porte de tête : la liste des rangs dans le presse-papiers. */
export async function copierRangsOuverts(
  etat: RelectureEtat = readRelecture(),
  tri: TriTranchesOuvertes = 'plan',
): Promise<boolean> {
  return copierTexte(rangsOuvertsTexte(etat, tri));
}

/**
 * Les rangs encore à fermer, écrits en tableau : une ligne par écran, avec son
 * rang, son nom et le côté qui manque — « AR », « EN » ou « AR+EN ».
 *
 * Là où la liste courte se lit d'un trait dans une conversation, ce tableau se
 * colle dans un tableur ou un message à colonnes : le relecteur trie, compte et
 * coche sans redécouper les lignes à la main. Les colonnes sont séparées par une
 * tabulation, que les tableurs et les messageries reconnaissent.
 */
export function rangsOuvertsTableauTexte(
  etat: RelectureEtat = readRelecture(),
): string {
  const ouvertes = tranchesEncoreOuvertes(etat);
  const dedans = (n: number) =>
    ouvertes.some((tranche) => n >= tranche.de && n <= tranche.a);
  const restes = RELECTURE_LIGNES.filter(
    (ligne) =>
      dedans(ligne.n) &&
      (!etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n)),
  );
  const lignes: string[] = [['Rang', 'Écran', 'Côté manquant'].join('\t')];
  restes.forEach((ligne) => {
    const ar = !etat.ar.includes(ligne.n);
    const en = !etat.en.includes(ligne.n);
    const cote = ar && en ? 'AR+EN' : ar ? 'AR' : 'EN';
    lignes.push([rangEcrit(ligne.n), ligne.page, cote].join('\t'));
  });
  if (restes.length === 0) {
    lignes.push(
      ['—', 'Toutes les tranches sont fermées des deux côtés', '—'].join('\t'),
    );
  }
  return lignes.join('\n');
}

/** Le geste de la porte du tableau : les rangs en colonnes dans le presse-papiers. */
export async function copierRangsTableau(
  etat: RelectureEtat = readRelecture(),
): Promise<boolean> {
  return copierTexte(rangsOuvertsTableauTexte(etat));
}

/**
 * Les rangs encore à fermer, en tableau daté : une ligne par écran, avec son
 * rang, son nom, le côté qui manque, ce que sa tranche garde encore ouvert,
 * son écart à la tranche la plus chargée et — en dernière colonne — la date du
 * dernier geste de cette tranche.
 *
 * Le tableau simple dit quoi fermer ; celui-ci dit aussi quand la tranche a
 * bougé pour la dernière fois : le relecteur voit d'un coup d'œil quelles
 * tranches ont été remuées récemment et lesquelles attendent depuis longtemps,
 * sans ouvrir la frise ni les cartes datées.
 */
export function rangsOuvertsTableauDateTexte(
  etat: RelectureEtat = readRelecture(),
  gestes: RelectureGeste[] = lireGestesBande(),
  tri: TriTranchesOuvertes = 'plan',
): string {
  const ouvertesBrutes = tranchesEncoreOuvertes(etat);
  /* L'ordre retenu dans la tête de frise descend jusqu'à la feuille : les
     tranches s'y rangent comme les pastilles et comme les marques, et la ligne
     de tête dit lequel, pour qu'une capture d'écran se relise seule. */
  const ouvertes = trierTranchesOuvertes(ouvertesBrutes, tri);
  const dedans = (n: number) =>
    ouvertes.some((tranche) => n >= tranche.de && n <= tranche.a);
  const restes = RELECTURE_LIGNES.filter(
    (ligne) =>
      dedans(ligne.n) &&
      (!etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n)),
  );
  /* Les deux bornes du rangement, lues d'une seule règle : la ligne de tête
     les nomme toutes deux, comme la ligne de total — une copie datée se relit
     seule, du premier au dernier rang. */
  const bornesDate = bornesOrdreEcrit(ouvertes, tri);
  const lignes: string[] = [
    /* La ligne de tête dit l'ordre des tranches avant les colonnes : une
       capture du tableau se relit sans la tête de frise, qui porte le choix. */
    [
      'PaperAtlas · tableau daté',
      /* La ligne de tête nomme les deux tranches qui bornent le rangement,
         comme la ligne de tête du CSV : une copie datée se relit seule, sans
         la tête de frise pour dire par où l'ordre commence et où il se referme. */
      `Ordre des tranches ouvertes : ${ordreTranchesEcritCompte(ouvertes, tri)}${
        bornesDate
          ? ` · l’ordre s’ouvre sur ${bornesDate.ouvre} · l’ordre se referme sur ${bornesDate.ferme}`
          : ' · aucune tranche à ouvrir'
      }`,
      '',
      '',
      '',
    ].join('\t'),
    /* La colonne « Écrans gardés » se pose entre le côté qui manque et la
       date : ce que la tranche garde encore ouvert se lit à côté de l'écran,
       sur le même modèle que la feuille des tranches ouvertes. La colonne
       « Écart au plus chargé », posée juste après, dit pour chaque ligne
       combien d'écrans la séparent de la tranche qui en garde le plus — 0
       pour la plus chargée elle-même. */
    [
      'Rang',
      'Écran',
      'Côté manquant',
      'Écrans gardés',
      'Écart au plus chargé',
      'Dernier geste',
    ].join('\t'),
  ];
  if (restes.length === 0) {
    lignes.push(
      [
        '—',
        'Toutes les tranches sont fermées des deux côtés',
        '—',
        '—',
        '—',
        '—',
      ].join('\t'),
    );
    return lignes.join('\n');
  }
  /* La tranche qui garde le plus, lue sur les mêmes tranches que la feuille
     des tranches ouvertes : l'écart de chaque ligne se mesure à elle. */
  const plusChargeDate = ouvertes.reduce(
    (max, tranche) => Math.max(max, rangsOuvertsTranche(etat, tranche).length),
    0,
  );
  const ecartDate = (n: number) => String(Math.max(plusChargeDate - n, 0));
  /* Les écrans se rangent tranche par tranche : sous chacune, une ligne de
     sous-total dit combien d'écrans elle garde encore ouverts — le tableau ne
     se lit plus comme une liste continue, mais comme ce que chaque tranche
     doit encore. */
  ouvertes.forEach((tranche) => {
    /* Le geste le plus récent de la tranche : le carnet les garde du plus récent
       au plus ancien, et le premier trouvé est donc le dernier. */
    const geste =
      gestes.find((entree) => entree.de === tranche.de && entree.a === tranche.a) ?? null;
    const siens = restes.filter((ligne) => ligne.n >= tranche.de && ligne.n <= tranche.a);
    if (siens.length === 0) return;
    /* Ce que la tranche garde encore ouvert, lu une fois pour toute la tranche :
       la colonne « Écrans gardés » le porte sur chacune de ses lignes, comme
       dans la feuille des tranches ouvertes — « 3 / 10 ». */
    const ecransTrancheTotal = RELECTURE_LIGNES.filter(
      (ligne) => ligne.n >= tranche.de && ligne.n <= tranche.a,
    ).length;
    const gardes = `${siens.length} / ${ecransTrancheTotal}`;
    /* La distance de cette tranche à la plus chargée, la même sur toutes ses
       lignes : chaque poids se situe ainsi d'un coup d'œil. */
    const ecartTranche = ecartDate(siens.length);
    siens.forEach((ligne) => {
      const ar = !etat.ar.includes(ligne.n);
      const en = !etat.en.includes(ligne.n);
      const cote = ar && en ? 'AR+EN' : ar ? 'AR' : 'EN';
      lignes.push(
        [
          rangEcrit(ligne.n),
          ligne.page,
          cote,
          gardes,
          ecartTranche,
          geste ? gesteEcrit(geste.at) : '— aucun geste',
        ].join('\t'),
      );
    });
    /* Le côté qui manque le plus souvent dans la tranche : sur ses écrans
       encore ouverts, l'arabe et l'anglais ne manquent pas au même rythme, et
       la ligne de sous-total dit lequel revient le plus — de quoi savoir de
       quel côté la tranche attend, et pas seulement combien d'écrans. */
    const coteFrequent = coteDominantEcrit(etat, tranche.de, tranche.a);
    /* Ce que la tranche a déjà fermé des deux côtés, lu sur son étendue : la
       même symétrie que la feuille des tranches ouvertes, où « Écrans fermés »
       se lit juste à côté du sous-total. Le tableau dit ainsi l'avancement de
       chaque tranche, et pas seulement son retard. */
    const fermesTranche = Math.max(ecransTrancheTotal - siens.length, 0);
    lignes.push(
      [
        '—',
        /* La position de la tranche dans l'ordre retenu, posée à côté de son
           nom comme dans la liste collée et la colonne du CSV : les cinq
           colonnes du tableau se relisent rangement en main. */
        `${nomTrancheFrise(tranche)} · position ${positionTrancheEcrit(
          ouvertes,
          tranche,
          tri,
        )} · sous-total`,
        `${siens.length} écran(s) encore ouvert(s) sur ${ecransTrancheTotal} · ${fermesTranche} écran(s) fermé(s) · manque surtout ${coteFrequent}`,
        /* Le sous-total redit le même poids que les lignes qu'il ferme, dans
           la colonne posée juste à côté du côté qui manque, et son écart au
           plus chargé avec lui. */
        gardes,
        ecartTranche,
        geste ? gesteEcrit(geste.at) : '— aucun geste',
      ].join('\t'),
    );
  });
  /* La ligne qui ferme le tableau : le total des écrans encore ouverts de
     toutes les tranches, sous la dernière — un seul chiffre à lire, au lieu
     d'additionner les sous-totaux de tête. Le côté dominant s'y compte sur
     l'ensemble, avec la même règle que chaque tranche. */
  /* Le côté dominant se lit sur la même règle que la ligne de total du CSV des
     tranches ouvertes : les deux feuilles ne peuvent plus se contredire. */
  const coteTotal = coteDominantTranchesEcrit(etat, ouvertes);
  /* La tranche qui garde le plus d'écrans encore ouverts, sur la même règle
     que la pastille de position : le tableau daté et la tête de frise nomment
     la même tranche, et ne peuvent plus se contredire. */
  const gardeuse = trancheQuiGardeLePlus(etat, ouvertes, tri);
  const gardeuseDit = gardeuse
    ? ` · la tranche qui en garde le plus : ${nomTrancheFrise(
        gardeuse.tranche,
      )} · ${gardeuse.n} écran(s) encore ouvert(s) des deux côtés`
    : '';
  /* Le dernier geste de ces tranches-là, quel qu'il soit : la ligne de total
     date ainsi le retard global — depuis combien de temps plus rien n'a bougé
     dans ce qui reste ouvert. Les gestes sont gardés du plus récent au plus
     ancien, mais on ne s'y fie pas : on compare les instants. */
  const plusRecentGeste = gestes
    .filter((geste) => dedans(geste.de) && dedans(geste.a))
    .reduce<RelectureGeste | null>(
      (acc, geste) =>
        !acc || new Date(geste.at).getTime() > new Date(acc.at).getTime() ? geste : acc,
      null,
    );
  /* La ligne de compte, posée au-dessus du total : elle dit l'étendue du
     retard — combien de tranches restent ouvertes, et lesquelles —, pour que
     le chiffre des écrans se lise après le nombre de tranches qu'il couvre. */
  /* Les écrans que ces tranches couvrent, tous comptés : la ligne de total
     s'y mesure, comme la colonne « Écrans gardés » de chaque tranche. */
  const ecransDedans = RELECTURE_LIGNES.filter((ligne) => dedans(ligne.n)).length;
  lignes.push(
    [
      '—',
      'Tranches ouvertes · compte',
      ouvertes.length === 0
        ? '— aucune tranche ouverte'
        : `${ouvertes.length} tranche(s) ouverte(s) · ${ouvertes
            .map((tranche) => nomTrancheFrise(tranche))
            .join(' · ')}`,
      '—',
      '—',
      '—',
    ].join('\t'),
  );
  lignes.push(
    [
      '—',
      'Toutes les tranches · total',
      /* L'étendue du rangement se lit avec le compte d'écrans : de la position
         1 à la dernière, le tableau se referme sur son ordre. */
      `${restes.length} écran(s) encore ouvert(s) sur ${ouvertes.length} tranche(s) · manque surtout ${coteTotal} · ${
        ouvertes.length === 0
          ? '— aucune tranche à ranger'
          : `rangement de la position 1 à la position ${ouvertes.length} · l’ordre se referme sur ${nomTrancheFrise(
              ouvertes[ouvertes.length - 1],
            )}`
      }${gardeuseDit}`,
      /* Le total dit ce que ces tranches gardent encore ouvert sur leur
         étendue entière : le même chiffre que la ligne de synthèse. */
      `${restes.length} / ${ecransDedans}`,
      /* L'écart se lit tranche par tranche ; la ligne de total, qui n'est pas
         une tranche, n'en porte pas. */
      '—',
      plusRecentGeste
        ? `${gesteEcrit(plusRecentGeste.at)} · aucune tranche n’a bougé depuis ${delaiEcritCourt(
            plusRecentGeste.at,
          )}`
        : '— aucun geste',
    ].join('\t'),
  );
  /* La synthèse des écrans gardés, comme la ligne du CSV et celle de la liste
     collée : ce que l'ensemble des tranches ouvertes garde encore, le total
     devant, puis chaque tranche nommée avec son poids — la répartition se lit
     sans additionner les sous-totaux de tête. */
  lignes.push(
    [
      '—',
      'Synthèse des écrans gardés',
      `${ouvertes.length} tranche(s) ouverte(s) · ${restes.length} écran(s) gardés encore ouverts des deux côtés · ${ouvertes
        .map(
          (tranche) =>
            `${nomTrancheFrise(tranche)} : ${rangsOuvertsTranche(etat, tranche).length}`,
        )
        .join(' · ')}`,
      `${restes.length} / ${ecransDedans}`,
      '—',
      '—',
    ].join('\t'),
  );
  return lignes.join('\n');
}

/** Le geste de la porte datée : le tableau à six colonnes dans le presse-papiers. */
export async function copierRangsTableauDate(
  etat: RelectureEtat = readRelecture(),
  tri: TriTranchesOuvertes = 'plan',
): Promise<boolean> {
  return copierTexte(rangsOuvertsTableauDateTexte(etat, lireGestesBande(), tri));
}

/**
 * La tranche encore ouverte qui attend depuis le plus longtemps, écrite pour un
 * message : son nom, la date de son dernier geste, puis les rangs encore à
 * fermer avec le côté qui manque.
 *
 * Là où les portes du tableau emportent tout ce qui reste, celle-ci ne prend
 * qu'une tranche — la plus ancienne ouverte —, telle qu'il faudrait la fermer :
 * elle se lit, se colle, et se referme sans rouvrir la frise ni déplier la
 * carte datée.
 */
/**
 * Une seule tranche écrite pour un message : son en-tête dit de quelle tranche
 * il s'agit — la plus ancienne, la plus récente —, puis suivent la date de son
 * dernier geste et les rangs encore à fermer avec le côté qui manque.
 *
 * Les deux portes symétriques de la tête de frise lisent cette même écriture :
 * seule l'en-tête change, le corps reste identique.
 */
function trancheSeuleTexte(
  etat: RelectureEtat,
  tranche: TrancheFrise,
  geste: RelectureGeste | null,
  entete: string,
): string {
  const lignes: string[] = [
    `PaperAtlas · ${entete} · ${nomTrancheFrise(tranche)}`,
  ];
  if (geste) {
    lignes.push(
      `Dernier geste · ${gesteEcrit(geste.at)} · ${
        geste.ferme ? 'fermé d’un coup' : 'rouvert d’un coup'
      } · ${geste.n} écran(s) touchés`,
    );
  } else {
    lignes.push('Dernier geste · aucun geste retenu sur cette tranche');
  }
  lignes.push(`À fermer · ${rangsOuvertsEcritsDe(etat, tranche.de, tranche.a)}`);
  lignes.push('Carnet de cet appareil, jamais en base.');
  return lignes.join('\n');
}

export function trancheAncienneTexte(
  etat: RelectureEtat,
  tranche: TrancheFrise,
  geste: RelectureGeste | null = null,
): string {
  return trancheSeuleTexte(
    etat,
    tranche,
    geste,
    'tranche la plus ancienne encore ouverte',
  );
}

/**
 * La tranche encore ouverte touchée le plus récemment, écrite pour un message :
 * la sœur de la plus ancienne. Là où celle-ci dit ce qui attend depuis
 * longtemps, celle-là dit ce qui vient de bouger — et ce qu'il reste à y
 * fermer, prêt à être collé et refermé.
 */
export function trancheRecenteTexte(
  etat: RelectureEtat,
  tranche: TrancheFrise,
  geste: RelectureGeste | null = null,
): string {
  return trancheSeuleTexte(
    etat,
    tranche,
    geste,
    'tranche la plus récemment touchée encore ouverte',
  );
}

/** Le geste de la porte : la tranche la plus ancienne, prête à être fermée. */
export async function copierTrancheAncienne(
  etat: RelectureEtat,
  tranche: TrancheFrise,
  geste: RelectureGeste | null = null,
): Promise<boolean> {
  return copierTexte(trancheAncienneTexte(etat, tranche, geste));
}

/** Le geste de la porte symétrique : la tranche touchée le plus récemment. */
export async function copierTrancheRecente(
  etat: RelectureEtat,
  tranche: TrancheFrise,
  geste: RelectureGeste | null = null,
): Promise<boolean> {
  return copierTexte(trancheRecenteTexte(etat, tranche, geste));
}

/**
 * Une tranche écrite en bloc pour la feuille des extrêmes : son titre, la date
 * de son dernier geste, puis les rangs encore à fermer, côté qui manque
 * compris — la même écriture que la porte d'une seule tranche.
 */
function trancheBlocTexte(
  etat: RelectureEtat,
  tranche: TrancheFrise,
  geste: RelectureGeste | null,
  titre: string,
): string[] {
  const lignes: string[] = [`— ${titre} · ${nomTrancheFrise(tranche)}`];
  if (geste) {
    lignes.push(
      `Dernier geste · ${gesteEcrit(geste.at)} · ${
        geste.ferme ? 'fermé d’un coup' : 'rouvert d’un coup'
      } · ${geste.n} écran(s) touchés`,
    );
  } else {
    lignes.push('Dernier geste · aucun geste retenu sur cette tranche');
  }
  lignes.push(`À fermer · ${rangsOuvertsEcritsDe(etat, tranche.de, tranche.a)}`);
  return lignes;
}

/**
 * Les deux tranches extrêmes encore ouvertes, écrites ensemble pour un message :
 * la plus ancienne — ce qui attend depuis le plus longtemps — et la plus
 * récemment touchée — ce qui vient de bouger —, chacune avec la date de son
 * dernier geste et ses rangs encore à fermer.
 *
 * Là où les deux portes voisines emportent une tranche chacune, celle-ci prend
 * les deux bords du carnet d'un même geste : le retard et le mouvement se
 * lisent dans une seule feuille. Quand une seule tranche est à la fois la plus
 * ancienne et la plus récente, elle n'est écrite qu'une fois et la feuille le
 * dit, au lieu de la répéter.
 */
export function tranchesExtremesTexte(
  etat: RelectureEtat,
  ancienne: TrancheFrise,
  gesteAncienne: RelectureGeste | null,
  recente: TrancheFrise,
  gesteRecente: RelectureGeste | null,
): string {
  const lignes: string[] = ['PaperAtlas · les deux tranches extrêmes encore ouvertes'];
  const meme = ancienne.de === recente.de && ancienne.a === recente.a;
  lignes.push(...trancheBlocTexte(etat, ancienne, gesteAncienne, 'la plus ancienne'));
  if (meme) {
    lignes.push('La même tranche est la plus ancienne et la plus récemment touchée.');
  } else {
    lignes.push(
      ...trancheBlocTexte(etat, recente, gesteRecente, 'la plus récemment touchée'),
    );
  }
  lignes.push('Carnet de cet appareil, jamais en base.');
  return lignes.join('\n');
}

/** Le geste de la porte des extrêmes : les deux bords du carnet dans le presse-papiers. */
export async function copierTranchesExtremes(
  etat: RelectureEtat,
  ancienne: TrancheFrise,
  gesteAncienne: RelectureGeste | null,
  recente: TrancheFrise,
  gesteRecente: RelectureGeste | null,
): Promise<boolean> {
  return copierTexte(
    tranchesExtremesTexte(etat, ancienne, gesteAncienne, recente, gesteRecente),
  );
}

/**
 * Un seul clic, écrit pour un message : sa date, son sens, le total d'écrans
 * qu'il a touchés et ses tranches une à une — rien d'autre.
 *
 * Là où les portes du tableau emportent tout ce qui reste, celle-ci ne prend
 * que le clic qu'on regarde : de quoi signaler un geste groupé précis, sans
 * joindre les autres gestes de la carte ni la feuille entière.
 */
export function clicSeulTexte(
  gestes: RelectureGeste[],
  geste: RelectureGeste,
): string {
  const clic = ecransDuClicParTranche(gestes, geste);
  const duClic = gestesDuMemeInstant(gestes, geste);
  const total = duClic.reduce((somme, entree) => somme + entree.n, 0);
  const lignes: string[] = [
    `PaperAtlas · un seul clic · ${gesteEcrit(geste.at)} · ${
      geste.ferme ? 'fermé d’un coup' : 'rouvert d’un coup'
    } · ${total} écran(s) au total · ${clic.tranches.length} tranche(s)`,
  ];
  clic.tranches.forEach((entree) => {
    lignes.push(`${entree.nom} : ${entree.n} écran(s)`);
  });
  lignes.push('Carnet de cet appareil, jamais en base.');
  return lignes.join('\n');
}

/** Le geste de la porte d'un seul clic : ce clic-là dans le presse-papiers. */
export async function copierClicSeul(
  gestes: RelectureGeste[],
  geste: RelectureGeste,
): Promise<boolean> {
  return copierTexte(clicSeulTexte(gestes, geste));
}

/**
 * Copie la liste dans le presse-papiers. Un navigateur qui le refuse (page non
 * sécurisée, permission fermée) retombe sur la zone de texte : le geste répond
 * vrai ou faux, il ne laisse jamais l'écran sans réponse.
 */
export async function copierRelecture(): Promise<boolean> {
  return copierTexte(relectureTexte());
}

/**
 * La feuille d'une seule tranche : les écrans qu'elle couvre, leurs deux
 * cases, puis les gestes datés de cette tranche-là. Une tranche agitée se
 * relit ainsi dans son propre fichier, sans traverser les trente écrans ni les
 * gestes des autres tournées.
 *
 * Les remises à zéro ne s'attachent à aucune tranche : la feuille ne garde que
 * celles tombées entre le plus ancien et le plus récent geste de la tranche,
 * celles qui expliquent un carnet qui repart de plus loin qu'on ne l'attend.
 */
export function relectureCsvTranche(de: number, a: number): string {
  const etat = readRelecture();
  const dedans = RELECTURE_LIGNES.filter((ligne) => ligne.n >= de && ligne.n <= a);
  const tournee = RELECTURE_TOURNEES.find((t) => t.de === de && t.a === a) ?? null;
  const lignes: string[] = [];

  lignes.push(
    [
      'Rang',
      'Tournée',
      'Reprise',
      'Écran',
      'Adresse',
      'Fichiers de textes',
      'À surveiller',
      'Arabe (AR)',
      'Anglais (EN)',
      'Les deux',
      'Côté coché',
    ]
      .map(cellule)
      .join(';'),
  );

  dedans.forEach((ligne) => {
    const ar = estRelue(etat, 'ar', ligne.n);
    const en = estRelue(etat, 'en', ligne.n);
    const liee = tourneeDeRang(ligne.n);
    lignes.push(
      [
        rangEcrit(ligne.n),
        etiquetteTournee(ligne.n),
        liee ? repriseEcrite(etat, liee) : '',
        ligne.page,
        ligne.path,
        ligne.textes,
        ligne.vigilance,
        ar ? 'x' : '',
        en ? 'x' : '',
        ar && en ? 'x' : '',
        ar && !en ? 'Arabe seul' : en && !ar ? 'Anglais seul' : '',
      ]
        .map(cellule)
        .join(';'),
    );
  });

  const ar = dedans.filter((ligne) => estRelue(etat, 'ar', ligne.n)).length;
  const en = dedans.filter((ligne) => estRelue(etat, 'en', ligne.n)).length;
  const deux = dedans.filter(
    (ligne) => estRelue(etat, 'ar', ligne.n) && estRelue(etat, 'en', ligne.n),
  ).length;
  const unCote = dedans.filter(
    (ligne) => estRelue(etat, 'ar', ligne.n) !== estRelue(etat, 'en', ligne.n),
  ).length;

  lignes.push(
    [
      'Total de la tranche',
      `${deux} page(s) relue(s) des deux côtés`,
      /* Le nom de la tranche et sa reprise, pour qu'un fichier isolé dise de
         quelle portion du plan il parle. */
      tournee ? `Tournée ${tournee.id} → écran ${repriseEcrite(etat, tournee)}` : 'Hors tournée',
      `écrans ${rangEcrit(de)}–${rangEcrit(a)}`,
      'Carnet de cet appareil, jamais en base',
      '',
      '',
      `${ar} / ${dedans.length}`,
      `${en} / ${dedans.length}`,
      `${deux} / ${dedans.length}`,
      `${unCote} page(s) d’un seul côté`,
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la feuille des gestes, réduite à la tranche ---- */
  lignes.push('');
  lignes.push(
    [
      'Geste de tranche',
      'Date',
      'Tranche',
      'Écrans',
      'Geste',
      'Écrans touchés',
      'Fermés au total après',
    ]
      .map(cellule)
      .join(';'),
  );
  const gestes = lireGestesBande()
    .filter((geste) => geste.de === de && geste.a === a);
  if (gestes.length === 0) {
    lignes.push(
      [
        'Geste de tranche',
        '—',
        `${rangEcrit(de)}–${rangEcrit(a)}`,
        '—',
        'Aucun geste groupé retenu sur cette tranche',
        '0',
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  } else {
    const plusAncien = gestes[gestes.length - 1];
    const debut = new Date(plusAncien.at).getTime();
    const fin = new Date(gestes[0].at).getTime();
    lireOublisGestes()
      .filter((iso) => {
        const quand = new Date(iso).getTime();
        return !Number.isNaN(quand) && quand >= debut && quand <= fin;
      })
      .forEach((iso) => {
        lignes.push(
          [
            `Carnet remis à zéro le ${gesteEcrit(iso)}`,
            gesteEcrit(iso),
            `${rangEcrit(de)}–${rangEcrit(a)}`,
            '—',
            'Gestes de tranche oubliés pendant cette tranche',
            '0',
            '',
          ]
            .map(cellule)
            .join(';'),
        );
      });
    gestes.forEach((geste) => {
      lignes.push(
        [
          'Geste de tranche',
          gesteEcrit(geste.at),
          etiquetteTournee(geste.de) || `Hors tournée (${geste.de}–${geste.a})`,
          `${geste.de}–${geste.a}`,
          geste.ferme ? 'Fermé d’un coup' : 'Rouvert d’un coup',
          String(geste.n),
          geste.apres === null ? '—' : `${geste.apres} / ${RELECTURE_TOTAL}`,
        ]
          .map(cellule)
          .join(';'),
      );
    });
    lignes.push(
      [
        'Geste de tranche',
        '—',
        `${rangEcrit(de)}–${rangEcrit(a)}`,
        '—',
        `${gestes.length} geste(s) retenu(s) sur cette tranche`,
        String(gestes.reduce((total, geste) => total + geste.n, 0)),
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  }

  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le nom du fichier d'une tranche : il dit ses écrans, sans dater le carnet. */
export function nomFichierTranche(de: number, a: number): string {
  return `paperatlas-relecture-tranche-${rangEcrit(de)}-${rangEcrit(a)}.csv`;
}

/**
 * Le geste de la porte posée dans la tête de frise : un fichier réduit à la
 * tranche affichée, téléchargé sans quitter la console.
 */
export function telechargerRelectureCsvTranche(de: number, a: number): void {
  const blob = new Blob([relectureCsvTranche(de, a)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichierTranche(de, a);
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---- le délai écoulé depuis le dernier geste d'une tranche ---- */

/**
 * Le délai écoulé, en une unité : l'instant, les minutes, les heures ou les
 * jours. La frise le dit à côté de la date du dernier geste — une date seule
 * ne dit pas si la tranche a bougé il y a une heure ou il y a trois semaines.
 */
export type RelectureDelai = {
  /** La valeur dans l'unité retenue. */
  n: number;
  /** L'unité : « instant », minutes, heures ou jours. */
  unite: 'instant' | 'min' | 'h' | 'j';
};

/**
 * Le délai entre un instant noté et maintenant, ramené à l'unité la plus
 * lisible : moins d'une minute le dit tel quel, puis les minutes, puis les
 * heures, puis les jours. Un instant illisible rend `null` plutôt qu'un chiffre
 * inventé, et une date à venir se lit comme « à l'instant ».
 */
export function delaiDepuis(
  iso: string,
  maintenant: number = Date.now(),
): RelectureDelai | null {
  const quand = new Date(iso).getTime();
  if (Number.isNaN(quand)) return null;
  const minutes = Math.floor(Math.max(maintenant - quand, 0) / 60000);
  if (minutes < 1) return { n: 0, unite: 'instant' };
  if (minutes < 60) return { n: minutes, unite: 'min' };
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return { n: heures, unite: 'h' };
  return { n: Math.floor(heures / 24), unite: 'j' };
}

/* ---- les gestes d'un même clic, et les tranches qu'il a touchées ---- */

/**
 * Les gestes notés par un même clic : ceux qui portent le même instant. Une
 * réouverture groupée note une tranche à la fois, mais toutes sous la même
 * date — la frise peut donc dire combien de tranches ce seul clic a remuées,
 * au lieu de les lire comme des gestes successifs.
 *
 * Un geste de tranche ordinaire n'a pas de compagnon : sa liste ne contient
 * que lui, et le compte vaut 1.
 */
export function gestesDuMemeInstant(
  gestes: RelectureGeste[],
  geste: RelectureGeste,
): RelectureGeste[] {
  return gestes.filter((entree) => entree.at === geste.at);
}

/**
 * Combien de tranches un clic a touchées : le nombre de gestes qui partagent
 * son instant. La ligne du dernier geste le dit, et la feuille l'écrit aussi —
 * un geste groupé ne se confond plus avec un geste de tranche solitaire.
 */
export function tranchesDuMemeInstant(
  gestes: RelectureGeste[],
  geste: RelectureGeste,
): number {
  return gestesDuMemeInstant(gestes, geste).length;
}

/**
 * Les autres tranches qu'un même clic a emportées : celles notées sous le même
 * instant, nommées comme dans la frise — « Tournée 2 (11–20) » —, sa propre
 * tranche exclue.
 *
 * La carte datée d'une tranche rappelle ainsi que son geste n'était pas seul :
 * une réouverture groupée se relit avec les tranches qu'elle a remuées en même
 * temps, au lieu de laisser chaque carte ignorer ses voisines.
 */
export function autresTranchesDuClic(
  gestes: RelectureGeste[],
  geste: RelectureGeste,
): string[] {
  return gestesDuMemeInstant(gestes, geste)
    .filter((entree) => entree.de !== geste.de || entree.a !== geste.a)
    .map(
      (entree) =>
        etiquetteTournee(entree.de) ||
        `Hors tournée (${rangEcrit(entree.de)}–${rangEcrit(entree.a)})`,
    );
}

/** Une tranche touchée par un même clic : son nom et les écrans qu'elle y a portés. */
export type ClicTranche = {
  /** Le premier rang de la tranche, pour la ranger dans l'ordre du plan. */
  de: number;
  /** Le nom de la tranche, écrit comme dans la frise. */
  nom: string;
  /** Combien d'écrans les gestes de cette tranche ont touchés dans ce clic. */
  n: number;
};

/**
 * Ce qu'un même clic a touché, tranche par tranche : la somme des écrans de
 * tous les gestes notés sous le même instant, chaque tranche nommée comme dans
 * la frise.
 *
 * La carte datée lit ainsi l'étendue du clic en une ligne — la somme en tête,
 * puis ce que chaque tranche y a porté —, au lieu de laisser le relecteur
 * additionner les tranches de tête. Un geste de tranche solitaire rend sa propre
 * tranche, et la carte ne s'en sert pas : elle ne l'affiche que si le clic en a
 * réellement emporté plusieurs.
 */
export function ecransDuClicParTranche(
  gestes: RelectureGeste[],
  geste: RelectureGeste,
): { total: number; tranches: ClicTranche[] } {
  const duClic = gestesDuMemeInstant(gestes, geste);
  const total = duClic.reduce((somme, entree) => somme + entree.n, 0);
  const parTranche = new Map<string, ClicTranche>();
  duClic.forEach((entree) => {
    const cle = `${entree.de}-${entree.a}`;
    const nom =
      etiquetteTournee(entree.de) ||
      `Hors tournée (${rangEcrit(entree.de)}–${rangEcrit(entree.a)})`;
    const deja = parTranche.get(cle);
    if (deja) {
      deja.n += entree.n;
    } else {
      parTranche.set(cle, { de: entree.de, nom, n: entree.n });
    }
  });
  const tranches = Array.from(parTranche.values()).sort((a, b) => a.de - b.de);
  return { total, tranches };
}

/**
 * La dernière réouverture d'une tranche, avec le nombre de tranches que le
 * même clic a touchées : la feuille des tranches ouvertes date ainsi le
 * passage du geste groupé, au lieu de laisser la colonne vide.
 *
 * `null` quand la tranche n'a jamais été rouverte.
 */
export function derniereReouverture(
  de: number,
  a: number,
  gestes: RelectureGeste[] = lireGestesBande(),
): { at: string; tranches: number } | null {
  const geste = gestes.find(
    (entree) => entree.de === de && entree.a === a && !entree.ferme,
  );
  if (!geste) return null;
  return { at: geste.at, tranches: tranchesDuMemeInstant(gestes, geste) };
}

/* ---- les écrans qu'un geste de tranche a laissés ouverts ---- */

/**
 * Combien d'écrans de sa tranche un geste a laissés encore ouverts — c'est-à-
 * dire non fermés des deux côtés juste après lui.
 *
 * Le chiffre se déduit du geste et non de l'état du jour : une tranche retouchée
 * depuis se lirait autrement, et le survol doit dire ce que ce clic-là a laissé,
 * pas ce qui reste aujourd'hui. Un geste qui fermait laisse la tranche moins
 * `n` écrans ouverts ; un geste qui rouvrait les rend tous ouverts.
 *
 * `null` pour un geste noté avant que le compte « déjà fermés » n'existe : le
 * survol écrit alors qu'il n'est pas noté, plutôt qu'un chiffre inventé.
 */
export function ecransOuvertsApresGeste(geste: RelectureGeste): number | null {
  if (geste.deja === null) return null;
  const total = geste.a - geste.de + 1;
  if (total <= 0) return null;
  const restants = geste.ferme
    ? total - geste.deja - geste.n
    : total - geste.deja + geste.n;
  return Math.max(Math.min(restants, total), 0);
}

/* ---- les tranches de la frise, et celles qui restent à finir ---- */

/** Une tranche de la frise : une tournée, ou celle qui ferme le plan. */
export type TrancheFrise = {
  /** Le rang de la tournée, ou null pour la tranche qui suit la dernière. */
  id: number | null;
  /** Le premier rang qu'elle couvre. */
  de: number;
  /** Le dernier rang qu'elle couvre. */
  a: number;
};

/**
 * Les tranches de la frise, déduites des tournées et du plan : une par tournée,
 * puis celle qui va du dernier écran de la dernière tournée à la fin des trente.
 * Une seule règle, pour que la tête et la feuille nomment les mêmes tranches.
 */
export function tranchesFrise(): TrancheFrise[] {
  const tranches: TrancheFrise[] = RELECTURE_TOURNEES.map((tournee) => ({
    id: tournee.id,
    de: tournee.de,
    a: tournee.a,
  }));
  const de = SECONDE_TOURNEE + 1;
  if (de <= RELECTURE_TOTAL) {
    tranches.push({ id: null, de, a: RELECTURE_TOTAL });
  }
  return tranches;
}

/**
 * Le côté qui manque le plus souvent sur les écrans encore ouverts d'une
 * tranche — « AR (3) », « EN (2) », ou « AR et EN à égalité (2) » quand les
 * deux pèsent autant. Un écran qui manque des deux côtés compte dans les deux.
 *
 * Le tableau daté et la feuille des tranches ouvertes lisent la même règle :
 * l'écran et le fichier ne se contredisent jamais.
 */
function coteDominantEcrit(etat: RelectureEtat, de: number, a: number): string {
  const ouverts = RELECTURE_LIGNES.filter((ligne) => ligne.n >= de && ligne.n <= a).filter(
    (ligne) => !etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n),
  );
  const ar = ouverts.filter((ligne) => !etat.ar.includes(ligne.n)).length;
  const en = ouverts.filter((ligne) => !etat.en.includes(ligne.n)).length;
  if (ar === en) return `AR et EN à égalité (${ar})`;
  return ar > en ? `AR (${ar})` : `EN (${en})`;
}

/**
 * Le côté qui manque le plus souvent sur les écrans encore ouverts de
 * plusieurs tranches — le total d'une feuille qui en emporte plusieurs. Il
 * lit exactement la même règle que le côté d'une seule tranche : un écran qui
 * manque des deux côtés compte dans les deux, et l'égalité se dit franchement.
 *
 * Le tableau daté et la feuille des tranches ouvertes puisent ici : leur ligne
 * de total ne peut pas contredire leurs sous-totaux.
 */
function coteDominantTranchesEcrit(
  etat: RelectureEtat,
  tranches: TrancheFrise[],
): string {
  const ouverts = RELECTURE_LIGNES.filter((ligne) =>
    tranches.some((tranche) => ligne.n >= tranche.de && ligne.n <= tranche.a),
  ).filter((ligne) => !etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n));
  const ar = ouverts.filter((ligne) => !etat.ar.includes(ligne.n)).length;
  const en = ouverts.filter((ligne) => !etat.en.includes(ligne.n)).length;
  if (ar === en) return `AR et EN à égalité (${ar})`;
  return ar > en ? `AR (${ar})` : `EN (${en})`;
}

/**
 * Le délai écoulé depuis un instant, écrit court pour la feuille — « 3 j »,
 * « 2 h », « 12 min », « moins d’une minute ». Il suit la même horloge que la
 * frise, si bien que la ligne de total et les dates du carnet ne peuvent pas
 * se contredire.
 */
function delaiEcritCourt(iso: string, maintenant: number = Date.now()): string {
  const delai = delaiDepuis(iso, maintenant);
  if (!delai) return '—';
  if (delai.unite === 'instant') return 'moins d’une minute';
  if (delai.unite === 'min') return `${delai.n} min`;
  if (delai.unite === 'h') return `${delai.n} h`;
  return `${delai.n} j`;
}

/** Le nom d'une tranche tel qu'il se lit dans les fichiers emportés. */
export function nomTrancheFrise(tranche: TrancheFrise): string {
  return tranche.id === null
    ? `Hors tournée (${rangEcrit(tranche.de)}–${rangEcrit(tranche.a)})`
    : `Tournée ${tranche.id} (${rangEcrit(tranche.de)}–${rangEcrit(tranche.a)})`;
}

/** Les rangs encore non fermés des deux côtés dans une tranche. */
export function rangsOuvertsTranche(etat: RelectureEtat, tranche: TrancheFrise): number[] {
  return rangsTournee({ id: tranche.id ?? 0, de: tranche.de, a: tranche.a }).filter(
    (n) => !etat.ar.includes(n) || !etat.en.includes(n),
  );
}

/**
 * L'ordre retenu pour les tranches encore ouvertes, écrit en toutes lettres
 * pour les listes et les feuilles emportées : celui du plan, ou la fin
 * d'abord. La même phrase sert au tableau daté, au CSV et à la liste collée —
 * un fichier ou un message se relit seul, sans la tête de frise.
 */
export function ordreTranchesEcrit(tri: TriTranchesOuvertes): string {
  return tri === 'fin'
    ? 'fin d’abord — la tranche la plus avancée dans le plan en tête'
    : 'ordre du plan — de la première tranche à la dernière';
}

/**
 * Les tranches encore ouvertes, rangées dans l'ordre choisi : celui du plan —
 * de la première à la dernière —, ou la fin d'abord, la tranche la plus avancée
 * dans le plan en tête. Une seule règle, pour que la tête de frise, le tableau
 * daté, le CSV et la liste collée ne se contredisent jamais.
 */
export function trierTranchesOuvertes(
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): TrancheFrise[] {
  if (tri !== 'fin') return tranches;
  return [...tranches].sort((a, b) => b.a - a.a || b.de - a.de);
}

/**
 * Combien de tranches le tri a réellement déplacées : celles qui ne tombent
 * pas au même rang dans l'ordre du plan et dans l'ordre retenu.
 *
 * Le chiffre se mesure sur les tranches emportées, et non sur leur nombre : un
 * tri qui laisse une tranche en place ne l'a pas déplacée, et un ordre du plan
 * n'en déplace aucune. La feuille et la liste collée le disent à côté du nom
 * de l'ordre, pour qu'un fichier se relise seul.
 */
export function tranchesDeplaceesParTri(
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): number {
  const plan = [...tranches].sort((a, b) => a.de - b.de || a.a - b.a);
  const choisi = trierTranchesOuvertes(tranches, tri);
  return choisi.filter(
    (tranche, i) => !plan[i] || plan[i].de !== tranche.de || plan[i].a !== tranche.a,
  ).length;
}

/**
 * L'ordre retenu écrit avec son poids : le nom de l'ordre, puis combien de
 * tranches le tri a déplacées. La phrase sert à la ligne de tête du CSV, à
 * celle du tableau daté et à l'en-tête de la liste collée — les trois portes
 * emportent le même chiffre et ne peuvent plus se contredire.
 */
export function ordreTranchesEcritCompte(
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): string {
  const deplacees = tranchesDeplaceesParTri(tranches, tri);
  return `${ordreTranchesEcrit(tri)} · ${
    deplacees === 0
      ? 'aucune tranche déplacée par le tri'
      : `${deplacees} tranche(s) déplacée(s) par le tri`
  }`;
}

/**
 * La position d'une tranche dans l'ordre retenu, écrite « 2 / 3 » : son rang
 * dans le rangement, puis le nombre de tranches rangées.
 *
 * La feuille des tranches ouvertes en donne une colonne, ligne par ligne : un
 * fichier ouvert hors console se relit ainsi écran par écran, et l'on voit à
 * quel rang du rangement chaque tranche s'assied — pas seulement le nom de
 * l'ordre dans la ligne de tête.
 *
 * « — » quand la tranche n'est pas de celles qui sont rangées : elle ne prend
 * pas de position dans une liste qu'elle ne traverse pas.
 */
export function positionTrancheEcrit(
  tranches: TrancheFrise[],
  tranche: TrancheFrise,
  tri: TriTranchesOuvertes = 'plan',
): string {
  const rangees = trierTranchesOuvertes(tranches, tri);
  const rang = rangees.findIndex(
    (entree) => entree.de === tranche.de && entree.a === tranche.a,
  );
  if (rang < 0) return '—';
  return `${rang + 1} / ${rangees.length}`;
}

/**
 * Parmi les tranches rangées, celle qui garde le plus d'écrans encore ouverts,
 * lue dans l'ordre retenu et rendue avec son compte.
 *
 * La pastille de position la nomme au survol, à côté du poids du tri et de ses
 * deux bornes : le rangement dit non seulement combien il a remué de tranches,
 * mais laquelle pèse le plus dans ce qui reste ouvert. Une égalité garde la
 * première rencontrée dans l'ordre retenu, si bien que la lecture ne saute pas
 * d'un survol à l'autre.
 *
 * `null` quand aucune tranche n'est rangée, ou quand toutes sont fermées des
 * deux côtés — il n'y a alors rien à nommer.
 */
export function trancheQuiGardeLePlus(
  etat: RelectureEtat,
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): { tranche: TrancheFrise; n: number } | null {
  const rangees = trierTranchesOuvertes(tranches, tri);
  let gardeuse: { tranche: TrancheFrise; n: number } | null = null;
  for (let i = 0; i < rangees.length; i += 1) {
    const tranche = rangees[i];
    const n = rangsOuvertsTranche(etat, tranche).length;
    if (n > 0 && (!gardeuse || n > gardeuse.n)) gardeuse = { tranche, n };
  }
  return gardeuse;
}

/**
 * Parmi les tranches rangées, celle qui garde le moins d'écrans encore ouverts,
 * lue dans l'ordre retenu et rendue avec son compte.
 *
 * Le pendant de la tranche qui en garde le plus : le survol du tableau daté la
 * nomme pour que la ligne de synthèse se lise depuis ses deux bords — ce que la
 * plus chargée pèse, et ce que la plus légère en est loin. Une égalité garde la
 * première rencontrée dans l'ordre retenu, si bien que la lecture ne saute pas
 * d'un survol à l'autre.
 *
 * `null` quand aucune tranche n'est rangée, ou quand toutes sont fermées des
 * deux côtés — il n'y a alors rien à nommer.
 */
export function trancheQuiGardeLeMoins(
  etat: RelectureEtat,
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): { tranche: TrancheFrise; n: number } | null {
  const rangees = trierTranchesOuvertes(tranches, tri);
  let legere: { tranche: TrancheFrise; n: number } | null = null;
  for (let i = 0; i < rangees.length; i += 1) {
    const tranche = rangees[i];
    const n = rangsOuvertsTranche(etat, tranche).length;
    if (n > 0 && (!legere || n < legere.n)) legere = { tranche, n };
  }
  return legere;
}

/**
 * La dispersion des écarts entre les tranches rangées : de combien d'écrans
 * chacune se tient de celle qui en garde le plus, lues ensemble plutôt qu'une
 * par une.
 *
 * La moyenne dit la dispersion d'un seul regard — un rangement resserré ou
 * étalé —, l'étendue la borne des deux côtés, et la tranche la plus légère
 * nomme le bord qui pèse le moins. Le survol de la colonne « Écart au plus
 * chargé » du tableau daté, la liste collée et la feuille des tranches
 * ouvertes puisent tous ici : les trois lectures ne peuvent plus se
 * contredire.
 *
 * `null` quand aucune tranche n'est rangée : il n'y a alors rien à disperser.
 */
export type DispersionEcarts = {
  /** Combien de tranches pèsent dans la moyenne. */
  tranches: number;
  /** L'écart moyen, écrit à la française — « 1,3 », « 2 ». */
  moyenne: string;
  /** Le plus petit écart — celui de la plus légère. */
  min: number;
  /** Le plus grand écart — 0 quand la plus chargée en garde le plus. */
  max: number;
  /** La tranche la plus légère, avec son poids et son écart. */
  legere: { tranche: TrancheFrise; n: number; ecart: number } | null;
  /** La tranche qui ferme le rangement, avec son poids et son écart. */
  fermante: { tranche: TrancheFrise; n: number; ecart: number } | null;
};

/**
 * La dispersion des écarts, lue sur les tranches rangées dans l'ordre retenu.
 * Une seule règle pour le survol du tableau daté, la liste collée et la
 * feuille des tranches ouvertes.
 */
export function dispersionEcarts(
  etat: RelectureEtat,
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): DispersionEcarts | null {
  const rangees = trierTranchesOuvertes(tranches, tri);
  if (rangees.length === 0) return null;
  const poids = rangees.map((tranche) => ({
    tranche,
    n: rangsOuvertsTranche(etat, tranche).length,
  }));
  const plusCharge = poids.reduce((max, entree) => Math.max(max, entree.n), 0);
  const ecarts = poids.map((entree) => Math.max(plusCharge - entree.n, 0));
  const somme = ecarts.reduce((total, ecart) => total + ecart, 0);
  const brute = somme / ecarts.length;
  const moyenne = Number.isInteger(brute)
    ? String(brute)
    : String(Math.round(brute * 10) / 10).replace('.', ',');
  const min = Math.min(...ecarts);
  const max = Math.max(...ecarts);
  /* La plus légère : la première rencontrée dans l'ordre retenu, pour que la
     lecture ne saute pas d'un survol à l'autre. */
  const legere = poids.reduce<{ tranche: TrancheFrise; n: number; ecart: number } | null>(
    (acc, entree) => {
      if (entree.n <= 0) return acc;
      if (!acc || entree.n < acc.n) {
        return {
          tranche: entree.tranche,
          n: entree.n,
          ecart: Math.max(plusCharge - entree.n, 0),
        };
      }
      return acc;
    },
    null,
  );
  const fermanteTranche = rangees[rangees.length - 1];
  const fermanteN = rangsOuvertsTranche(etat, fermanteTranche).length;
  return {
    tranches: rangees.length,
    moyenne,
    min,
    max,
    legere,
    fermante: {
      tranche: fermanteTranche,
      n: fermanteN,
      ecart: Math.max(plusCharge - fermanteN, 0),
    },
  };
}

/**
 * La tranche encore ouverte dont le dernier geste est le plus ancien du carnet :
 * celle qui attend depuis le plus longtemps.
 *
 * La liste copiée la nomme dans son en-tête, avec la date de son dernier geste
 * et le délai écoulé — le retard se date sans rouvrir la frise ni déplier les
 * cartes. Une tranche qu'aucun geste n'a touchée ne se nomme pas : `null` plutôt
 * qu'une date inventée.
 */
export function trancheAncienneOuverte(
  tranches: TrancheFrise[],
  gestes: RelectureGeste[] = lireGestesBande(),
): { tranche: TrancheFrise; geste: RelectureGeste } | null {
  let ancienne: { tranche: TrancheFrise; geste: RelectureGeste } | null = null;
  for (let i = 0; i < tranches.length; i += 1) {
    const tranche = tranches[i];
    const geste =
      gestes.find((entree) => entree.de === tranche.de && entree.a === tranche.a) ?? null;
    if (!geste) continue;
    if (
      !ancienne ||
      new Date(geste.at).getTime() < new Date(ancienne.geste.at).getTime()
    ) {
      ancienne = { tranche, geste };
    }
  }
  return ancienne;
}

/**
 * Les deux bornes de l'ordre retenu : la tranche qui l'ouvre et celle qui le
 * ferme, nommées comme dans la frise.
 *
 * Le survol de la pastille de position les dit, pour que l'ordre ne se lise pas
 * seulement par son compte de tranches déplacées : on sait d'un coup d'œil par
 * quelle tranche le rangement commence et par laquelle il finit.
 *
 * `null` quand aucune tranche n'est rangée — il n'y a alors ni ouverture ni
 * fermeture à nommer.
 */
export function bornesOrdreEcrit(
  tranches: TrancheFrise[],
  tri: TriTranchesOuvertes = 'plan',
): { ouvre: string; ferme: string } | null {
  const rangees = trierTranchesOuvertes(tranches, tri);
  if (rangees.length === 0) return null;
  return {
    ouvre: nomTrancheFrise(rangees[0]),
    ferme: nomTrancheFrise(rangees[rangees.length - 1]),
  };
}

/**
 * La tranche que le tri en cours a déplacée le plus récemment : parmi celles
 * qui ne tombent pas au même rang dans l'ordre du plan et dans l'ordre retenu,
 * celle dont le dernier geste est le plus récent.
 *
 * La ligne du dernier geste de la frise la nomme : le rangement ne dit pas
 * seulement combien de tranches il a remuées, il dit laquelle il a remuée le
 * plus récemment — de quoi savoir de quel côté du plan l'ordre vient de
 * bouger, sans ouvrir de fichier.
 *
 * `null` quand l'ordre retenu ne déplace rien, qu'une seule tranche reste
 * ouverte, ou qu'aucune tranche déplacée ne porte de geste daté.
 */
export function trancheDeplaceePlusRecente(
  etat: RelectureEtat,
  tri: TriTranchesOuvertes = 'plan',
  gestes: RelectureGeste[] = lireGestesBande(),
): { tranche: TrancheFrise; geste: RelectureGeste } | null {
  const ouvertes = tranchesEncoreOuvertes(etat);
  if (ouvertes.length < 2) return null;
  const plan = [...ouvertes].sort((a, b) => a.de - b.de || a.a - b.a);
  const rangees = trierTranchesOuvertes(ouvertes, tri);
  const deplacees = rangees.filter(
    (tranche, i) =>
      !plan[i] || plan[i].de !== tranche.de || plan[i].a !== tranche.a,
  );
  return deplacees.reduce<{ tranche: TrancheFrise; geste: RelectureGeste } | null>(
    (acc, tranche) => {
      const geste =
        gestes.find((entree) => entree.de === tranche.de && entree.a === tranche.a) ??
        null;
      if (!geste) return acc;
      if (!acc) return { tranche, geste };
      return new Date(geste.at).getTime() > new Date(acc.geste.at).getTime()
        ? { tranche, geste }
        : acc;
    },
    null,
  );
}

/**
 * Les tranches de la frise qui gardent au moins un écran non fermé des deux
 * côtés : celles qu'une fermeture a laissées en chemin, celles qu'une
 * réouverture a rendues à moitié faites, et celles qu'aucun geste n'a touchées.
 */
export function tranchesEncoreOuvertes(etat: RelectureEtat): TrancheFrise[] {
  return tranchesFrise().filter((tranche) => rangsOuvertsTranche(etat, tranche).length > 0);
}

/**
 * Les rangs encore à fermer d'une tranche, écrits avec le côté qui manque :
 * « 02 (AR), 05 (EN), 07 (AR+EN) ». Un compte dit combien ; cette écriture dit
 * lesquels, et de quel côté — le relecteur sait ce qui l'attend avant d'y aller.
 */
function rangsOuvertsEcritsDe(etat: RelectureEtat, de: number, a: number): string {
  const restes = RELECTURE_LIGNES
    .filter((ligne) => ligne.n >= de && ligne.n <= a)
    .filter((ligne) => !etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n))
    .map((ligne) => {
      const ar = !etat.ar.includes(ligne.n);
      const en = !etat.en.includes(ligne.n);
      const cote = ar && en ? 'AR+EN' : ar ? 'AR' : 'EN';
      return `${rangEcrit(ligne.n)} (${cote})`;
    });
  return restes.length === 0 ? '— tranche faite' : restes.join(', ');
}

/**
 * Les rangs encore à fermer de plusieurs tranches, nommés tranche par tranche :
 * « Tournée 1 (01–10) → 02 (AR), 05 (EN) · Hors tournée (21–30) → 21 (AR+EN) ».
 *
 * Le compte d'écrans de la tête de frise dit combien ; cette ligne dit où, et
 * de quel côté — de quoi savoir si le resserrement tient à une tranche ou se
 * disperse, sans déplier les cartes une à une ni ouvrir la feuille emportée.
 */
export function rangsOuvertsTranchesEcrits(
  etat: RelectureEtat,
  tranches: TrancheFrise[],
): string {
  if (tranches.length === 0) return '— aucune tranche ouverte';
  return tranches
    .map(
      (tranche) =>
        `${nomTrancheFrise(tranche)} → ${rangsOuvertsEcritsDe(etat, tranche.de, tranche.a)}`,
    )
    .join(' · ');
}

/**
 * La dernière réouverture d'une tranche, écrite pour la feuille : l'instant du
 * geste et combien de tranches ce seul clic a remuées — « 2026-11-18 09:42 ·
 * 3 tranches du même clic ». Une tranche jamais rouverte le dit franchement.
 */
function reouvertureEcrit(
  tranche: TrancheFrise,
  gestes: RelectureGeste[],
): string {
  const derniere = derniereReouverture(tranche.de, tranche.a, gestes);
  if (!derniere) return '— aucune réouverture';
  return `${gesteEcrit(derniere.at)} · ${
    derniere.tranches > 1
      ? `${derniere.tranches} tranches du même clic`
      : 'une seule tranche'
  }`;
}

/**
 * La feuille de toutes les tranches encore ouvertes, en un seul fichier :
 * chaque tranche y porte ses écrans avec leurs deux cases et le côté coché,
 * puis ses gestes datés. Une tranche déjà finie des deux côtés n'y entre pas —
 * la porte ne s'ouvre que sur ce qui reste à faire.
 *
 * Une seconde table, sous une ligne vide, date les gestes de ces tranches-là :
 * le relecteur voit ainsi, dans la même feuille, ce qui reste ouvert et par
 * quels clics groupés ces tranches ont déjà bougé.
 */
export function relectureCsvTranchesOuvertes(
  tri: TriTranchesOuvertes = 'plan',
): string {
  const etat = readRelecture();
  const ouvertes = trierTranchesOuvertes(tranchesEncoreOuvertes(etat), tri);
  const gestes = lireGestesBande();
  const lignes: string[] = [];

  const dedans = (n: number) =>
    ouvertes.some((tranche) => n >= tranche.de && n <= tranche.a);
  const ecransOuverts = RELECTURE_LIGNES.filter(
    (ligne) => dedans(ligne.n) && (!etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n)),
  ).length;
  const gestesDedans = gestes.filter((geste) => dedans(geste.de) && dedans(geste.a));

  /* L'ordre retenu dans la tête de frise descend jusqu'à la feuille : une
     ligne de tête le dit avant les colonnes, pour que le fichier se relise
     seul, sans la console pour porter le choix. */
  /* Les deux bornes du rangement : la tranche qui ouvre et celle qui ferme.
     La ligne de tête ne nomme plus seulement l'ordre et son poids, elle dit
     par quelle tranche le rangement commence — le fichier se relit seul. */
  const bornes = bornesOrdreEcrit(ouvertes, tri);
  lignes.push(
    [
      'PaperAtlas · tranches ouvertes',
      `Ordre des tranches ouvertes : ${ordreTranchesEcritCompte(ouvertes, tri)}${
        bornes
          ? ` · l’ordre s’ouvre sur ${bornes.ouvre} · l’ordre se referme sur ${bornes.ferme}`
          : ' · aucune tranche à ouvrir'
      }`,
      '',
      '',
    ]
      .map(cellule)
      .join(';'),
  );
  lignes.push(
    [
      'Tranches encore ouvertes',
      'Tranches',
      'Écrans encore à fermer',
      'Tranches portées',
    ]
      .map(cellule)
      .join(';'),
  );
  lignes.push(
    [
      'PaperAtlas · tranches qui gardent au moins un écran non fermé des deux côtés',
      String(ouvertes.length),
      String(ecransOuverts),
      /* Le nom de chaque tranche emportée, et pas seulement leur nombre :
         ouvert le fichier, on sait tout de suite de quelles portions du plan
         il parle, sans lire les colonnes du dessous. */
      ouvertes.length === 0
        ? '— aucune tranche ouverte'
        : ouvertes.map((tranche) => nomTrancheFrise(tranche)).join(' · '),
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la table des écrans, tranche par tranche ---- */
  lignes.push('');
  lignes.push(
    [
      'Tranche',
      /* Le rang de la tranche dans l'ordre retenu, posé juste à côté de son
         nom : le fichier dit ainsi, ligne par ligne, comment il est rangé —
         et pas seulement dans sa ligne de tête. */
      'Position',
      /* La colonne qui dit ce que la tranche garde encore ouvert, posée juste
         à côté de sa position : le rangement et son poids se lisent ensemble,
         ligne par ligne, sans descendre jusqu'au sous-total. */
      'Écrans gardés',
      /* L'écart à la tranche la plus chargée : combien d'écrans séparent
         chaque ligne de celle qui en garde le plus, posé à côté de son poids. */
      'Écart au plus chargé',
      /* La colonne qui date le passage du geste groupé : chaque tranche dit
         quand elle a été rouverte pour la dernière fois, et combien de
         tranches ce clic-là a emportées avec elle. */
      'Dernière réouverture',
      'Rang',
      'Écran',
      /* La colonne du sous-total, posée juste à côté des écrans : elle se
         remplit sur la ligne qui ferme chaque tranche, et laisse les lignes
         d'écran vides pour ne pas répéter le même chiffre trente fois. */
      'Sous-total de la tranche',
      /* La colonne qui compte ce que la tranche a déjà fermé, posée juste à
         côté de son sous-total : les deux se lisent ensemble — ce qui reste
         ouvert, et ce qui est déjà fait. */
      'Écrans fermés',
      /* La colonne qui date la tranche elle-même, à côté de son sous-total :
         le fichier dit ainsi quand chaque tranche a bougé pour la dernière
         fois, comme le tableau daté de la tête de frise. */
      'Dernier geste de la tranche',
      'Adresse',
      'Fichiers de textes',
      'À surveiller',
      'Arabe (AR)',
      'Anglais (EN)',
      'Les deux',
      'Côté coché',
    ]
      .map(cellule)
      .join(';'),
  );

  /* La tranche qui garde le plus, lue sur les tranches emportées : l'écart de
     chaque ligne se mesure à elle — 0 pour la plus chargée elle-même. */
  const gardesOuvertes = ouvertes.map(
    (tranche) => rangsOuvertsTranche(etat, tranche).length,
  );
  const plusCharge = gardesOuvertes.length === 0 ? 0 : Math.max(...gardesOuvertes);

  ouvertes.forEach((tranche) => {
    const reouverture = reouvertureEcrit(tranche, gestes);
    /* Sa position dans l'ordre retenu : la même pour tous ses écrans, puisqu'il
       s'agit du rang de la tranche et non de celui de l'écran dans la tranche. */
    const position = positionTrancheEcrit(ouvertes, tranche, tri);
    const ecransTranche = RELECTURE_LIGNES.filter(
      (ligne) => ligne.n >= tranche.de && ligne.n <= tranche.a,
    );
    /* Ce que la tranche garde encore ouvert, lu une fois pour toute la tranche :
       la colonne « Écrans gardés » le porte à côté de sa position sur chacune
       de ses lignes, et la ligne de sous-total le redit avec son étendue. */
    const restesTranche = ecransTranche.filter(
      (ligne) => !etat.ar.includes(ligne.n) || !etat.en.includes(ligne.n),
    ).length;
    const gardes = `${restesTranche} / ${ecransTranche.length}`;
    /* Combien d'écrans séparent cette tranche de la plus chargée — 0 quand
       c'est elle, le plus grand écart quand c'est la plus légère. */
    const ecart = String(Math.max(plusCharge - restesTranche, 0));
    ecransTranche.forEach((ligne) => {
      const ar = estRelue(etat, 'ar', ligne.n);
      const en = estRelue(etat, 'en', ligne.n);
      lignes.push(
        [
          nomTrancheFrise(tranche),
          position,
          gardes,
          ecart,
          reouverture,
          rangEcrit(ligne.n),
          ligne.page,
          /* Le sous-total ne se répète pas sur chaque écran : il se lit sur la
             ligne qui ferme la tranche, juste en dessous — et le compte des
             écrans fermés avec lui. Il en va de même de la date de la tranche,
             qui n'a rien à faire sur chaque écran. */
          '',
          '',
          '',
          ligne.path,
          ligne.textes,
          ligne.vigilance,
          ar ? 'x' : '',
          en ? 'x' : '',
          ar && en ? 'x' : '',
          ar && !en ? 'Arabe seul' : en && !ar ? 'Anglais seul' : '',
        ]
          .map(cellule)
          .join(';'),
      );
    });
    /* La ligne qui ferme la tranche : son sous-total, dans la colonne posée
       à côté des écrans — ce que la tranche garde encore ouvert, et sur combien
       d'écrans au total. */    /* Le geste le plus récent de la tranche, quel qu'en soit le sens : c'est
       lui qui date la tranche dans le fichier, à côté de son sous-total. */
    const gesteTranche =
      gestes.find((entree) => entree.de === tranche.de && entree.a === tranche.a) ?? null;
    lignes.push(
      [
        nomTrancheFrise(tranche),
        position,
        gardes,
        ecart,
        reouverture,
        '—',
        `${nomTrancheFrise(tranche)} · sous-total`,
        `${restesTranche} écran(s) encore ouvert(s) sur ${ecransTranche.length} · manque surtout ${coteDominantEcrit(
          etat,
          tranche.de,
          tranche.a,
        )}`,
        /* Ce que la tranche a déjà fermé des deux côtés, à côté de ce qui lui
           reste : le fichier dit l'avancement, pas seulement le retard. */
        `${ecransTranche.length - restesTranche} écran(s) fermé(s) sur ${ecransTranche.length}`,
        gesteTranche ? gesteEcrit(gesteTranche.at) : '— aucun geste',
        '',
        '',
        '',
        '',
        '',
        `${ecransTranche.length - restesTranche} / ${ecransTranche.length}`,
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  });

  /* La ligne qui ferme la table : le total des écrans de ces tranches. */
  const ecransDedans = RELECTURE_LIGNES.filter((ligne) => dedans(ligne.n)).length;
  /* La fraise qui ferme le rangement, datée : sa dernière émonde se lit sur le
     carnet des gestes, et le délai se dit comme celui du tableau daté — la
     feuille ne dit plus seulement où l'ordre s'arrête, mais depuis combien de
     temps cette borne n'a pas bougé. */
  const fermante = ouvertes.length > 0 ? ouvertes[ouvertes.length - 1] : null;
  const gesteFermante = fermante
    ? gestes.find((entree) => entree.de === fermante.de && entree.a === fermante.a) ?? null
    : null;
  const fermanteDelai = fermante
    ? gesteFermante
      ? ` · la tranche qui ferme n’a pas bougé depuis ${delaiEcritCourt(
          gesteFermante.at,
        )}`
      : ' · aucun geste retenu sur la tranche qui ferme'
    : '';
  lignes.push(
    [
      'Total des tranches ouvertes',
      /* Le total ne prend pas de rang, mais il dit combien de tranches en
         gardent un : le fichier se referme sur son rangement, et l'on sait
         combien de lignes portaient une position. */
      ouvertes.length === 0
        ? '— aucune tranche à ranger'
        : `${ouvertes.length} tranche(s) gardent une position`,
      /* Ce que ces tranches gardent encore ouvert, dans la colonne posée à
         côté de la position : la ligne de total se lit comme celle de chaque
         tranche, un chiffre sur son étendue. */
      `${ecransOuverts} / ${ecransDedans}`,
      /* L'écart au plus chargé se lit ligne par ligne ; la ligne de total, qui
         n'est pas une tranche, n'en porte pas. */
      '—',
      /* La réouverture la plus récente de ces tranches-là : la ligne qui ferme
         la table dit si un geste groupé est passé récemment. */
      ouvertes.length === 0
        ? '—'
        : reouvertureEcrit(ouvertes[ouvertes.length - 1], gestes),
      '—',
      `${ecransDedans - ecransOuverts} / ${ecransDedans} écran(s) fermés des deux côtés`,
      /* La même phrase que la ligne de total du tableau daté : le nombre
         d'écrans encore ouverts, sur combien de tranches, le côté qui manque
         le plus souvent, et l'étendue du rangement — de la position 1 à la
         dernière —, pour que le fichier se referme comme la table. */
      ouvertes.length === 0
        ? `${ecransOuverts} écran(s) encore ouvert(s) · — aucune tranche à ranger`
        : `${ecransOuverts} écran(s) encore ouvert(s) sur ${ouvertes.length} tranche(s) · manque surtout ${coteDominantTranchesEcrit(
            etat,
            ouvertes,
          )} · rangement de la position 1 à la position ${ouvertes.length} · l’ordre se referme sur ${nomTrancheFrise(
            ouvertes[ouvertes.length - 1],
          )}${fermanteDelai}`,
      /* Le total des écrans déjà fermés, dans la colonne posée à côté du
         sous-total : la ligne de total se lit comme celle de chaque tranche. */
      `${ecransDedans - ecransOuverts} écran(s) fermé(s) sur ${ecransDedans}`,
      /* La date de chaque tranche se lit sur sa propre ligne de sous-total ;
         la ligne qui ferme la table ne date rien à leur place. */
      '—',
      `${ouvertes.length} tranche(s)`,
      'Carnet de cet appareil, jamais en base',
      '',
      '',
      '',
      '',
      '',
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la ligne de synthèse des écrans gardés ---- */
  /* Une seule ligne, après la table : ce que chaque tranche ouverte garde
     encore, nommée tranche par tranche, et le total posé devant. Le lecteur du
     fichier voit d'un coup d'œil où le poids se répartit, sans additionner les
     sous-totaux de tête. */
  lignes.push('');
  lignes.push(
    [
      'Synthèse des écrans gardés',
      `${ouvertes.length} tranche(s) ouverte(s)`,
      `${ecransOuverts} écran(s) gardés encore ouverts des deux côtés sur ${ecransDedans}`,
      ouvertes.length === 0
        ? '— aucune tranche ouverte'
        : ouvertes
            .map(
              (tranche) =>
                `${nomTrancheFrise(tranche)} : ${rangsOuvertsTranche(etat, tranche).length}`,
            )
            .join(' · '),
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la ligne de dispersion des écarts ---- */
  /* Sous la synthèse, une seule ligne dit la dispersion du rangement :
     l'étendue des écarts — du plus petit au plus grand —, leur moyenne, et la
     tranche la plus légère avec son poids et son écart. Le lecteur du fichier
     juge d'un seul regard si le poids est resserré ou étalé, sans soustraire
     les nombres de la synthèse. */
  const dispersion = dispersionEcarts(etat, ouvertes, tri);
  lignes.push('');
  lignes.push(
    [
      'Dispersion des écarts',
      `${ouvertes.length} tranche(s) ouverte(s)`,
      dispersion
        ? `étendue de ${dispersion.min} à ${dispersion.max} · écart moyen ${dispersion.moyenne}`
        : '— aucune tranche ouverte',
      dispersion && dispersion.legere
        ? `${nomTrancheFrise(dispersion.legere.tranche)} · ${
            dispersion.legere.n
          } écran(s) · écart au plus chargé ${dispersion.legere.ecart}`
        : '—',
    ]
      .map(cellule)
      .join(';'),
  );

  /* ---- la table des gestes de ces tranches-là ---- */
  lignes.push('');
  lignes.push(
    [
      'Geste de tranche',
      'Date',
      'Tranche',
      'Écrans',
      'Geste',
      'Écrans touchés',
      'Fermés au total après',
    ]
      .map(cellule)
      .join(';'),
  );

  if (gestesDedans.length === 0) {
    lignes.push(
      [
        'Geste de tranche',
        '—',
        '—',
        '—',
        'Aucun geste groupé retenu sur ces tranches',
        '0',
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  } else {
    gestesDedans.forEach((geste) => {
      lignes.push(
        [
          'Geste de tranche',
          gesteEcrit(geste.at),
          etiquetteTournee(geste.de) || `Hors tournée (${geste.de}–${geste.a})`,
          `${rangEcrit(geste.de)}–${rangEcrit(geste.a)}`,
          geste.ferme ? 'Fermé d’un coup' : 'Rouvert d’un coup',
          String(geste.n),
          geste.apres === null ? '—' : `${geste.apres} / ${RELECTURE_TOTAL}`,
        ]
          .map(cellule)
          .join(';'),
      );
    });
    lignes.push(
      [
        'Geste de tranche',
        '—',
        '—',
        '—',
        `${gestesDedans.length} geste(s) retenu(s) sur ces tranches`,
        String(gestesDedans.reduce((total, geste) => total + geste.n, 0)),
        '',
      ]
        .map(cellule)
        .join(';'),
    );
  }

  return `\uFEFF${lignes.join('\r\n')}\r\n`;
}

/** Le nom du fichier des tranches ouvertes : il dit ce qu'il porte, sans dater. */
export const NOM_FICHIER_TRANCHES_OUVERTES =
  'paperatlas-relecture-tranches-ouvertes.csv';

/**
 * Le geste de la porte posée dans la tête de frise : toutes les tranches encore
 * ouvertes dans un seul fichier, téléchargé sans quitter la console.
 */
export function telechargerRelectureCsvTranchesOuvertes(
  tri: TriTranchesOuvertes = 'plan',
): void {
  const blob = new Blob([relectureCsvTranchesOuvertes(tri)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = NOM_FICHIER_TRANCHES_OUVERTES;
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Le geste du bouton : un fichier, téléchargé sans quitter la console. */
export function telechargerRelectureCsv(): void {
  const blob = new Blob([relectureCsv()], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = NOM_FICHIER_RELECTURE;
  lien.rel = 'noopener';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}