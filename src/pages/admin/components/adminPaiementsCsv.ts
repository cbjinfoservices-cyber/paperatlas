import { csvText, saveCsv } from '@/lib/csv';
import { saveWorkbook, type XlsxSheet } from '@/lib/xlsx';
import { localeFor } from '@/i18n/localize';
import { replyGapLabel } from '@/lib/messaging';
import { lireEncaissement, type EtatEncaissement } from './adminPaiementsCore';
import type { AdminAbonnement, AdminConversation } from './adminTypes';

/** La vue choisie au-dessus du tableau : ce qui reste à régler, ce qui est
 *  encaissable, ou la file entière. */
export type VuePaiements = 'regler' | 'prets' | 'all';

/** Le motif, dit en un mot de fichier : lisible dans un dossier d'archives,
 *  sans accent ni espace, et sans confondre deux causes différentes. */
const MOTIF_FICHIER: Record<EtatEncaissement, string> = {
  pret: 'pret-a-encaisser',
  essai: 'essai',
  sansMontant: 'montant-vide',
  sansCanal: 'aucun-moyen',
  manuel: 'encaissement-manuel',
  retard: 'echeance-depassee',
  ferme: 'abonnement-clos',
};

type Args = {
  /** Les lignes réellement affichées au moment du clic. */
  rows: AdminAbonnement[];
  motif: EtatEncaissement | 'all';
  vue: VuePaiements;
  lang: string;
  t: (key: string) => string;
  /** L'instant de l'export dont ces lignes sont la différence : il entre dans
   *  le fichier, pour qu'un extrait d'arrivées dise d'où il vient. */
  ecartAt?: string;
};

/**
 * Le tableau des paiements, tel qu'il se lit à l'écran : une ligne par
 * abonnement, avec son état d'encaissement et la raison qui le porte. Le motif
 * actif est recopié en bas du fichier, pour qu'une feuille archivée dise
 * d'elle-même sur quoi elle avait été resserrée.
 */
export function buildPaiementsCsv({ rows, motif, vue, lang, t, ecartAt }: Args): string {
  const lines: string[][] = [];
  lines.push([
    t('ad.clients.entreprise'),
    t('ad.xls.mail'),
    t('ad.xls.metier'),
    t('ad.clients.ville'),
    t('ad.pay.colOffre'),
    t('ad.pay.colMontant'),
    t('ad.pay.colEcheance'),
    t('ad.pay.colCanal'),
    t('ad.pay.colEtat'),
  ]);

  rows.forEach((row) => {
    const lecture = lireEncaissement(row);
    const montant = Number(row.montant_mensuel ?? 0);
    lines.push([
      row.entreprise || '',
      row.email || '',
      row.metier || '',
      row.ville || '',
      row.offre || '',
      Number.isFinite(montant) ? String(montant) : '',
      row.date_echeance || '',
      row.canal_paiement || '',
      t(lecture.cle),
    ]);
  });

  const locale = localeFor(lang);
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());
  const vueCle =
    vue === 'regler' ? 'ad.pay.filterRegler' : vue === 'prets' ? 'ad.pay.filterPrets' : 'ad.pay.filterAll';

  lines.push([]);
  lines.push([
    t('ad.pay.csvFilter'),
    motif !== 'all' ? t(`ad.pay.why.${motif}`) : t(vueCle),
  ]);
  /* Un extrait d'arrivées dit de quel export il est la différence : sans cette
     ligne, un fichier de quelques lignes ne se rattacherait à aucune archive. */
  if (ecartAt) {
    const source = new Date(ecartAt);
    if (Number.isFinite(source.getTime())) {
      const quand = new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(source);
      lines.push([t('ad.pay.csvEcart'), quand]);
    }
  }
  lines.push([t('dirCsv.results'), String(rows.length)]);
  lines.push([t('dirCsv.exportedOn'), stamp]);

  return csvText(lines);
}

/**
 * `PaperAtlas-paiements-motif-echeance-depassee-2026-11-08.csv` : le motif
 * filtré entre dans le nom, pour qu'une archive d'après relance se retrouve
 * sans ouvrir le fichier. Sans motif, c'est la vue qui donne le nom.
 */
export function paiementsCsvFilename(
  motif: EtatEncaissement | 'all',
  vue: VuePaiements,
  at: Date = new Date(),
) {
  const stamp = at.toISOString().slice(0, 10);
  const tag = motif !== 'all' ? `motif-${MOTIF_FICHIER[motif]}` : `vue-${vue}`;
  return `PaperAtlas-paiements-${tag}-${stamp}.csv`;
}

export function downloadPaiementsCsv(args: Args) {
  saveCsv(paiementsCsvFilename(args.motif, args.vue), buildPaiementsCsv(args));
}

/**
 * `PaperAtlas-paiements-arrivees-2026-11-08.csv` : le fichier des lignes qui
 * sont arrivées depuis un export, sans repasser par la file entière. Le nom
 * le distingue d'une archive complète du même jour.
 */
export function paiementsArriveesCsvFilename(at: Date = new Date()) {
  return `PaperAtlas-paiements-arrivees-${at.toISOString().slice(0, 10)}.csv`;
}

/** L'extrait des arrivées : les mêmes colonnes, mais seulement les lignes qui
 *  n'étaient pas dans l'export comparé. */
export function downloadArriveesPaiementsCsv(args: Args) {
  saveCsv(paiementsArriveesCsvFilename(), buildPaiementsCsv(args));
}

/**
 * `PaperAtlas-paiements-lignes-parties-2026-11-08.csv` : le fichier des lignes
 * parties encore au tableau, tel qu'un resserrement les montre. Le nom le
 * distingue d'une archive complète et d'un extrait d'arrivées.
 */
export function paiementsPartiesCsvFilename(at: Date = new Date()) {
  return `PaperAtlas-paiements-lignes-parties-${at.toISOString().slice(0, 10)}.csv`;
}

/** L'extrait des lignes parties : les mêmes colonnes que le tableau, mais
 *  seulement celles que le resserrement laisse lire. */
export function downloadPartiesPaiementsCsv(args: Args) {
  saveCsv(paiementsPartiesCsvFilename(), buildPaiementsCsv(args));
}

/** Un point d'archive tel que la comparaison l'écrit : sa date, la vue et le
 *  motif sur lesquels il avait été produit, son décompte et son montant. Le
 *  type reste local au fichier, pour que le module CSV ne dépende pas de la
 *  mémoire d'export. */
export type CmpPoint = {
  at: string;
  /** Le motif de l'export, quand l'archive le retenait : un point relu sur le
   *  seul périmètre d'un compte ne le garde pas, et se dit alors par sa vue. */
  motif?: EtatEncaissement | 'all';
  vue: VuePaiements;
  rows: number;
  montant: number;
};

type CmpArgs = {
  /** Les deux exports comparés — le départ et l'arrivée —, écrits côte à côte. */
  from: CmpPoint;
  to: CmpPoint;
  /** L'écart de montant, ou null quand un des deux exports ne retenait pas
   *  de montant : un chiffre ne s'invente pas. */
  montant: number | null;
  lignes: number;
  /** Les lignes nommées quand les deux mémoires les retenaient. */
  arrivees: number | null;
  parties: number | null;
  /** Les lignes effectivement arrivées entre les deux points, retrouvées dans
   *  le tableau du jour par leur identifiant : la troisième feuille les nomme
   *  au lieu de les compter seulement. Vide quand les deux mémoires ne
   *  retenaient pas leurs lignes, ou quand une arrivée n'est plus au tableau —
   *  celle-là ne peut que se compter. */
  arriveesRows?: AdminAbonnement[];
  /** Les lignes parties entre les deux points, retrouvées dans le tableau du
   *  jour par leur identifiant : la quatrième feuille les nomme quand elle le
   *  peut. Vide quand une ligne a quitté le tableau — celle-là ne se compte. */
  partiesRows?: AdminAbonnement[];
  lang: string;
  t: (key: string) => string;
};

/** Le motif d'un point, dit comme à l'écran : la raison posée, ou à défaut la
 *  vue qui avait nommé le fichier. */
const motifDuPoint = (point: CmpPoint, t: (key: string) => string) =>
  point.motif && point.motif !== 'all'
    ? t(`ad.pay.why.${point.motif}`)
    : t(
        point.vue === 'regler'
          ? 'ad.pay.filterRegler'
          : point.vue === 'prets'
            ? 'ad.pay.filterPrets'
            : 'ad.pay.filterAll',
      );

/** Un montant signé, écrit pour un tableur : le signe reste dans la cellule,
 *  sans symbole ni espace, pour que la colonne se trie et se somme. */
const signe = (value: number) => (value > 0 ? `+${value}` : value < 0 ? String(value) : '0');

/**
 * La comparaison de deux exports, rangée en trois onglets : les deux points
 * côte à côte, l'écart de montant et de lignes entre eux, puis — quand les
 * deux mémoires retenaient leurs lignes — celles qui sont arrivées entre les
 * deux, nommées une à une.
 *
 * Deux archives se comparent entre elles : rien ici ne lit la file du jour, et
 * un montant absent d'un des deux points ne s'invente pas.
 */
export function buildComparaisonPaiementsSheets({
  from,
  to,
  montant,
  lignes,
  arrivees,
  parties,
  arriveesRows = [],
  partiesRows = [],
  lang,
  t,
}: CmpArgs): XlsxSheet[] {
  const locale = localeFor(lang);
  const quand = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };
  const montantTexte = (value: number) => (value > 0 ? String(value) : '');
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());

  /* ---- onglet 1 : les deux points, l'un à côté de l'autre ---- */
  const points: string[][] = [];
  points.push([t('ad.pay.cmpColField'), t('ad.pay.cmpFrom'), t('ad.pay.cmpTo')]);
  points.push([t('ad.pay.cmpDate'), quand(from.at), quand(to.at)]);
  points.push([t('ad.pay.csvFilter'), motifDuPoint(from, t), motifDuPoint(to, t)]);
  points.push([t('ad.pay.colRows'), String(from.rows), String(to.rows)]);
  points.push([
    t('ad.pay.colMontant'),
    montantTexte(from.montant),
    montantTexte(to.montant),
  ]);

  /* ---- onglet 2 : ce qui sépare les deux points ---- */
  const ecart: string[][] = [];
  ecart.push([t('ad.pay.cmpGapTitle')]);
  ecart.push([]);
  ecart.push([
    t('ad.pay.colMontant'),
    montant === null ? t('ad.pay.cmpAmountNone') : signe(montant),
  ]);
  ecart.push([t('ad.pay.colRows'), signe(lignes)]);
  if (arrivees !== null && parties !== null) {
    ecart.push([t('ad.pay.cmpIds'), String(arrivees), String(parties)]);
  }
  ecart.push([]);
  ecart.push([t('dirCsv.exportedOn'), stamp]);

  const sheets: XlsxSheet[] = [
    { name: t('ad.pay.cmpSheetPoints'), rows: points, widths: [34, 26, 26] },
    { name: t('ad.pay.cmpGapTitle'), rows: ecart, widths: [34, 28, 16] },
  ];

  /* ---- onglet 3 : les lignes arrivées entre les deux points ---- */
  /* Il n'existe que si les deux mémoires retenaient l'identité de leurs
     lignes : sans elle, une arrivée ne se nomme pas, et un chiffre ne
     s'invente pas. */
  if (arrivees !== null && parties !== null) {
    const feuille: (string | number)[][] = [];
    feuille.push(
      [
        'ad.clients.entreprise',
        'ad.xls.mail',
        'ad.pay.colOffre',
        'ad.pay.colMontant',
        'ad.pay.cmpArrivalDelta',
        'ad.pay.colEcheance',
        'ad.pay.colCanal',
        'ad.pay.colEtat',
      ].map(t),
    );
    arriveesRows.forEach((row) => {
      const lecture = lireEncaissement(row);
      const montantLigne = Number(row.montant_mensuel ?? 0);
      feuille.push([
        row.entreprise || '—',
        row.email || '',
        row.offre || '',
        Number.isFinite(montantLigne) ? montantLigne : '',
        /* Ce que cette arrivée a apporté : le montant de sa ligne, signé
           comme un apport, pour que la colonne se somme. */
        Number.isFinite(montantLigne) && montantLigne > 0 ? `+${montantLigne}` : '',
        row.date_echeance || '',
        row.canal_paiement || '',
        t(lecture.cle),
      ]);
    });
    /* Le total apporté par ces arrivées, sous les lignes : la colonne se lit
       aussi comme une somme, pas seulement ligne à ligne. */
    if (arriveesRows.length > 0) {
      const apport = arriveesRows.reduce((sum, row) => {
        const valeur = Number(row.montant_mensuel ?? 0);
        return Number.isFinite(valeur) ? sum + valeur : sum;
      }, 0);
      feuille.push([]);
      feuille.push([t('ad.pay.cmpArrivalTotal'), String(Math.round(apport))]);
    }
    if (arriveesRows.length === 0) {
      feuille.push([t('ad.pay.cmpArrivalsEmpty')]);
    } else if (arriveesRows.length < arrivees) {
      /* Une arrivée qui a déjà quitté le tableau ne se nomme plus : elle se
         compte, et le fichier le dit plutôt que de la taire. */
      feuille.push([]);
      feuille.push([
        t('ad.pay.cmpArrivalsUnknown').replace(
          '{n}',
          String(Math.max(0, arrivees - arriveesRows.length)),
        ),
      ]);
    }
    feuille.push([]);
    feuille.push([t('ad.pay.cmpArrivalsNote')]);
    feuille.push([t('dirCsv.exportedOn'), stamp]);

    sheets.push({
      name: t('ad.pay.cmpArrivalsSheet'),
      rows: feuille,
      widths: [30, 30, 20, 14, 16, 14, 20, 22],
    });

    /* ---- onglet 4 : les lignes parties entre les deux points ---- */
    /* Il n'existe que dans le même cas que la feuille des arrivées : quand les
       deux mémoires retenaient l'identité de leurs lignes. Une ligne partie
       qui n'est plus au tableau ne se nomme plus — elle se compte, et la
       feuille le dit. */
    const sorties: (string | number)[][] = [];
    sorties.push(
      [
        'ad.clients.entreprise',
        'ad.xls.mail',
        'ad.pay.colOffre',
        'ad.pay.colMontant',
        'ad.pay.colEcheance',
        'ad.pay.colCanal',
        'ad.pay.colEtat',
      ].map(t),
    );
    partiesRows.forEach((row) => {
      const lecture = lireEncaissement(row);
      const montantLigne = Number(row.montant_mensuel ?? 0);
      sorties.push([
        row.entreprise || '—',
        row.email || '',
        row.offre || '',
        Number.isFinite(montantLigne) ? montantLigne : '',
        row.date_echeance || '',
        row.canal_paiement || '',
        t(lecture.cle),
      ]);
    });
    if (partiesRows.length === 0) {
      sorties.push([t('ad.pay.cmpPartiesEmpty')]);
    } else if (partiesRows.length < parties) {
      sorties.push([]);
      sorties.push([
        t('ad.pay.cmpPartiesUnknown').replace(
          '{n}',
          String(Math.max(0, parties - partiesRows.length)),
        ),
      ]);
    }
    sorties.push([]);
    sorties.push([t('ad.pay.cmpPartiesNote')]);
    sorties.push([t('dirCsv.exportedOn'), stamp]);

    sheets.push({
      name: t('ad.pay.cmpPartiesSheet'),
      rows: sorties,
      widths: [30, 30, 20, 14, 16, 20, 22],
    });
  }

  return sheets;
}

/**
 * `PaperAtlas-paiements-comparaison-2026-11-08.csv` : la comparaison de deux
 * exports de l'historique, distinguée d'une archive complète du même jour.
 */
export function paiementsComparaisonFilename(at: Date = new Date()) {
  return `PaperAtlas-paiements-comparaison-${at.toISOString().slice(0, 10)}.xlsx`;
}

export function downloadComparaisonPaiements(args: CmpArgs) {
  saveWorkbook(paiementsComparaisonFilename(), buildComparaisonPaiementsSheets(args));
}

type CompteCmpArgs = {
  /** Les deux exports du périmètre du compte : le départ et l'arrivée. */
  from: CmpPoint;
  to: CmpPoint;
  /** L'écart de montant, porté sur les seules lignes du compte. */
  montant: number;
  lignes: number;
  /** Le nombre de lignes du compte parties entre les deux points. */
  parties: number;
  /** Ces lignes parties, quand elles sont encore au tableau : ce sont elles
   *  que la feuille nomme et que le montant retiré additionne. */
  partiesRows?: AdminAbonnement[];
  /** Ce que ces lignes ont retiré au périmètre, quand il se lit. */
  retrait?: number | null;
  /** Les fils du compte qui répondent en moins d'un jour, comptés au moment
   *  où le classeur se produit. Null quand les rythmes ne sont pas revenus :
   *  un chiffre qui n'a pas été mesuré ne s'écrit pas. */
  filsActifs?: number | null;
  /** Ces mêmes fils, nommés : une feuille les relit ligne à ligne, pour que
   *  le chiffre de l'onglet d'écart ne reste pas un nombre sans visages. */
  filsActifsRows?: AdminConversation[];
  /** Le rythme de chaque fil, lu une fois pour la fiche : la feuille le dit
   *  dans l'unité qui se lit, comme la liste des priorités. */
  filsActifsPaces?: Record<string, number>;
  /** Le compte que ce classeur décrit. */
  email: string;
  entreprise: string;
  lang: string;
  t: (key: string) => string;
};

/**
 * La comparaison du périmètre d'un compte, rangée en trois onglets : les deux
 * exports avec ce que le compte y pesait, l'écart de ses seules lignes, puis
 * les lignes parties entre les deux points avec ce que chacune a retiré.
 *
 * Rien ici ne lit la file entière : ce classeur ne parle que de ce compte, et
 * une ligne partie qui n'est plus au tableau ne s'invente pas — elle se compte.
 */
export function buildCompteComparaisonSheets({
  from,
  to,
  montant,
  lignes,
  parties,
  partiesRows = [],
  retrait = null,
  filsActifs = null,
  filsActifsRows = [],
  filsActifsPaces = {},
  email,
  entreprise,
  lang,
  t,
}: CompteCmpArgs): XlsxSheet[] {
  const locale = localeFor(lang);
  const quand = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());
  const montantTexte = (value: number) => (value > 0 ? String(value) : '');

  /* ---- onglet 1 : les deux points du périmètre, côte à côte ---- */
  const points: string[][] = [
    [t('ad.pay.cmpColField'), t('ad.pay.cmpFrom'), t('ad.pay.cmpTo')],
    [t('ad.pay.cmpAccount'), email || entreprise || '—', email || entreprise || '—'],
    [t('ad.pay.cmpDate'), quand(from.at), quand(to.at)],
    [t('ad.pay.csvFilter'), motifDuPoint(from, t), motifDuPoint(to, t)],
    [t('ad.pay.colRows'), String(from.rows), String(to.rows)],
    [t('ad.pay.colMontant'), montantTexte(from.montant), montantTexte(to.montant)],
  ];
  /* Les fils actifs du compte, repris d'un export à l'autre : le même compte
     se lit sur les deux points, parce qu'il décrit l'état du compte au moment
     de l'export — il ne se déduit d'aucun des deux fichiers comparés. */
  if (filsActifs !== null) {
    points.push([
      t('ad.f.weekScopeCmpFils'),
      String(filsActifs),
      String(filsActifs),
    ]);
  }

  /* ---- onglet 2 : ce que les deux points séparent, sur ses lignes ---- */
  const ecart: string[][] = [
    [t('ad.pay.cmpGapTitle')],
    [],
    [t('ad.pay.colMontant'), signe(montant)],
    [t('ad.pay.colRows'), signe(lignes)],
    [
      t('ad.pay.cmpPartiesSheet'),
      String(parties),
    ],
    [
      t('ad.pay.cmpPartiesTotal'),
      retrait === null ? t('ad.pay.cmpAmountNone') : signe(-Math.abs(Math.round(retrait))),
    ],
    /* Les fils actifs du compte, repris d'un export à l'autre : le même
       compte est lu aux deux points, parce qu'il ne dépend d'aucun des deux
       exports comparés — c'est un état du compte, pas un écart. */
    [],
    [t('ad.f.weekScopeCmpFils')],
    [
      t('ad.pay.cmpFrom'),
      filsActifs === null ? t('ad.pay.cmpAmountNone') : String(filsActifs),
    ],
    [
      t('ad.pay.cmpTo'),
      filsActifs === null ? t('ad.pay.cmpAmountNone') : String(filsActifs),
    ],
    [t('ad.f.weekScopeCmpFilsSame')],
    [],
    [t('ad.f.weekScopeCmpNote')],
    [t('ad.f.weekScopeCmpFilsNote')],
    [t('dirCsv.exportedOn'), stamp],
  ];

  /* ---- onglet 3 : les lignes parties, et ce que chacune a retiré ---- */
  /* Ce que ces lignes ont retiré, lu avant de les écrire : une ligne qui pèse à
     elle seule plus de la moitié du retrait se marque, pour que le classeur
     dise sur quelle ligne le retrait tient vraiment. */
  const sommeRetrait = partiesRows.reduce((total, row) => {
    const valeur = Number(row.montant_mensuel ?? 0);
    return Number.isFinite(valeur) && valeur > 0 ? total + valeur : total;
  }, 0);
  const seuilMajoritaire = sommeRetrait > 0 ? sommeRetrait / 2 : 0;
  const majoritaires = partiesRows.filter((row) => {
    const valeur = Number(row.montant_mensuel ?? 0);
    return seuilMajoritaire > 0 && Number.isFinite(valeur) && valeur > seuilMajoritaire;
  }).length;

  const sorties: (string | number)[][] = [];
  sorties.push(
    [
      'ad.clients.entreprise',
      'ad.xls.mail',
      'ad.pay.colOffre',
      'ad.pay.colMontant',
      'ad.pay.cmpPartiesDelta',
      'ad.pay.cmpPartiesMajorMark',
      'ad.pay.colEcheance',
      'ad.pay.colCanal',
      'ad.pay.colEtat',
    ].map(t),
  );
  partiesRows.forEach((row) => {
    const lecture = lireEncaissement(row);
    const montantLigne = Number(row.montant_mensuel ?? 0);
    const chiffre = Number.isFinite(montantLigne) ? montantLigne : null;
    /* La marque de la ligne qui pèse à elle seule plus de la moitié du
       retrait : une ligne sans montant ne se pèse pas. */
    const majoritaire =
      seuilMajoritaire > 0 && chiffre !== null && chiffre > seuilMajoritaire;
    sorties.push([
      row.entreprise || '—',
      row.email || '',
      row.offre || '',
      chiffre === null ? '' : chiffre,
      /* Ce que cette ligne a retiré : signé en négatif, pour que la colonne
         se somme et dise le retrait plutôt que le montant qu'elle portait. */
      chiffre !== null && chiffre > 0 ? -chiffre : '',
      majoritaire ? t('ad.pay.cmpPartiesMajorMarkYes') : '',
      row.date_echeance || '',
      row.canal_paiement || '',
      t(lecture.cle),
    ]);
  });
  if (partiesRows.length > 0) {
    sorties.push([]);
    sorties.push([t('ad.pay.cmpPartiesTotal'), '', '', '', String(-Math.round(sommeRetrait))]);
    /* Combien de lignes portent le retrait à elles seules : le marquage se lit
       aussi en un chiffre, sans additionner la colonne. */
    if (majoritaires > 0) {
      sorties.push([
        t('ad.pay.cmpPartiesMajorCount').replace('{n}', String(majoritaires)),
      ]);
    }
  }
  if (partiesRows.length === 0) {
    sorties.push([t('ad.pay.cmpPartiesEmpty')]);
  } else if (partiesRows.length < parties) {
    sorties.push([]);
    sorties.push([
      t('ad.pay.cmpPartiesUnknown').replace(
        '{n}',
        String(Math.max(0, parties - partiesRows.length)),
      ),
    ]);
  }
  sorties.push([]);
  sorties.push([t('ad.pay.cmpPartiesMajorMarkNote')]);
  sorties.push([t('ad.pay.cmpPartiesDeltaNote')]);
  sorties.push([t('dirCsv.exportedOn'), stamp]);

  const sheets: XlsxSheet[] = [
    { name: t('ad.pay.cmpSheetPoints'), rows: points, widths: [34, 28, 28] },
    { name: t('ad.pay.cmpGapTitle'), rows: ecart, widths: [36, 28] },
  ];

  /* ---- onglet : les fils actifs nommés ---- */
  /* Le chiffre de l'onglet d'écart dit combien ; cette feuille dit lesquels —
     leur sujet, leur dernier message et son jour, et leur rythme de réponse.
     Elle n'existe que si le chiffre a pu être mesuré : un compte sans rythme
     revenu n'a pas de fils actifs à nommer, et un zéro ne s'invente pas. */
  if (filsActifs !== null) {
    const fils: (string | number)[][] = [];
    fils.push(
      [
        'ad.pay.cmpFilsSubject',
        'ad.pay.cmpFilsLast',
        'ad.pay.cmpFilsAt',
        'ad.pay.cmpFilsPace',
      ].map(t),
    );
    filsActifsRows.forEach((row) => {
      const nom = [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ');
      fils.push([
        row.sujet || nom || '—',
        /* Le dernier message se lit sur une seule ligne : un tableur coupe
           autrement un texte qui garde ses retours. */
        (row.last_message || '').replace(/\s+/g, ' ').trim() || t('ad.pay.cmpFilsNoLast'),
        row.last_at ? quand(row.last_at) : '',
        replyGapLabel(filsActifsPaces[row.id] ?? null, t),
      ]);
    });
    fils.push([]);
    fils.push([t('ad.pay.cmpFilsCount'), String(filsActifs)]);
    if (filsActifsRows.length === 0 && filsActifs > 0) {
      fils.push([
        t('ad.pay.cmpFilsUnknown').replace(
          '{n}',
          String(Math.max(0, filsActifs - filsActifsRows.length)),
        ),
      ]);
    }
    fils.push([]);
    fils.push([t('ad.pay.cmpFilsNote')]);
    fils.push([t('dirCsv.exportedOn'), stamp]);

    sheets.push({
      name: t('ad.pay.cmpFilsSheet'),
      rows: fils,
      widths: [42, 58, 22, 20],
    });
  }

  sheets.push({
    name: t('ad.pay.cmpPartiesSheet'),
    rows: sorties,
    widths: [30, 30, 20, 14, 16, 20, 14, 20, 22],
  });

  return sheets;
}

/**
 * `PaperAtlas-compte-comparaison-2026-11-08.xlsx` : la comparaison du
 * périmètre d'un compte, distinguée du classeur de la file entière.
 */
export function compteComparaisonFilename(at: Date = new Date()) {
  return `PaperAtlas-compte-comparaison-${at.toISOString().slice(0, 10)}.xlsx`;
}

export function downloadCompteComparaisonWorkbook(args: CompteCmpArgs) {
  saveWorkbook(compteComparaisonFilename(), buildCompteComparaisonSheets(args));
}

type ComptePartiesCsvArgs = {
  /** Les lignes parties encore au tableau, déjà rangées du plus lourd au plus
   *  léger : la feuille suit l'ordre que la fiche laisse lire. */
  rows: AdminAbonnement[];
  /** Le total des lignes parties entre les deux points, y compris celles qui
   *  ne sont plus au tableau — celles-là ne peuvent que se compter. */
  parties: number;
  /** Ce que ces lignes ont retiré au périmètre, quand il se lit. */
  retrait?: number | null;
  email: string;
  entreprise: string;
  lang: string;
  t: (key: string) => string;
};

/**
 * `PaperAtlas-compte-lignes-parties-2026-11-08.csv` : la liste des lignes
 * parties du périmètre d'un compte, distinguée du classeur de la comparaison.
 */
export function comptePartiesCsvFilename(at: Date = new Date()) {
  return `PaperAtlas-compte-lignes-parties-${at.toISOString().slice(0, 10)}.csv`;
}

/**
 * Les lignes parties d'un compte, telles que la fiche les nomme : une ligne
 * par abonnement encore au tableau, avec le montant que chacune a retiré au
 * périmètre — écrit en négatif pour que la colonne se somme. Une ligne qui a
 * quitté le tableau ne s'invente pas : elle est comptée sous les lignes.
 */
export function buildComptePartiesCsv({
  rows,
  parties,
  retrait = null,
  email,
  entreprise,
  lang,
  t,
}: ComptePartiesCsvArgs): string {
  const lines: string[][] = [];
  lines.push([
    t('ad.clients.entreprise'),
    t('ad.xls.mail'),
    t('ad.pay.colOffre'),
    t('ad.pay.colMontant'),
    t('ad.pay.cmpPartiesDelta'),
    t('ad.pay.colEcheance'),
    t('ad.pay.colCanal'),
    t('ad.pay.colEtat'),
  ]);

  rows.forEach((row) => {
    const lecture = lireEncaissement(row);
    const valeur = Number(row.montant_mensuel ?? 0);
    const chiffre = Number.isFinite(valeur) ? valeur : null;
    lines.push([
      row.entreprise || '',
      row.email || '',
      row.offre || '',
      chiffre === null ? '' : String(chiffre),
      chiffre !== null && chiffre > 0 ? String(-chiffre) : '',
      row.date_echeance || '',
      row.canal_paiement || '',
      t(lecture.cle),
    ]);
  });

  if (rows.length > 0) {
    const somme = rows.reduce((total, row) => {
      const valeur = Number(row.montant_mensuel ?? 0);
      return Number.isFinite(valeur) && valeur > 0 ? total + valeur : total;
    }, 0);
    lines.push([]);
    lines.push([t('ad.pay.cmpPartiesTotal'), '', '', '', String(-Math.round(somme))]);
  }

  if (rows.length === 0) {
    lines.push([t('ad.pay.cmpPartiesEmpty')]);
  } else if (rows.length < parties) {
    lines.push([]);
    lines.push([
      t('ad.pay.cmpPartiesUnknown').replace(
        '{n}',
        String(Math.max(0, parties - rows.length)),
      ),
    ]);
  }

  lines.push([]);
  lines.push([t('ad.pay.cmpAccount'), email || entreprise || '—']);
  lines.push([
    t('ad.pay.cmpPartiesTotal'),
    retrait === null ? t('ad.pay.cmpAmountNone') : String(-Math.abs(Math.round(retrait))),
  ]);
  lines.push([t('ad.pay.cmpPartiesDeltaNote')]);
  const locale = localeFor(lang);
  lines.push([
    t('dirCsv.exportedOn'),
    new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date()),
  ]);

  return csvText(lines);
}

export function downloadComptePartiesCsv(args: ComptePartiesCsvArgs) {
  saveCsv(comptePartiesCsvFilename(), buildComptePartiesCsv(args));
}

type OpposesPoint = {
  at: string;
  motif?: EtatEncaissement | 'all';
  vue: VuePaiements;
  /** Ce que le fichier emportait : ses lignes et son montant. */
  rows: number;
  montant: number;
  /** Ce que la file compte aujourd'hui à la même vue et au même motif. */
  rowsNow: number;
  montantNow: number;
};

type OpposesArgs = {
  /** Les seuls exports dont les deux écarts se contredisent. */
  points: OpposesPoint[];
  lang: string;
  t: (key: string) => string;
};

/**
 * `PaperAtlas-paiements-sens-opposes-2026-11-08.csv` : les exports dont le
 * décompte de lignes et le montant partent en sens contraires, distingués
 * d'une archive complète du même jour.
 */
export function paiementsOpposesCsvFilename(at: Date = new Date()) {
  return `PaperAtlas-paiements-sens-opposes-${at.toISOString().slice(0, 10)}.csv`;
}

/**
 * Les exports aux sens opposés, avec leurs deux écarts côte à côte : le
 * décompte de lignes et le montant, ce que l'archive emportait et ce que la
 * file pèse aujourd'hui à sa vue et à son motif. Une contradiction se lit sur
 * la même ligne, sinon l'un des deux chiffres ferait conclure à tort.
 */
export function buildOpposesPaiementsCsv({ points, lang, t }: OpposesArgs): string {
  const locale = localeFor(lang);
  const quand = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());

  const lines: string[][] = [];
  lines.push([
    t('ad.pay.cmpDate'),
    t('ad.pay.csvFilter'),
    t('ad.pay.colRows'),
    t('ad.pay.oppCsvRowsNow'),
    t('ad.pay.oppCsvRowGap'),
    t('ad.pay.colMontant'),
    t('ad.pay.oppCsvAmountNow'),
    t('ad.pay.oppCsvAmountGap'),
  ]);

  points.forEach((point) => {
    const lignesEcart = point.rowsNow - point.rows;
    const montantLisible = point.montant > 0 && point.montantNow > 0;
    lines.push([
      quand(point.at),
      motifDuPoint(point, t),
      String(point.rows),
      String(point.rowsNow),
      signe(lignesEcart),
      point.montant > 0 ? String(Math.round(point.montant)) : '',
      point.montantNow > 0 ? String(Math.round(point.montantNow)) : '',
      /* Un export sans montant retenu ne se compare pas : la colonne reste
         vide plutôt que d'inventer un écart. */
      montantLisible ? signe(Math.round(point.montantNow - point.montant)) : '',
    ]);
  });

  lines.push([]);
  lines.push([t('ad.pay.oppCsvCount'), String(points.length)]);
  lines.push([t('ad.pay.oppCsvNote')]);
  lines.push([t('dirCsv.exportedOn'), stamp]);

  return csvText(lines);
}

export function downloadOpposesPaiementsCsv(args: OpposesArgs) {
  saveCsv(paiementsOpposesCsvFilename(), buildOpposesPaiementsCsv(args));
}

type HistoriqueArgs = OpposesArgs & {
  /** Les jetons posés sur l'historique, dans l'ordre où ils se lisent : la
   *  feuille dit sur quoi l'archive a été resserrée. */
  filters: string[];
  /** Le coût total affiché à l'écran sous le bouton d'export : la somme des
   *  montants d'origine des exports retenus, et sur combien d'entre eux elle
   *  porte. La feuille le reprend en dernière ligne, pour que le fichier dise
   *  le même chiffre que l'écran. */
  cost?: { somme: number; n: number } | null;
  /** La baisse cumulée affichée à côté du jeton « Montants en baisse » : la
   *  somme des écarts négatifs des exports retenus. La feuille la pose à côté
   *  du coût total, pour que l’archive dise les deux chiffres de l’écran. */
  baisse?: number | null;
};

/**
 * `PaperAtlas-paiements-historique-filtre-2026-11-08.csv` : l'historique tel
 * que les jetons le laissent lire, distingué d'une archive complète du même
 * jour.
 */
export function paiementsHistoriqueCsvFilename(at: Date = new Date()) {
  return `PaperAtlas-paiements-historique-filtre-${at.toISOString().slice(0, 10)}.csv`;
}

/**
 * L'historique filtré, dans l'ordre où il se lit à l'écran — du plus récent au
 * plus ancien —, avec pour chaque export ses lignes et son montant, ce que la
 * file pèse aujourd'hui à sa vue et à son motif, et les deux écarts.
 */
export function buildHistoriquePaiementsCsv({
  points,
  filters,
  cost = null,
  baisse = null,
  lang,
  t,
}: HistoriqueArgs): string {
  const locale = localeFor(lang);
  const quand = (iso: string) => {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return iso;
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date());

  const lines: string[][] = [];
  lines.push([
    t('ad.pay.cmpDate'),
    t('ad.pay.csvFilter'),
    t('ad.pay.colRows'),
    t('ad.pay.colMontant'),
    t('ad.pay.oppCsvRowsNow'),
    t('ad.pay.oppCsvAmountNow'),
    t('ad.pay.oppCsvRowGap'),
    t('ad.pay.oppCsvAmountGap'),
  ]);

  points.forEach((point) => {
    const lignesEcart = point.rowsNow - point.rows;
    const montantLisible = point.montant > 0 && point.montantNow > 0;
    lines.push([
      quand(point.at),
      motifDuPoint(point, t),
      String(point.rows),
      point.montant > 0 ? String(Math.round(point.montant)) : '',
      String(point.rowsNow),
      point.montantNow > 0 ? String(Math.round(point.montantNow)) : '',
      signe(lignesEcart),
      montantLisible ? signe(Math.round(point.montantNow - point.montant)) : '',
    ]);
  });

  lines.push([]);
  /* Les jetons posés, tels qu'ils se lisent dans l'en-tête de l'historique :
     une feuille resserrée dit d'elle-même ce qui l'a resserrée. */
  if (filters.length > 0) {
    lines.push([t('ad.pay.histFilterCsvFilters'), filters.join(' · ')]);
  }
  lines.push([t('ad.pay.histFilterCsvCount'), String(points.length)]);
  lines.push([t('ad.pay.histFilterCsvNote')]);
  /* Le coût total, en dernière ligne de données : le même chiffre que le
     compteur de l'écran, repris tel quel pour qu'une archive se relise sans
     refaire la somme. Il ne s'écrit que sur les exports chiffrés — un montant
     absent ne s'additionne pas. */
  if (cost && cost.n > 0) {
    lines.push([]);
    lines.push([
      t('ad.pay.histFilterCsvCost'),
      `${Math.round(cost.somme)}`,
    ]);
    lines.push([
      t('ad.pay.histFilterCsvCostNote').replace('{n}', String(cost.n)),
    ]);
  } else {
    lines.push([]);
    lines.push([t('ad.pay.histFilterCsvCost'), t('ad.pay.histFilterCsvCostNone')]);
  }
  /* La baisse cumulée, juste sous le coût total : le second chiffre du même
     bloc, celui que l’écran affiche à côté du jeton des montants en baisse.
     Elle ne s’écrit que s’il y a une baisse à dire — un zéro dirait qu’on a
     mesuré, alors qu’aucun export retenu n’a baissé. */
  if (baisse !== null && baisse > 0) {
    lines.push([
      t('ad.pay.histFilterCsvBaisse'),
      `-${Math.round(baisse)}`,
    ]);
    lines.push([
      t('ad.pay.histFilterCsvBaisseNote').replace('{n}', String(points.length)),
    ]);
  } else {
    lines.push([t('ad.pay.histFilterCsvBaisse'), t('ad.pay.histFilterCsvBaisseNone')]);
  }
  /* La date de l'export le plus récent que les jetons laissent : posée à côté
     du coût et de la baisse, elle date la tranche que l'archive emporte sans
     qu'on ait à parcourir ses lignes. La liste va du plus récent au plus
     ancien — la première ligne est donc celle-là. */
  if (points.length > 0) {
    lines.push([t('ad.pay.histFilterCsvLatest'), quand(points[0].at)]);
  } else {
    lines.push([t('ad.pay.histFilterCsvLatest'), t('ad.pay.histFilterCsvLatestNone')]);
  }
  lines.push([t('dirCsv.exportedOn'), stamp]);

  return csvText(lines);
}

export function downloadHistoriquePaiementsCsv(args: HistoriqueArgs) {
  saveCsv(paiementsHistoriqueCsvFilename(), buildHistoriquePaiementsCsv(args));
}