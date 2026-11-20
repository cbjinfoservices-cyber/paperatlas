import { localeFor } from '@/i18n/localize';
import { saveWorkbook, type XlsxCell, type XlsxSheet } from '@/lib/xlsx';
import {
  buildAttenteSheet,
  buildRenvoisSheet,
  type AccuseEnAttente,
  type RenvoiAccuse,
} from './adminAccusesCsv';
import { replyGapLabel } from '@/lib/messaging';
import {
  cleRubrique,
  rubriqueHorsType,
  RUBRIQUES_PAR_FAMILLE,
} from '@/lib/annonceLabels';
import { readRelanceAt, relanceTranche, type RelanceTranche } from './adminRelanceMemory';
import {
  ageJours,
  depotsParEmail,
  echeanceProche,
  estAdminCompte,
  estEssai,
  estFerme,
  jour,
  joursAvant,
  nombre,
  promotionARelire,
  relectureLongue,
  triParPromotion,
  triParRelecture,
  type AdminAbonnement,
  type AdminAnnonce,
  type AdminCompte,
  type AdminTri,
  type AdminTriPromo,
} from './adminTypes';

type Args = {
  /** Les lignes telles que la console les montre : l'export ne lit rien d'autre. */
  rows: AdminAbonnement[];
  comptes: AdminCompte[];
  /** Les dépôts de la console : les compteurs de chaque compte en viennent,
   *  jamais d'un chiffre tenu à part. */
  annonces: AdminAnnonce[];
  lang: string;
  t: (key: string) => string;
  /** L'état retenu dans la liste déroulante, ou « all ». */
  statut: string;
  /** Vrai quand la seule échéance proche est retenue. */
  nearOnly: boolean;
  /** Vrai quand seuls les comptes en relecture longue sont retenus. */
  lateOnly: boolean;
  /** Vrai quand seuls les comptes sans dépôt publié sont retenus : le compte
   *  des jetons posés le reprend, pour dater l'état exact du fichier. */
  sansPublie?: boolean;
  /** Vrai quand seuls les comptes dont un dépôt est arrivé après la relance
   *  sont retenus — le jeton du compteur. */
  apresOnly?: boolean;
  /** Vrai quand la table des comptes est resserrée sur les seuls comptes
   *  administrateurs : le compte des jetons posés le reprend. */
  adminOnly?: boolean;
  /** Vrai quand la liste est réduite aux comptes dont une conversation dort. */
  sleepOnly?: boolean;
  /** Vrai quand l'en-tête de tri « revue » était posé dans la messagerie :
   *  la ligne « Filtre de la liste » le dit, pour que deux exports du même
   *  jour ne se confondent pas. */
  revueTrie?: boolean;
  /** Le compte qui ouvrait la marche du tri « revue » au moment de l'export :
   *  celui du premier fil dormant restant à relire. Il se nomme à côté du tri
   *  actif, comme le compte du tri « après relance ». */
  revueTete?: string;
  /** Vrai quand l'en-tête de tri « après relance » était posé dans la
   *  messagerie : la ligne « Filtre de la liste » le dit aussi, avec le nom
   *  du compte qui ouvrait la marche, pour que deux exports du même jour ne se
   *  lisent pas pareil. */
  apresTrie?: boolean;
  /** Le compte qui ouvrait la marche du tri « après relance » : celui qui a
   *  déposé le plus depuis son message, lu sur la même mesure que le tableau.
   *  Il se nomme à côté du tri actif, comme le bouton de la messagerie. */
  apresTete?: string;
  /** Vrai quand l'en-tête de tri « relevé le plus récent » était posé dans la
   *  messagerie : la ligne « Filtre de la liste » le dit aussi, avec le compte
   *  qui ouvrait la marche, pour que deux exports du même jour ne se lisent
   *  pas pareil. Les quatre ordres s'excluent. */
  recentTrie?: boolean;
  /** Le compte qui ouvrait la marche du tri « relevé le plus récent » : celui
   *  du fil dont l'aire a été relevée le plus récemment depuis l'appareil. */
  recentTete?: string;
  /** Vrai quand l'en-tête de tri « aire jamais relevée d'abord » était posé
   *  dans la messagerie : la ligne « Filtre de la liste » le dit, pour que
   *  deux exports du même jour ne se lisent pas pareil. Les cinq ordres
   *  s'excluent. */
  jamaisTrie?: boolean;
  /** L'aire qui ouvrait la marche de ce tri : la première des aires encore
   *  dans la boîte qu'aucun relevé n'a emportées. Elle se nomme à côté du tri
   *  actif et passe dans le nom du fichier, comme les quatre autres ordres. */
  jamaisTete?: string;
  /** Vrai quand l'en-tête de tri « relevé le plus ancien d'abord » était posé
   *  dans la messagerie : la ligne « Filtre de la liste » le dit, pour que
   *  deux exports du même jour ne se lisent pas pareil. Les six ordres
   *  s'excluent. */
  ancienTrie?: boolean;
  /** Le compte qui ouvrait la marche de ce tri : celui du fil dont l'aire
   *  attend son relevé depuis le plus longtemps. */
  ancienTete?: string;
  /** Vrai quand l'ordre « gomme la plus récente d'abord » était posé dans la
   *  messagerie : la ligne « Filtre de la liste » le dit, avec l'aire qui
   *  ouvrait sa marche, pour que deux exports du même jour ne se lisent pas
   *  pareil. Les sept ordres s'excluent. */
  gommeTrie?: boolean;
  /** L'aire qui ouvrait la marche de ce tri : celle que la petite gomme vient
   *  de rendre vierge le plus récemment. Elle se nomme à côté du tri actif et
   *  passe dans le nom du fichier, comme les six autres ordres. */
  gommeTete?: string;
  /** Vrai quand l'ordre « gomme la plus ancienne d'abord » était posé dans la
   *  messagerie : la ligne « Filtre de la liste » le dit, avec l'aire qui
   *  ouvrait sa marche, pour que deux exports du même jour ne se lisent pas
   *  pareil. Les huit ordres s'excluent. */
  gommeAncienneTrie?: boolean;
  /** L'aire qui ouvrait la marche de ce tri : celle que la petite gomme a
   *  rendue vierge il y a le plus longtemps. */
  gommeAncienneTete?: string;
  /** Le poids du dernier geste de gomme : le nombre d'aires qu'elle a rendues
   *  vierges et celui des fils qu'elle a emportés, lus sur la même mémoire
   *  d'appareil que la pastille de la messagerie. Le nom du fichier les porte
   *  — « -gomme-2-aires-7-fils-1-restante-encore-2-parties-1-hors-boite-1 »
   *  — avec les aires encore dans la boîte après le geste, le partage
   *  « encore / parties » et celles qui l'ont quittée, pour
   *  que deux exports du même jour se distinguent par ce qui vient d'être
   *  rendu et par ce qu'il en reste. */
  gommePoids?: {
    aires: number;
    fils: number;
    restantes?: number;
    parties?: number;
    /** Le jour du dernier départ retenu — l'aire rendue par la gomme dont le
     *  geste est le plus récent parmi celles qui ont quitté la boîte. Le nom
     *  du fichier en porte le mois, juste après « -hors-boite », pour que
     *  deux exports d'une même journée ne se confondent plus. */
    dernierParti?: number | null;
  };
  /** Le jour d'effacement de chacune des aires rendues par la gomme qui ne
   *  sont plus dans la boîte : la synthèse les compte par mois d'effacement, le
   *  plus récent en tête, sur la même mémoire d'appareil que la messagerie. */
  gommeHorsMois?: { stamp: number }[];
  /** Les aires rendues par la gomme qui se tiennent encore dans la boîte au
   *  moment de l'export, avec leur nombre : la synthèse en pose le compte et
   *  les noms sur leur propre ligne, juste avant la ligne de l'écart, lus sur
   *  la même mémoire d'appareil que la pastille de la messagerie. */
  gommeRestantes?: { n: number; list: string; total?: number };
  /** Le sens que la ligne des aires parties lisait au moment du clic — la
   *  plus récemment effacée en tête, ou la plus anciennement quand la ligne
   *  était retournée. La synthèse le pose sur sa propre ligne : deux exports
   *  du même jour, faits avant et après un retournement, ne se lisent plus
   *  pareil. */
  gommeHorsSens?: 'recent' | 'ancien';
  /** L'écart de gomme — le jour du premier effacement retenu et celui du
   *  dernier —, lu sur la même mémoire d'appareil que la pastille. La
   *  synthèse le pose sur sa propre ligne, pour que l'effacement se lise
   *  dans le temps et pas seulement à sa dernière date. */
  gommeEcart?: {
    premier: number | null;
    dernier: number | null;
    jours: number | null;
  };
  /** Les aires dont le relevé porte la date du jour, au moment de l'export :
   *  la synthèse en donne le compte et les noms, et la ligne mène à la
   *  messagerie resserrée sur elles — un fichier se relit alors comme la
   *  journée s'est déroulée, pas seulement comme la boîte se lit. */
  airesJour?: {
    n: number;
    list: string;
    url?: string;
    /** Une porte par aire : chaque nom de la synthèse ouvre la messagerie
     *  resserrée sur cette seule aire, et le survol nomme les fils qu'elle a
     *  emportés, un à un — comme la pastille de la messagerie. */
    rows?: { label: string; url: string; fils?: number; detail?: string }[];
  };
  /** Les aires encore dans la boîte qu'aucun relevé n'a emportées au moment
   *  de l'export : la synthèse en donne le nombre et les noms, lus sur la même
   *  mémoire d'appareil que la pastille de la messagerie. `url` mène à la
   *  messagerie resserrée sur ces seules aires — la ligne du classeur est une
   *  porte, pas une lecture morte. */
  airesJamais?: {
    n: number;
    list: string;
    url?: string;
    /** Une porte par aire : chaque nom de la synthèse ouvre la messagerie
     *  resserrée sur cette seule aire. */
    rows?: { label: string; url: string }[];
  };
  /** Les aires sur lesquelles la messagerie était resserrée au moment du
   *  clic, et le jour du dernier relevé de chacune — ou la mention qu'elle
   *  n'a jamais été relevée. Lues sur la même mémoire d'appareil que la
   *  pastille de la boîte, elles disparaissent de la synthèse quand aucune
   *  aire n'était resserrée. */
  airesTight?: {
    n: number;
    list: string;
    /** La porte de tout le resserrement : la ligne de la plus ancienne
     *  date de relevé ouvre la boîte sur les mêmes aires. */
    url?: string;
    /** La plus ancienne date de relevé parmi ces aires : le nom du fichier
     *  la porte, pour distinguer deux exports du même jour. */
    oldest?: number | null;
    /** Les fils que ces aires laissent ensemble dans la boîte au moment du
     *  clic : la synthèse en pose le compte sous la ligne des aires, et
     *  chaque nom d'aire dit le sien au survol. Un fil n'est compté qu'une
     *  fois, même si deux aires le nomment. */
    fils?: number;
    /** Une ligne par aire, avec le jour de son dernier relevé, l'ancienneté
     *  de ce relevé en jours, le nombre de fils qu'elle laisse dans la
     *  boîte, et une porte vers la messagerie resserrée sur elle seule. */
    rows?: {
      region: string;
      detail: string;
      url: string;
      fils?: number;
      jours?: number | null;
      /** L'instant du dernier relevé de cette aire, en millisecondes : la
       *  ligne de la plus ancienne date porte une porte par aire, et la date
       *  elle-même s'y ouvre sur la boîte resserrée sur cette seule aire. */
      date?: number | null;
    }[];
  };
  /** Le nombre de fils en sommeil par adresse de compte : la colonne du
   *  classeur lit la même mesure que la pastille de la ligne. */
  filsDormants?: Map<string, number>;
  /** Les fils dormants relus pendant la visite, par adresse de compte : la
   *  même mémoire de session que le repère « relu » de la messagerie. */
  revusDormants?: Map<string, number>;
  /** L'état de la revue en cours, lue sur les fils eux-mêmes : il ne se déduit
   *  pas des colonnes par compte, où un fil partagé se compterait deux fois.
   *  Le nom du fichier le reprend pour distinguer deux exports du même jour. */
  revue?: { relus: number; total: number };
  /** Le journal de la revue : les fils dormants ouverts pendant cette visite,
   *  dans l'ordre où ils l'ont été, avec leur délai de réponse. Une ligne par
   *  fil, dans un onglet à part, pour que la visite se relise après coup. */
  revueJournal?: RevueJournalRow[];
  /** La tranche de relance retenue : le jour même, la semaine, ou aucune. */
  recent: RelanceTranche;
  /** L'ordre que le tableau affiche au moment de l'export. */
  ordre: AdminTri;
  /** Vrai quand la seconde table a été détachée du tri des abonnements :
   *  l'onglet « Comptes » reprend alors l'ordre de la table, comme l'écran. */
  comptesDetache?: boolean;
  /** Le tri par date de promotion posé sur la table des comptes : l'onglet
   *  « Comptes » le suit, pour que le fichier dise le même ordre que
   *  l'écran — la plus ancienne promotion en tête, ou la plus récente. */
  comptesPromo?: AdminTriPromo | null;
  /** Le journal des renvois d'accusés, lu au moment du clic : il part dans son
   *  propre onglet, à côté des abonnés. Absent, l'onglet l'est aussi — une
   *  lecture manquée ne ferme pas l'export. */
  renvois?: RenvoiAccuse[];
  /** La file du renvoi — les accusés qui ne sont pas encore partis —, lue au
   *  même clic : elle prend son onglet, pour joindre la file à un point
   *  d'étape. Absente, l'onglet l'est aussi. */
  attente?: AccuseEnAttente[];
};

/** Les jetons qui réduisent la liste, comptés sur les seuls choix qui
 *  retirent des lignes — l'état, les échéances, l'absence de dépôt publié, les
 *  relectures longues, l'après-relance, les comptes silencieux et la tranche
 *  de relance. La synthèse du classeur et le nom du fichier lisent ce même
 *  compte, pour qu'ils ne puissent pas diverger. */
type JetonsArgs = {
  statut: string;
  nearOnly: boolean;
  lateOnly?: boolean;
  apresOnly?: boolean;
  adminOnly?: boolean;
  sansPublie?: boolean;
  sleepOnly?: boolean;
  recent: RelanceTranche;
};

/** Les comptes administrateurs que le classeur emporte : la même règle que
 *  la pastille de la liste — le rôle le dit, ou l'adresse d'administration.
 *  La date de promotion vient de la console ; un compte promu avant cette
 *  note n'en a pas. L'ordre est celui de la table des comptes triée par
 *  promotion : la plus ancienne en tête, les promotions sans date fermant la
 *  marche — la feuille se relit donc dans le même sens que l'écran. Le nom du
 *  fichier et la feuille lisent cette seule liste, ils ne peuvent pas
 *  annoncer deux comptes différents. */
export function adminsDuClasseur(
  comptes: AdminCompte[],
  sens: AdminTriPromo = 'old',
): AdminCompte[] {
  return triParPromotion(
    comptes.filter((row) => estAdminCompte(row.email, row.role)),
    sens,
  );
}

/** Une ligne du journal de la revue : un fil dormant relu pendant la visite,
 *  son délai de réponse et la date de son dernier message. */
export type RevueJournalRow = {
  nom: string;
  /** Le compte à qui appartient le fil, quand la console en connaît un : la
   *  colonne le nomme sans qu'on ait à ouvrir sa fiche. */
  compte: string;
  /** L'adresse du compte, quand la console en connaît une : elle se copie
   *  depuis le classeur, sans repasser par la fiche. */
  mail: string;
  /** L'instant d'ouverture du fil pendant la visite : la revue se date à la
   *  minute, sans qu'on ait à la retrouver dans un autre fichier. Vide quand
   *  la mémoire d'appareil n'a pas retenu l'instant. */
  ouvertAt: string;
  gap: number;
  lastAt: string | null;
};

/** Ce que la visite dit d'elle-même : combien de fils dormants ont été relus,
 *  la première et la dernière ouverture retenues, et l'écart entre les deux.
 *  Une ligne sans instant lisible ne pèse pas sur les bornes : le classeur et
 *  la fiche du compte lisent la même mesure, ils ne peuvent pas se
 *  contredire. */
export type Visite = {
  relus: number;
  debut: number | null;
  fin: number | null;
  minutes: number | null;
};

/** Les bornes de la visite, lues sur les instants d'ouverture retenus. */
export function resumerVisite(journal: { ouvertAt: string }[]): Visite {
  const instants = journal
    .map((row) => new Date(row.ouvertAt).getTime())
    .filter((value) => Number.isFinite(value));
  const debut = instants.length > 0 ? Math.min(...instants) : null;
  const fin = instants.length > 0 ? Math.max(...instants) : null;
  const minutes =
    debut === null || fin === null ? null : Math.max(0, Math.round((fin - debut) / 60000));
  return { relus: journal.length, debut, fin, minutes };
}

/** L'écart entre la première et la dernière ouverture, dit comme le journal :
 *  les minutes tant qu'on reste dans l'heure, puis les heures et les
 *  minutes. */
export function dureeEnMots(minutes: number | null, t: (key: string) => string): string {
  if (minutes === null || !Number.isFinite(minutes)) return '';
  const value = Math.max(0, Math.round(minutes));
  if (value < 60) return t('ad.xls.reviewJournalSpanMin').replace('{n}', String(value));
  return t('ad.xls.reviewJournalSpanHour')
    .replace('{h}', String(Math.floor(value / 60)))
    .replace('{m}', String(value % 60).padStart(2, '0'));
}

/** La durée de la visite, réduite à ce qu'un nom de fichier peut porter :
 *  « 42min », « 1h07 ». */
export function dureeFichier(minutes: number | null): string {
  if (minutes === null || !Number.isFinite(minutes)) return '';
  const value = Math.max(0, Math.round(minutes));
  if (value < 60) return `${value}min`;
  return `${Math.floor(value / 60)}h${String(value % 60).padStart(2, '0')}`;
}

export function compterJetons({
  statut,
  nearOnly,
  lateOnly = false,
  apresOnly = false,
  adminOnly = false,
  sansPublie = false,
  sleepOnly = false,
  recent,
}: JetonsArgs): number {
  return [
    statut !== 'all',
    nearOnly,
    sansPublie,
    lateOnly,
    apresOnly,
    adminOnly,
    sleepOnly,
    recent !== 'none',
  ].filter(Boolean).length;
}

/** L'ordre lu, dit en toutes lettres : une relecture du fichier ne peut pas
 *  prendre ce rang pour l'ordre de la table. */
function ordreLabel(ordre: AdminTri, t: (key: string) => string): string {
  if (ordre === 'due') return t('ad.xls.orderDue');
  if (ordre === 'dueDesc') return t('ad.xls.orderDesc');
  if (ordre === 'late') return t('ad.xls.orderLate');
  if (ordre === 'lateDesc') return t('ad.xls.orderLateDesc');
  if (ordre === 'apres') return t('ad.xls.orderApres');
  if (ordre === 'apresDesc') return t('ad.xls.orderApresDesc');
  if (ordre === 'sleep') return t('ad.xls.orderSleep');
  if (ordre === 'sleepDesc') return t('ad.xls.orderSleepDesc');
  return t('ad.xls.orderNone');
}

/**
 * Le classeur des abonnés, sur quatre onglets : « Abonnés » tient une ligne
 * par abonnement, exactement comme le tableau ; « Synthèse » dit comment ces
 * mêmes lignes se répartissent et quelle tranche de liste le fichier
 * emporte ; « Comptes » reprend la seconde table ; « Relectures longues »
 * ouvre une ligne par dépôt encore sans réponse, avec son âge et l'adresse du
 * compte qui l'a déposé.
 */
export function buildAbonnesWorkbook({
  rows,
  comptes,
  lang,
  t,
  statut,
  nearOnly,
  lateOnly,
  apresOnly = false,
  adminOnly = false,
  sansPublie: sansPublieFiltre = false,
  sleepOnly = false,
  filsDormants,
  revusDormants,
  recent,
  ordre,
  comptesDetache = false,
  comptesPromo = null,
  annonces,
  revue,
  revueJournal = [],
  revueTrie = false,
  revueTete = '',
  apresTrie = false,
  apresTete = '',
  recentTrie = false,
  recentTete = '',
  jamaisTrie = false,
  jamaisTete = '',
  ancienTrie = false,
  ancienTete = '',
  gommeTrie = false,
  gommeTete = '',
  gommeAncienneTrie = false,
  gommeAncienneTete = '',
  gommeEcart,
  gommeHorsSens = 'recent',
  gommeHorsMois,
  gommeRestantes,
  airesJamais,
  airesJour,
  airesTight,
  renvois = [],
  attente = [],
}: Args): XlsxSheet[] {
  const depots = depotsParEmail(annonces);
  const dormantsDe = (email: string | null) => {
    const cle = (email || '').trim().toLowerCase();
    if (!cle) return 0;
    return filsDormants?.get(cle) ?? 0;
  };
  /* Les fils dormants déjà ouverts pendant la visite : la colonne du classeur
     s'éteint quand rien n'a été relu, et ne prétend pas mesurer un envoi. */
  const relusDe = (email: string | null) => {
    const cle = (email || '').trim().toLowerCase();
    if (!cle) return 0;
    return revusDormants?.get(cle) ?? 0;
  };
  const depotsDe = (email: string | null) => {
    const cle = (email || '').trim().toLowerCase();
    return cle ? depots.get(cle) : undefined;
  };
  const locale = localeFor(lang);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  /* Les jetons réellement posés sur la liste au moment du clic : l'en-tête de
     chaque onglet, la synthèse et le nom du fichier lisent ce même compte,
     donc ne peuvent pas se contredire. Un tri n'est pas un jeton : il range,
     il ne retire aucune ligne. */
  const jetonsActifs = compterJetons({
    statut,
    nearOnly,
    lateOnly,
    apresOnly,
    adminOnly,
    sansPublie: sansPublieFiltre,
    sleepOnly,
    recent,
  });

  /* L'en-tête du classeur : la date de l'export et le compte de jetons posés,
     en première ligne de chaque onglet, pour dater le fichier sans passer par
     la synthèse. */
  const entete: (string | number)[][] = [
    [
      t('ad.xls.headLine')
        .replace('{date}', dateLabel)
        .replace(
          '{chips}',
          jetonsActifs === 1
            ? t('ad.msg.chipOne')
            : t('ad.msg.chipMany').replace('{n}', String(jetonsActifs)),
        ),
    ],
    [],
  ];

  /* Chaque onglet s'ouvre sur cette ligne, puis garde ses colonnes telles
     quelles : rien d'autre ne bouge dans le fichier. */
  const avecEntete = (lignes: XlsxCell[][]): XlsxCell[][] => [...entete, ...lignes];

  /* ---- onglet 1 : les abonnements eux-mêmes ---- */
  const abonnes: (string | number)[][] = [];
  abonnes.push(
    [
      'ad.xls.num',
      'ad.clients.entreprise',
      'ad.xls.mail',
      'ad.clients.offre',
      'ad.clients.statut',
      'ad.clients.montant',
      'ad.clients.echeance',
      'ad.xls.daysLeft',
      'ad.clients.canal',
      'ad.clients.depuis',
      'ad.clients.metier',
      'ad.clients.ville',
      'ad.xls.depotsPublies',
      'ad.xls.depotsRefuses',
      'ad.xls.relectures',
      'ad.xls.lastRelance',
      'ad.xls.sleepThreads',
      'ad.xls.reviewedThreads',
    ].map(t),
  );

  /* Les dépôts en retard, rangés par compte et le plus ancien en tête : la
     colonne « Relectures longues » s'ouvre ainsi sous chaque compte en une
     ligne par dépôt, au lieu d'un total qu'on ne peut pas détailler. */
  const lateParCompte = new Map<string, AdminAnnonce[]>();
  triParRelecture(annonces).forEach((row) => {
    if (!relectureLongue(row.statut, row.created_at)) return;
    const cle = (row.email || '').trim().toLowerCase();
    if (!cle) return;
    const liste = lateParCompte.get(cle) ?? [];
    liste.push(row);
    lateParCompte.set(cle, liste);
  });

  /* L'instant de la dernière relance, par compte : la ligne de l'onglet
     « Abonnés », la pastille de l'onglet « Relectures longues » et le
     compteur de synthèse lisent tous ce même instant — trois lectures, une
     seule vérité. */
  const relanceStamps = new Map<string, number>();
  const noterRelance = (email: string | null) => {
    const cle = (email || '').trim().toLowerCase();
    if (!cle || relanceStamps.has(cle)) return;
    const stamp = new Date(readRelanceAt(email) || '').getTime();
    if (Number.isFinite(stamp)) relanceStamps.set(cle, stamp);
  };
  rows.forEach((row) => noterRelance(row.email));
  /* Les comptes du site lisent la même mémoire : un compte sans abonnement
     en cours garde sa relance, comme sur l'écran. */
  comptes.forEach((row) => noterRelance(row.email));

  /* Les comptes que le fichier emporte, sur les deux tables : la synthèse et
     l'onglet des comptes regardent le même ensemble. */
  const mailsComptes = new Set<string>();
  rows.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle) mailsComptes.add(cle);
  });
  comptes.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle) mailsComptes.add(cle);
  });

  /* Les dépôts entrés après le message du compte : la relance ne les couvre
     pas, le classeur les marque plutôt que de les noyer dans un total. Le
     compte, lui, est tenu par compte pour la ligne en retrait. */
  const apresRelance = new Set<string>();
  const apresParCompte = new Map<string, number>();
  /* Parmi ces dépôts, ceux qui attendent déjà depuis plus de sept jours : le
     complément de la ligne de synthèse, compté ici et nulle part ailleurs. */
  let apresRelanceLongues = 0;
  annonces.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    const stamp = relanceStamps.get(cle);
    if (stamp === undefined) return;
    const depot = new Date(row.created_at || '').getTime();
    if (!Number.isFinite(depot) || depot <= stamp) return;
    apresRelance.add(row.id);
    apresParCompte.set(cle, (apresParCompte.get(cle) ?? 0) + 1);
    if (relectureLongue(row.statut, row.created_at)) apresRelanceLongues += 1;
  });

  /* Le rang d'un compte parmi ceux dont un dépôt est arrivé après la
     relance : le premier est celui que le message a le moins couvert. Même
     mesure que la fiche et que l'onglet « Comptes », tenue une seule fois. */
  const apresValeurs = [...apresParCompte.values()];
  const rangApres = (n: number) => {
    if (n <= 0) return null;
    let rang = 1;
    apresValeurs.forEach((value) => {
      if (value > n) rang += 1;
    });
    return { rang, total: apresParCompte.size };
  };

  rows.forEach((row, index) => {
    const jours = joursAvant(row.date_echeance);
    /* La mémoire de l'appareil date la dernière relance ouverte depuis la
       console : la colonne ne prétend pas dire qu'un message est parti. */
    const relanceLe = jour(readRelanceAt(row.email), lang);
    abonnes.push([
      index + 1,
      row.entreprise || '—',
      row.email || '',
      row.offre || '',
      row.statut || '',
      Number(row.montant_mensuel ?? 0) || 0,
      row.date_echeance ? row.date_echeance.slice(0, 10) : '',
      jours === null ? '' : jours,
      row.canal_paiement || '',
      (row.date_debut ?? row.created_at ?? '').slice(0, 10),
      row.metier || '',
      row.ville || '',
      depotsDe(row.email)?.publies ?? 0,
      depotsDe(row.email)?.refuses ?? 0,
      depotsDe(row.email)?.longues ?? 0,
      relanceLe === '—' ? '' : relanceLe,
      dormantsDe(row.email),
      relusDe(row.email),
    ]);

    /* Sous le compte, un dépôt par ligne : le titre en retrait, l'adresse
       rappelée pour que chaque ligne se filtre seule, et l'âge de l'attente
       avec la date et le type du dépôt. */
    const cleCompte = (row.email || '').trim().toLowerCase();

    /* Juste sous le compte, la relance préparée rappelle combien de dépôts
       sont arrivés après elle : le chiffre se lit sans ouvrir un autre
       onglet, et il vient du même instant que la colonne de relance. */
    if (cleCompte && relanceStamps.has(cleCompte)) {
      const apres = apresParCompte.get(cleCompte) ?? 0;
      /* Le rang se lit sous le compte, sans quitter l'onglet : un compte
         seul dans cette situation n'annonce pas « 1 / 1 ». */
      const rangIci = rangApres(apres);
      const rangTexte =
        rangIci && rangIci.total > 1
          ? ` · ${t('ad.xls.afterRelanceRank')
              .replace('{r}', String(rangIci.rang))
              .replace('{t}', String(rangIci.total))}`
          : '';
      abonnes.push([
        '',
        `↳ ${
          apres > 0
            ? t('ad.ann.focusAfter').replace('{n}', String(apres))
            : t('ad.ann.focusAfterNone')
        }${rangTexte}`,
        cleCompte,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
    }

    const retards = cleCompte ? lateParCompte.get(cleCompte) ?? [] : [];
    retards.forEach((depot) => {
      const age = ageJours(depot.created_at);
      const ageTexte =
        age === null
          ? ''
          : age <= 0
            ? t('ad.f.depotToday')
            : t('ad.f.depotSince').replace('{n}', String(age));
      abonnes.push([
        '',
        `↳ ${depot.titre || '—'}`,
        cleCompte,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        [ageTexte, depot.kind || '', (depot.created_at ?? '').slice(0, 10)]
          .filter(Boolean)
          .join(' · '),
        '',
        '',
        '',
      ]);
    });
  });

  /* ---- onglet 2 : ce que ces mêmes lignes racontent ---- */
  const parEtat = new Map<string, number>();
  let actifs = 0;
  let essais = 0;
  let proches = 0;
  let mrr = 0;

  rows.forEach((row) => {
    const etat = (row.statut || '—').trim().toLowerCase();
    parEtat.set(etat, (parEtat.get(etat) ?? 0) + 1);
    if (!estFerme(etat)) {
      actifs += 1;
      const value = Number(row.montant_mensuel ?? 0);
      if (Number.isFinite(value)) mrr += value;
    }
    if (estEssai(etat)) essais += 1;
    if (echeanceProche(row.date_echeance)) proches += 1;
  });

  /* Les comptes de ces lignes qui n'ont encore rien de publié : le chiffre
     accompagne les colonnes de dépôts, il ne dit rien d'autre. */
  const sansPublie = new Set<string>();
  rows.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle && (depotsDe(row.email)?.publies ?? 0) === 0) sansPublie.add(cle);
  });

  /* Les comptes de ces lignes qui ont encore une relecture longue : le chiffre
     accompagne la colonne, pour retrouver ces comptes dans le fichier. */
  const avecRelecture = new Set<string>();
  rows.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle && (depotsDe(row.email)?.longues ?? 0) > 0) avecRelecture.add(cle);
  });

  /* Les dépôts encore en relecture depuis plus de sept jours, chez les
     comptes que le fichier emporte : une ligne par dépôt, le plus ancien en
     tête, avec l'âge de l'attente et l'adresse du compte. */  const adresses = new Map<string, string>();
  rows.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle && !adresses.has(cle)) adresses.set(cle, row.entreprise || '');
  });
  const vusIds = new Set<string>();
  const longuesLignes: AdminAnnonce[] = [];
  triParRelecture(annonces).forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (!adresses.has(cle)) return;
    if (!relectureLongue(row.statut, row.created_at)) return;
    if (vusIds.has(row.id)) return;
    vusIds.add(row.id);
    longuesLignes.push(row);
  });

  /* L'onglet ouvre un dépôt par ligne : quand la console est triée par
     relectures longues ou par dépôts arrivés après la relance, les comptes se
     suivent dans cet ordre et leurs dépôts gardent, à l'intérieur de chaque
     compte, l'ancienneté de relecture. Deux comptes également chargés se
     départagent par leur nom, pour que le fichier ne dépende pas de l'ordre
     d'arrivée des lignes. */
  if (
    ordre === 'apres' ||
    ordre === 'apresDesc' ||
    ordre === 'late' ||
    ordre === 'lateDesc'
  ) {
    const cleDe = (row: AdminAnnonce) => (row.email || '').trim().toLowerCase();
    const nomDe = (row: AdminAnnonce) =>
      adresses.get(cleDe(row)) || row.organisation || '';
    const nbDe = (row: AdminAnnonce) => {
      const cle = cleDe(row);
      return ordre === 'apres' || ordre === 'apresDesc'
        ? apresParCompte.get(cle) ?? 0
        : lateParCompte.get(cle)?.length ?? 0;
    };
    const decroissant = ordre === 'apres' || ordre === 'late';
    longuesLignes.sort((a, b) => {
      const nbA = nbDe(a);
      const nbB = nbDe(b);
      if (nbA !== nbB) return decroissant ? nbB - nbA : nbA - nbB;
      const parNom = nomDe(a).localeCompare(nomDe(b));
      if (parNom !== 0) return parNom;
      return (ageJours(b.created_at) ?? -1) - (ageJours(a.created_at) ?? -1);
    });
  }

  /* Les comptes relancés, sur la même mémoire d'appareil que le tableau :
     un compte compte une fois, même porté par plusieurs abonnements. Seules
     les tranches se lisent ici — les instants sont déjà retenus plus haut,
     pour que la ligne en retrait et la synthèse ne divergent pas. */
  const relancesJour = new Set<string>();
  const relancesSemaine = new Set<string>();
  rows.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (!cle) return;
    const tranche = relanceTranche(row.email);
    if (tranche === 'today') relancesJour.add(cle);
    if (tranche !== 'none') relancesSemaine.add(cle);
  });

  /* Les comptes du fichier dont une conversation dort : le même seuil qu'à
     l'écran, lu sur la mesure transmise par la console. */
  const comptesSilencieux = [...mailsComptes].filter(
    (cle) => (filsDormants?.get(cle) ?? 0) > 0,
  ).length;

  /* La revue en cours : les comptes qui portent au moins un fil dormant relu,
     et le total de ces fils — la même mémoire de session que l'écran. */
  const comptesRelus = [...mailsComptes].filter(
    (cle) => (revusDormants?.get(cle) ?? 0) > 0,
  ).length;
  const filsRelus = [...mailsComptes].reduce(
    (total, cle) => total + (revusDormants?.get(cle) ?? 0),
    0,
  );

  const part = (n: number) => (rows.length ? `${Math.round((n / rows.length) * 100)} %` : '0 %');

  /* Les jetons réellement posés sur la liste au moment du clic : l'en-tête
     des onglets, la synthèse et le nom du fichier lisent ce même compte, lu
     une seule fois plus haut. */

  const synthese: XlsxCell[][] = [];
  synthese.push([t('ad.xls.synthTitle')]);
  synthese.push([]);
  synthese.push([t('ad.xls.state'), t('ad.xls.count'), t('ad.xls.share')]);
  [...parEtat.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([etat, count]) => synthese.push([etat, count, part(count)]));
  synthese.push([t('ad.xls.total'), rows.length, part(rows.length)]);
  synthese.push([]);
  synthese.push([t('ad.clients.statut'), t('ad.xls.count')]);
  synthese.push([t('ad.stat.actifs'), actifs]);
  synthese.push([t('ad.stat.essai'), essais]);
  synthese.push([t('ad.xls.nearDue'), proches]);
  synthese.push([t('ad.xls.noPublie'), sansPublie.size]);
  synthese.push([t('ad.xls.withLate'), avecRelecture.size]);
  synthese.push([t('ad.xls.lateRows'), longuesLignes.length]);
  synthese.push([t('ad.xls.sleepAccounts'), comptesSilencieux]);
  synthese.push([t('ad.xls.reviewedAccounts'), comptesRelus]);
  synthese.push([t('ad.xls.reviewedThreadsTotal'), filsRelus]);
  /* L'état de la revue, dit comme la jauge de la messagerie : le total vient
     des fils eux-mêmes, pas de la somme des colonnes par compte. */
  synthese.push([
    t('ad.xls.reviewState'),
    revue && revue.total > 0 ? `${revue.relus} / ${revue.total}` : '',
  ]);
  /* Les aires encore dans la boîte qu'aucun relevé n'a emportées au moment du
     clic : le chiffre et les noms se lisent sur la même mémoire d'appareil
     que la pastille de la messagerie. Une boîte toute relevée ne laisse
     qu'un zéro — qui dit alors « plus rien à relever », pas « rien mesuré ».
     Les deux lignes portent l'adresse de la messagerie resserrée sur ces
     aires : elles ouvrent la boîte déjà réduite, sans la chercher. */
  synthese.push([
    t('ad.xls.airesJamais'),
    airesJamais && airesJamais.url
      ? { text: String(airesJamais.n), url: airesJamais.url }
      : airesJamais
        ? airesJamais.n
        : 0,
  ]);
  if (airesJamais && airesJamais.list) {
    /* Une ligne par aire : le nom se clique et ouvre la messagerie resserrée
       sur cette seule aire, au lieu d'une porte unique qui les emmène toutes.
       Quand la mémoire n'a pas livré les portes, la liste jointe reste en
       place, sans devenir un lien trompeur. */
    if (airesJamais.rows && airesJamais.rows.length > 0) {
      synthese.push([t('ad.xls.airesJamaisList')]);
      airesJamais.rows.forEach((entry) => {
        synthese.push([`↳ ${entry.label}`, { text: entry.label, url: entry.url }]);
      });
    } else {
      synthese.push([
        t('ad.xls.airesJamaisList'),
        airesJamais.url
          ? { text: airesJamais.list, url: airesJamais.url }
          : airesJamais.list,
      ]);
    }
    if (airesJamais.url) synthese.push([t('ad.xls.airesJamaisLink')]);
  }
  /* Les aires sur lesquelles la boîte était resserrée au moment du clic : le
     jour de leur dernier relevé de fils se lit ici, aire par aire, sur la même
     mémoire d'appareil que la pastille de la messagerie. Une aire encore
     jamais relevée le dit en clair plutôt que de laisser une date vide. */
  if (airesTight && airesTight.n > 0) {
    /* Le nom de la ligne porte, au survol, le total des fils que ces aires
       laissent ensemble dans la boîte : le poids du resserrement se lit sur
       la ligne elle-même, avant même de descendre sur celle des fils. */
    synthese.push([
      {
        text: t('ad.xls.airesTightJour'),
        hint: t('ad.xls.airesTightFilsTotalHint')
          .replace('{n}', String(airesTight.n))
          .replace('{fils}', String(Math.max(0, airesTight.fils ?? 0))),
      },
      airesTight.n,
    ]);
    /* Juste sous le compte des aires, celui des fils qu'elles laissent dans
       la boîte : le resserrement se pèse avant d'ouvrir le classeur, et deux
       exports du même jour ne portent plus le même chiffre. Le survol de la
       ligne donne le détail aire par aire — « Maghreb 4 · Golfe 3 » —, pour
       que le poids de chacune se lise sans descendre jusqu'à ses lignes. */
    const filsParAire = (airesTight.rows ?? [])
      .map((entry) => `${entry.region} ${Math.max(0, entry.fils ?? 0)}`)
      .join(' · ');
    synthese.push([
      {
        text: t('ad.xls.airesTightFils'),
        hint: filsParAire
          ? t('ad.xls.airesTightFilsParAireHint')
              .replace('{n}', String(Math.max(0, airesTight.fils ?? 0)))
              .replace('{detail}', filsParAire)
          : undefined,
      },
      Math.max(0, airesTight.fils ?? 0),
    ]);
    /* La plus ancienne date de relevé parmi ces aires, sur sa propre ligne :
       elle mène à la messagerie resserrée sur ces mêmes aires, comme la ligne
       des aires. Une aire encore jamais relevée laisse la mention « sans
       relevé » à la place d'une date qui n'existe pas. */
    const oldest = airesTight.oldest ?? null;
    const oldestTexte =
      oldest !== null && Number.isFinite(new Date(oldest).getTime())
        ? jour(new Date(oldest).toISOString(), lang)
        : t('ad.xls.airesTightOldestNone');
    synthese.push([
      t('ad.xls.airesTightOldest'),
      airesTight.url ? { text: oldestTexte, url: airesTight.url } : oldestTexte,
    ]);
    /* Sous la plus ancienne date, une porte par aire — comme la ligne des
       aires : le nom dit l'aire, la date du dernier relevé s'ouvre sur la
       boîte resserrée sur elle seule. Une aire encore jamais relevée garde sa
       porte : la case porte « sans relevé » et reste cliquable. */
    if (airesTight.rows && airesTight.rows.length > 0) {
      /* La ligne « Ces aires et leur dernier relevé » porte, à côté de son
         nom, la date de chaque aire mise à la suite dans l'ordre du monde :
         les dates se lisent d'un coup d'œil, et la ligne elle-même reste une
         porte — le clic ouvre la boîte resserrée sur ces mêmes aires. Chaque
         aire garde ensuite sa propre ligne, où sa date s'ouvre sur elle
         seule. */
      const datesParAire = airesTight.rows
        .map((entry) => {
          const jourDeLaire =
            entry.date !== null && entry.date !== undefined && Number.isFinite(entry.date)
              ? jour(new Date(entry.date).toISOString(), lang)
              : t('ad.xls.airesTightOldestNone');
          return `${entry.region} ${jourDeLaire}`;
        })
        .join(' · ');
      synthese.push([
        t('ad.xls.airesTightJourList'),
        airesTight.url
          ? {
              text: datesParAire,
              url: airesTight.url,
              hint: t('ad.xls.airesTightJourListHint'),
            }
          : datesParAire,
      ]);
      airesTight.rows.forEach((entry) => {
        /* Le nom de l'aire et sa date portent la même infobulle : au survol,
           le chiffre des fils qu'elle laisse dans la boîte se lit sans ouvrir
           la messagerie, et l'ancienneté de son relevé suit le même chiffre —
           « relevée il y a 12 jours ». La porte reste sur les deux cellules,
           la date comprise. */
        const ageTexte =
          entry.jours === null || entry.jours === undefined
            ? t('ad.xls.airesTightAgeJamais')
            : entry.jours <= 0
              ? t('ad.xls.airesTightAgeToday')
              : t('ad.xls.airesTightAgeDays').replace('{n}', String(entry.jours));
        const hint = `${t('ad.xls.airesTightFilsHint')
          .replace('{region}', entry.region)
          .replace('{n}', String(entry.fils ?? 0))} ${ageTexte}`;
        const dateDuReleve =
          entry.date !== null && entry.date !== undefined && Number.isFinite(entry.date)
            ? jour(new Date(entry.date).toISOString(), lang)
            : t('ad.xls.airesTightOldestNone');
        synthese.push([
          { text: `↳ ${entry.region}`, url: entry.url, hint },
          { text: dateDuReleve, url: entry.url, hint },
        ]);
      });
    } else {
      synthese.push([t('ad.xls.airesTightJourList'), airesTight.list]);
    }
  }
  /* Les aires dont le relevé porte la date du jour : la synthèse les compte
     et les nomme, et la ligne mène à la messagerie resserrée sur elles. Deux
     exports d'une même journée, faits avant et après un relevé, ne se lisent
     donc plus pareil — et le geste de la journée se retrouve sans chercher
     dans la boîte. */
  synthese.push([
    t('ad.xls.airesJour'),
    airesJour && airesJour.url
      ? { text: String(Math.max(0, airesJour.n ?? 0)), url: airesJour.url }
      : airesJour
        ? Math.max(0, airesJour.n ?? 0)
        : 0,
  ]);
  if (airesJour && airesJour.n > 0) {
    /* Le détail des fils emportés par ces aires, un à un : le survol de la
       ligne du compte les nomme, aire par aire, comme la pastille de la
       messagerie — le même chiffre, la même mémoire d'appareil. */
    const filsJour = (airesJour.rows ?? []).reduce(
      (total, entry) => total + Math.max(0, entry.fils ?? 0),
      0,
    );
    const detailJour = (airesJour.rows ?? [])
      .map(
        (entry) =>
          `${entry.label} : ${entry.detail || t('ad.xls.airesJourNoThread')}`,
      )
      .join(' — ');
    if (detailJour) {
      const hintJour = t('ad.xls.airesJourFilsHint')
        .replace('{fils}', String(filsJour))
        .replace('{detail}', detailJour);
      synthese[synthese.length - 1] = [
        { text: t('ad.xls.airesJour'), hint: hintJour },
        airesJour.url
          ? { text: String(Math.max(0, airesJour.n ?? 0)), url: airesJour.url, hint: hintJour }
          : Math.max(0, airesJour.n ?? 0),
      ];
    }
    /* Une ligne par aire : le nom se clique et ouvre la messagerie resserrée
       sur cette seule aire, comme les lignes des aires jamais relevées, et
       le survol nomme les fils qu'elle a emportés, un à un. */
    if (airesJour.rows && airesJour.rows.length > 0) {
      synthese.push([t('ad.xls.airesJourList')]);
      airesJour.rows.forEach((entry) => {
        const hint = entry.detail
          ? t('ad.xls.airesJourAireFilsHint')
              .replace('{region}', entry.label)
              .replace('{n}', String(Math.max(0, entry.fils ?? 0)))
              .replace('{detail}', entry.detail)
          : t('ad.xls.airesJourAireNoThread').replace('{region}', entry.label);
        synthese.push([
          { text: `↳ ${entry.label}`, url: entry.url, hint },
          { text: String(Math.max(0, entry.fils ?? 0)), url: entry.url, hint },
        ]);
      });
    } else if (airesJour.list) {
      synthese.push([
        t('ad.xls.airesJourList'),
        airesJour.url
          ? { text: airesJour.list, url: airesJour.url }
          : airesJour.list,
      ]);
    }
  }
  synthese.push([t('ad.xls.relancesToday'), relancesJour.size]);
  synthese.push([t('ad.xls.relancesWeek'), relancesSemaine.size]);
  synthese.push([t('ad.xls.afterRelanceRows'), apresRelance.size]);
  /* Juste après le total, ce que le message n'a pas couvert ET qui attend
     déjà : deux chiffres voisins, la même mesure que la fiche. */
  synthese.push([t('ad.xls.afterRelanceLateRows'), apresRelanceLongues]);
  /* Les comptes derrière ces dépôts : un compte compte une fois, même s'il
     a déposé plusieurs fois après son message. */
  synthese.push([t('ad.xls.afterRelanceAccounts'), apresParCompte.size]);
  /* Le complément, dit en clair : les comptes que le fichier emporte et pour
     lesquels aucun message n'a encore été préparé. */
  synthese.push([
    t('ad.xls.sansRelance'),
    [...mailsComptes].filter((cle) => !relanceStamps.has(cle)).length,
  ]);
  synthese.push([t('ad.stat.mrr'), nombre(Math.round(mrr))]);
  synthese.push([t('ad.stat.comptes'), comptes.length]);
  /* Les administrateurs et ceux dont la promotion remonte à plus de six mois,
     côte à côte : le second chiffre dit combien de rôles demandent une
     relecture, lu sur la même liste et la même date que la feuille dédiée. */
  const adminsSynthese = adminsDuClasseur(comptes);
  synthese.push([t('ad.xls.adminsSheetCount'), adminsSynthese.length]);
  synthese.push([
    t('ad.xls.adminsStaleCount'),
    adminsSynthese.filter((row) => promotionARelire(row)).length,
  ]);
  /* L'écart de gomme, sur sa propre ligne : le jour du premier effacement
     retenu et celui du dernier, avec les jours qui les séparent. Le premier
     jour ne se repose jamais, si bien que deux exports du même jour, faits
     avant et après une gomme, ne portent pas le même écart. */
  const gommeSpanTexte = (() => {
    if (!gommeEcart) return t('ad.xls.gommeSpanNone');
    const { premier, dernier, jours } = gommeEcart;
    const premierTexte =
      premier !== null && Number.isFinite(premier)
        ? jour(new Date(premier).toISOString(), lang)
        : t('ad.xls.gommeSpanNone');
    if (
      jours === null ||
      premier === null ||
      dernier === null ||
      !Number.isFinite(premier) ||
      !Number.isFinite(dernier) ||
      premier === dernier
    ) {
      return t('ad.xls.gommeSpanOne').replace('{date}', premierTexte);
    }
    return t('ad.xls.gommeSpanValue')
      .replace('{premier}', premierTexte)
      .replace('{dernier}', jour(new Date(dernier).toISOString(), lang))
      .replace('{n}', String(Math.max(0, jours)));
  })();
  /* Les aires rendues par la gomme qui se tiennent encore dans la boîte, sur
     leur propre ligne juste avant celle de l'écart : le geste se lit sur ce
     qui reste à voir, et deux exports du même jour, faits avant et après
     qu'une aire ait quitté la boîte, ne portent plus le même chiffre. */
  synthese.push([
    gommeRestantes && gommeRestantes.total !== undefined
      ? {
          text: t('ad.xls.gommeRestantes'),
          hint: t('ad.xls.gommeRestantesHint')
            .replace('{n}', String(Math.max(0, gommeRestantes.n)))
            .replace('{total}', String(Math.max(0, gommeRestantes.total))),
        }
      : t('ad.xls.gommeRestantes'),
    gommeRestantes ? Math.max(0, gommeRestantes.n) : 0,
  ]);
  if (gommeRestantes && gommeRestantes.list) {
    synthese.push([t('ad.xls.gommeRestantesList'), gommeRestantes.list]);
  }
  /* Les départs comptés par mois d'effacement, le plus récent en tête : la
     ligne du sens les porte, comme le survol du bouton qui retourne la ligne
     des aires parties dans la messagerie. Les deux lectures viennent de la
     même mémoire d'appareil, elles ne peuvent pas se contredire. */
  const gommeHorsMoisListe = (() => {
    const seaux = new Map<string, number>();
    (gommeHorsMois ?? []).forEach((entry) => {
      if (!Number.isFinite(entry.stamp) || entry.stamp <= 0) return;
      const moment = new Date(entry.stamp);
      const cle = `${moment.getFullYear()}-${String(moment.getMonth() + 1).padStart(2, '0')}`;
      seaux.set(cle, (seaux.get(cle) ?? 0) + 1);
    });
    const libelle = new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: 'numeric',
    });
    return [...seaux.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([cle, n]) => {
        const [annee, mois] = cle.split('-');
        return {
          cle,
          n,
          label: libelle.format(new Date(Number(annee), Number(mois) - 1, 1)),
        };
      });
  })();
  const gommeHorsMoisTexte = gommeHorsMoisListe
    .map((entry) => `${entry.label} ${entry.n}`)
    .join(' · ');
  const gommeHorsMoisTotal = gommeHorsMoisListe.reduce((total, entry) => total + entry.n, 0);
  const gommeHorsMoisHint =
    gommeHorsMoisListe.length > 0
      ? t('ad.xls.gommeHorsSensMois')
          .replace('{n}', String(gommeHorsMoisTotal))
          .replace('{list}', gommeHorsMoisTexte)
      : undefined;
  /* Le sens de la ligne des départs, tel que la messagerie le lisait au
     moment du clic : la ligne des aires parties se retourne dans la console,
     et le fichier dit lequel des deux sens était ouvert. Le survol y ajoute
     le compte des départs par mois d'effacement, et la ligne suivante les
     nomme en clair, mois par mois. */
  synthese.push([
    { text: t('ad.xls.gommeHorsSens'), hint: gommeHorsMoisHint },
    {
      text:
        gommeHorsSens === 'ancien'
          ? t('ad.xls.gommeHorsSensAncien')
          : t('ad.xls.gommeHorsSensRecent'),
      hint: gommeHorsMoisHint,
    },
  ]);
  if (gommeHorsMoisListe.length > 0) {
    synthese.push([
      `↳ ${t('ad.xls.gommeHorsSensMoisListe')}`,
      gommeHorsMoisTexte,
    ]);
  }
  synthese.push([t('ad.xls.gommeSpan'), gommeSpanTexte]);
  synthese.push([]);
  synthese.push([t('dirCsv.noteTitle')]);
  synthese.push([
    t('ad.xls.filter'),
    [
      statut === 'all' ? t('ad.clients.allStatus') : statut,
      nearOnly ? t('ad.clients.echeanceChip') : '',
      lateOnly ? t('ad.clients.lateChip') : '',
      apresOnly ? t('ad.stat.apresRelance') : '',
      sleepOnly ? t('ad.clients.sleepChip') : '',
      /* Le tri de revue se nomme aussi : le compte du premier fil dormant
         restant à relire ouvrait la marche au moment de l'export. */
      revueTrie
        ? revueTete
          ? `${t('ad.xls.revueSortActive')} · ${t('ad.xls.apresSortWho').replace(
              '{n}',
              revueTete,
            )}`
          : t('ad.xls.revueSortActive')
        : '',
      /* Le tri après relance se nomme : le compte qui ouvrait la marche est
         celui qui avait déposé le plus depuis son message au moment de
         l'export — la même mesure que le bouton de la messagerie. */
      apresTrie && !revueTrie
        ? apresTete
          ? `${t('ad.xls.apresSortActive')} · ${t('ad.xls.apresSortWho').replace(
              '{n}',
              apresTete,
            )}`
          : t('ad.xls.apresSortActive')
        : '',
      /* Le tri « relevé le plus récent » se nomme de la même façon, quand
         c'est lui qui parle : le compte qui ouvrait la marche est celui de
         l'aire fraîchement relevée, lu sur la même mémoire que la messagerie. */
      recentTrie && !revueTrie && !apresTrie
        ? recentTete
          ? `${t('ad.xls.recentSortActive')} · ${t('ad.xls.apresSortWho').replace(
              '{n}',
              recentTete,
            )}`
          : t('ad.xls.recentSortActive')
        : '',
      /* Le tri « aire jamais relevée d'abord » se nomme de la même façon,
         quand c'est lui qui parle : les aires encore dans la boîte ouvrent
         alors la liste. */
      jamaisTrie && !revueTrie && !apresTrie && !recentTrie
        ? jamaisTete
          ? `${t('ad.xls.jamaisSortActive')} · ${t('ad.xls.apresSortWho').replace(
              '{n}',
              jamaisTete,
            )}`
          : t('ad.xls.jamaisSortActive')
        : '',
      /* Le tri « relevé le plus ancien d'abord » se nomme de la même façon,
         quand c'est lui qui parle : les aires dont le relevé attend depuis le
         plus longtemps ouvrent alors la liste. */
      ancienTrie && !revueTrie && !apresTrie && !recentTrie && !jamaisTrie
        ? ancienTete
          ? `${t('ad.xls.ancienSortActive')} · ${t('ad.xls.apresSortWho').replace(
              '{n}',
              ancienTete,
            )}`
          : t('ad.xls.ancienSortActive')
        : '',
      /* Le tri « gomme la plus récente d'abord » se nomme de la même façon,
         quand c'est lui qui parle : l'aire que la petite gomme vient de
         rendre vierge ouvre alors la liste. */
      gommeTrie &&
      !revueTrie &&
      !apresTrie &&
      !recentTrie &&
      !jamaisTrie &&
      !ancienTrie
        ? gommeTete
          ? `${t('ad.xls.gommeSortActive')} · ${t('ad.xls.apresSortWho').replace(
              '{n}',
              gommeTete,
            )}`
          : t('ad.xls.gommeSortActive')
        : '',
      /* Le tri « gomme la plus ancienne d'abord » se nomme de la même façon,
         quand c'est lui qui parle : l'aire rendue vierge il y a le plus
         longtemps ouvre alors la liste. */
      gommeAncienneTrie &&
      !revueTrie &&
      !apresTrie &&
      !recentTrie &&
      !jamaisTrie &&
      !ancienTrie &&
      !gommeTrie
        ? gommeAncienneTete
          ? `${t('ad.xls.gommeAncienneSortActive')} · ${t(
              'ad.xls.apresSortWho',
            ).replace('{n}', gommeAncienneTete)}`
          : t('ad.xls.gommeAncienneSortActive')
        : '',
      recent === 'today'
        ? t('ad.clients.recentTodayChip')
        : recent === 'week'
          ? t('ad.clients.recentWeekChip')
          : '',
    ]
      .filter(Boolean)
      .join(' · '),
  ]);
  /* Le nombre de jetons posés, juste sous la ligne qui les nomme : il date
     l'état exact de la liste au moment de l'export, quand la ligne, trop
     longue, ne se lit plus d'un coup d'œil. */
  synthese.push([t('ad.xls.filterCount'), jetonsActifs]);
  synthese.push([
    t('ad.xls.order'),
    [
      ordreLabel(ordre, t),
      comptesDetache ? t('ad.xls.comptesDetache') : '',
      /* Le tri par promotion de la table des comptes se nomme ici : l'onglet
         « Comptes » le suit, le fichier le dit. */
      comptesPromo === 'old'
        ? t('ad.xls.comptesPromoOrder')
        : comptesPromo === 'recent'
          ? t('ad.xls.comptesPromoOrderRecent')
          : '',
    ]
      .filter(Boolean)
      .join(' · '),
  ]);
  synthese.push([t('dirCsv.exportedOn'), dateLabel]);
  synthese.push([t('ad.xls.note')]);
  synthese.push([t('ad.xls.indentedNote')]);
  synthese.push([t('ad.xls.lateNote')]);
  synthese.push([t('ad.xls.relanceNote')]);
  synthese.push([t('ad.xls.sleepNote')]);
  synthese.push([t('ad.xls.revuedNote')]);
  synthese.push([t('ad.xls.revueNote')]);
  synthese.push([t('ad.xls.airesJamaisNote')]);
  synthese.push([t('ad.xls.airesTightJourNote')]);
  synthese.push([t('ad.xls.airesTightFilsNote')]);
  synthese.push([t('ad.xls.airesTightOldestNote')]);
  /* Ce que le nom du fichier porte en plus des dates : les aires relevées le
     jour même, à côté de celles qui n'ont encore aucune date, et la petite
     gomme qui rend ces seules aires vierges. */
  synthese.push([t('ad.xls.airesTightTodayNote')]);
  /* Ce que la ligne des aires relevées aujourd'hui dit, et où elle mène : le
     compte se relit sans ouvrir la messagerie, la porte y mène resserrée. */
  synthese.push([t('ad.xls.airesJourNote')]);
  /* Ce que la ligne des aires relevées aujourd'hui dit de plus, au survol :
     les fils que chacune a emportés, un à un, comme la pastille. */
  synthese.push([t('ad.xls.airesJourFilsNote')]);
  synthese.push([t('ad.xls.gommeSpanNote')]);
  synthese.push([t('ad.xls.gommeRestantesNote')]);
  synthese.push([t('ad.xls.gommeHorsSensNote')]);
  synthese.push([t('ad.xls.comptesLateNote')]);
  synthese.push([t('ad.xls.lateComptesSheetNote')]);

  /* ---- onglet 3 : les comptes, tels que la seconde table les montre ---- */
  /* La seconde table suit le tri choisi à l'écran : triée par relectures
     longues ou par dépôts arrivés après la relance, elle se lit dans le même
     ordre que le tableau des abonnements, et deux comptes également chargés se
     départagent par leur nom. */
  const comptesOrdre = (() => {
    const list = [...comptes];
    const nomDe = (row: AdminCompte) => row.organisme || row.nom || '';
    const cleDe = (row: AdminCompte) => (row.email || '').trim().toLowerCase();
    /* Le tri par promotion posé à l'écran passe avant tout : la feuille suit
       la même règle que la table — promotions datées d'abord, puis celles
       dont la date reste à noter, puis les comptes ordinaires. */
    if (comptesPromo) return triParPromotion(list, comptesPromo);
    /* Détachée du tri des abonnements, la seconde table ne suit plus rien :
       l'onglet garde l'ordre de la table, comme l'écran le montre. */
    if (comptesDetache) return list;
    if (ordre === 'late' || ordre === 'lateDesc') {
      return list.sort((a, b) => {
        const ecart =
          (lateParCompte.get(cleDe(b))?.length ?? 0) - (lateParCompte.get(cleDe(a))?.length ?? 0);
        if (ecart !== 0) return ordre === 'late' ? ecart : -ecart;
        return nomDe(a).localeCompare(nomDe(b));
      });
    }
    if (ordre === 'apres' || ordre === 'apresDesc') {
      return list.sort((a, b) => {
        const ecart =
          (apresParCompte.get(cleDe(b)) ?? 0) - (apresParCompte.get(cleDe(a)) ?? 0);
        if (ecart !== 0) return ordre === 'apres' ? ecart : -ecart;
        return nomDe(a).localeCompare(nomDe(b));
      });
    }
    return list;
  })();

  const comptesSheet: (string | number)[][] = [];
  comptesSheet.push(
    [
      'ad.clients.entreprise',
      'ad.xls.mail',
      'ad.clients.offre',
      'ad.xls.role',
      'ad.xls.promotedOn',
      'csv.etabs',
      'pays.label',
      'ad.xls.metier',
      'ad.clients.depuis',
      'ad.xls.afterRelance',
      'ad.xls.afterRelanceRank',
      'ad.xls.lateCol',
      'ad.xls.ageDays',
      'ad.xls.sleepThreads',
      'ad.xls.reviewedThreads',
    ].map(t),
  );
  comptesOrdre.forEach((row) => {
    /* La même marque que dans l’onglet « Relectures longues » : lue sur la
       même mémoire d’appareil, elle compte les dépôts du compte datés après
       sa relance préparée. Un compte sans relance reste vide, et une relance
       sans dépôt postérieur ne dit rien non plus. */
    const cleCompte = (row.email || '').trim().toLowerCase();
    const stampCompte = new Date(readRelanceAt(row.email) || '').getTime();
    const apresCompte = Number.isFinite(stampCompte)
      ? annonces.filter((depot) => {
          if ((depot.email || '').trim().toLowerCase() !== cleCompte) return false;
          const depotStamp = new Date(depot.created_at || '').getTime();
          return Number.isFinite(depotStamp) && depotStamp > stampCompte;
        }).length
      : 0;
    /* Les relectures longues du compte, lues sur la même liste que l'onglet
       dédié : le compte, ici, se lit avec son attente sous les yeux. La
       colonne donne le nombre et l'âge de la plus ancienne ; les lignes en
       retrait nomment ensuite chaque dépôt et son âge. */
    const rangCompte = rangApres(apresCompte);
    const enRetard = cleCompte ? lateParCompte.get(cleCompte) ?? [] : [];
    const ages = enRetard
      .map((depot) => ageJours(depot.created_at))
      .filter((age): age is number => age !== null);
    const agePlusAncien = ages.length ? Math.max(...ages) : null;
    /* Le rôle est lu une fois : la cellule, la date de promotion et le compte
       d'établissements qui suit en dépendent, ils ne peuvent pas se
       contredire. */
    const estAdminLigne = estAdminCompte(row.email, row.role);

    comptesSheet.push([
      row.organisme || row.nom || '—',
      row.email || '',
      row.formule || '',
      /* Le rôle, dit comme la pastille de la liste : « Administrateur » ou
         « Compte ordinaire ». Une cellule vide se lirait comme une mesure
         manquante, alors que le rôle est toujours connu. */
      estAdminLigne ? t('ad.xls.roleAdmin') : t('ad.xls.roleOther'),
      /* La date de promotion, juste à côté du rôle : les promotions anciennes
         se relisent sans changer d'onglet. Une promotion antérieure à cette
         note n'a pas de date : la case porte alors la mention explicite
         « Date non enregistrée », jamais un vide qui se lirait comme une
         mesure manquante. */
      estAdminLigne
        ? row.role_changed_at
          ? (row.role_changed_at || '').slice(0, 10)
          : t('ad.xls.promoUnknown')
        : '',
      /* Un compte d'administration n'est pas un établissement : la cellule
         reste vide plutôt que d'afficher un zéro qui se lirait comme une
         mesure. */
      estAdminLigne ? '' : row.etablissements ?? 0,
      row.pays || '',
      row.metier || '',
      (row.created_at ?? '').slice(0, 10),
      apresCompte > 0
        ? t('ad.xls.afterRelanceComptes').replace('{n}', String(apresCompte))
        : '',
      /* Le rang lu sur la même mesure que la fiche : le premier est le compte
         que le message a le moins couvert. Un compte seul dans cette
         situation n'annonce pas de rang — un « 1 sur 1 » n'apprendrait rien. */
      rangCompte && rangCompte.total > 1
        ? t('ad.xls.afterRelanceRank')
            .replace('{r}', String(rangCompte.rang))
            .replace('{t}', String(rangCompte.total))
        : '',
      enRetard.length > 0
        ? t('ad.xls.lateComptes').replace('{n}', String(enRetard.length))
        : '',
      agePlusAncien === null ? '' : agePlusAncien,
      dormantsDe(row.email),
      relusDe(row.email),
    ]);

    enRetard.forEach((depot) => {
      const age = ageJours(depot.created_at);
      comptesSheet.push([
        `↳ ${depot.titre || '—'}`,
        cleCompte,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        t('ad.xls.lateRowMark'),
        age === null ? '' : age,
        '',
        '',
        '',
      ]);
    });
  });

  /* La mention explicite, dite aussi en note : une case sans date ne se
     confond plus avec une mesure oubliée. */
  comptesSheet.push([]);
  comptesSheet.push([t('dirCsv.noteTitle')]);
  comptesSheet.push([t('ad.xls.promoUnknownNote')]);

  /* ---- onglet : les administrateurs, un compte par ligne ---- */
  /* La même liste que le nom du fichier et que la feuille : une seule
     lecture, la plus ancienne promotion en tête, deux comptes promus le même
     jour se départageant par leur nom. Quand la table des comptes est triée
     de la plus récente à la plus ancienne, la feuille suit ce sens : les deux
     se relisent dans le même ordre. */
  const adminsComptes = adminsDuClasseur(
    comptes,
    comptesPromo === 'recent' ? 'recent' : 'old',
  );

  const adminsSheet: (string | number)[][] = [];
  adminsSheet.push(
    [
      'ad.clients.entreprise',
      'ad.xls.mail',
      'ad.clients.offre',
      'ad.xls.role',
      'ad.xls.promotedOn',
      'ad.clients.depuis',
      'pays.label',
    ].map(t),
  );
  adminsComptes.forEach((row) => {
    adminsSheet.push([
      row.organisme || row.nom || '—',
      row.email || '',
      row.formule || '',
      /* Le rôle est toujours connu : la cellule ne reste jamais vide. */
      t('ad.xls.roleAdmin'),
      /* La même mention que dans l'onglet « Comptes » : une promotion sans
         date se dit, elle ne se tait pas. */
      row.role_changed_at ? (row.role_changed_at || '').slice(0, 10) : t('ad.xls.promoUnknown'),
      (row.created_at ?? '').slice(0, 10),
      row.pays || '',
    ]);
  });
  if (adminsComptes.length === 0) adminsSheet.push([t('ad.xls.adminsSheetEmpty')]);
  adminsSheet.push([]);
  adminsSheet.push([t('dirCsv.noteTitle')]);
  /* L'ordre de la feuille se dit en clair : la plus ancienne promotion en
     tête, comme la table triée par promotion, les comptes sans date fermant
     la marche. */
  adminsSheet.push([t('ad.xls.adminsSheetOrder')]);
  adminsSheet.push([t('ad.xls.adminsSheetNote')]);
  adminsSheet.push([t('ad.xls.adminsSheetCount'), adminsComptes.length]);
  /* Le nombre de promotions de plus de six mois, à côté du compte
     d'administrateurs : le chiffre dit combien de rôles demandent une
     relecture, lu sur la même date que la colonne de promotion. */
  adminsSheet.push([
    t('ad.xls.adminsStaleCount'),
    adminsComptes.filter((row) => promotionARelire(row)).length,
  ]);
  adminsSheet.push([t('ad.xls.adminsStaleNote')]);

  /* ---- onglet 4 : les relectures longues, une ligne par dépôt ---- */
  const relecturesSheet: (string | number)[][] = [];
  relecturesSheet.push(
    [
      'ad.xls.num',
      'ad.xls.accountMail',
      'ad.clients.entreprise',
      'ad.xls.depot',
      'ad.xls.type',
      'ad.xls.rubrique',
      'ad.clients.ville',
      'ad.xls.postedOn',
      'ad.xls.ageDays',
      'ad.xls.relanceOn',
      'ad.xls.afterRelance',
    ].map(t),
  );
  longuesLignes.forEach((row, index) => {
    const cle = (row.email || '').trim().toLowerCase();
    /* La date de relance du compte vient de la même mémoire d'appareil que
       la colonne de l'onglet « Abonnés » : l'âge du dépôt et le message se
       lisent donc côte à côte, sans deux vérités. */
    const relanceLe = jour(readRelanceAt(row.email), lang);
    /* La pastille ne s'allume que sur les dépôts datés après le message ;
       les autres disent seulement qu'ils l'ont précédée, et restent vides
       quand le compte n'a pas de relance. */
    const marqueRelance =
      relanceLe === '—'
        ? ''
        : apresRelance.has(row.id)
          ? t('ad.xls.afterRelanceYes')
          : t('ad.xls.afterRelanceNo');
    relecturesSheet.push([
      index + 1,
      row.email || '',
      adresses.get(cle) || row.organisation || '',
      row.titre || '—',
      row.kind || '',
      row.rubrique || '',
      row.wilaya || '',
      (row.created_at ?? '').slice(0, 10),
      ageJours(row.created_at) ?? '',
      relanceLe === '—' ? '' : relanceLe,
      marqueRelance,
    ]);
  });
  if (longuesLignes.length === 0) {
    relecturesSheet.push([t('ad.xls.lateSheetEmpty')]);
  }

  /* ---- onglet : le journal de la revue, un fil relu par ligne ---- */
  /* L'onglet suit l'ordre des ouvertures de la visite : il se lit comme la
     revue s'est faite, pas comme la liste se range. Le délai de réponse vient
     de la même mesure que la pastille de sommeil — un fil n'entre ici que
     s'il dormait au moment où il a été ouvert. */
  const journalSheet: (string | number)[][] = [];
  /* Les bornes de la visite, lues sur les instants retenus : la colonne
     « minutes depuis la première ouverture » et le bas du journal partent de
     la même mesure, elles ne peuvent pas se contredire. */
  const visite = resumerVisite(revueJournal);
  /* L'heure d'ouverture d'un fil : la même horloge que la ligne « Ouvert il y
     a … » de la messagerie, réduite aux heures et aux minutes. Un instant
     illisible laisse la case vide plutôt que d'inventer une heure. */
  const heureLabel = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const heureOuverture = (stamp: string) => {
    if (!stamp) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return heureLabel.format(value);
  };
  /* La date et l'heure du dernier message : l'attente du fil se compare à
     l'heure de sa relecture, sans ouvrir la messagerie. */
  const momentLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const momentOuverture = (stamp: string | null) => {
    if (!stamp) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return momentLabel.format(value);
  };
  journalSheet.push(
    [
      'ad.xls.reviewJournalN',
      'ad.xls.reviewJournalThread',
      'ad.xls.reviewJournalCompte',
      'ad.xls.reviewJournalMail',
      'ad.xls.reviewJournalTime',
      'ad.xls.reviewJournalSince',
      'ad.xls.reviewJournalGap',
      'ad.xls.reviewJournalLast',
    ].map(t),
  );
  /* Les minutes écoulées depuis la première ouverture de la visite : chaque
     fil se situe ainsi à l'intérieur de la revue, sans recouper les heures
     de deux lignes. Un instant illisible ou une visite sans borne laisse la
     case vide. */
  const minutesDepuisDebut = (stamp: string) => {
    if (!stamp || visite.debut === null) return '';
    const value = new Date(stamp).getTime();
    if (!Number.isFinite(value)) return '';
    return Math.max(0, Math.round((value - visite.debut) / 60000));
  };
  revueJournal.forEach((row, index) => {
    journalSheet.push([
      index + 1,
      row.nom || '—',
      /* Le compte du fil se lit à côté de son nom : un fil relu se retrouve
         sans ouvrir sa fiche. Il reste vide quand la console n'en connaît
         aucun. */
      row.compte || '',
      /* Son adresse suit le nom : elle se copie depuis le classeur, sans
         ouvrir la fiche du compte. */
      row.mail || '',
      /* L'heure d'ouverture du fil pendant la visite : le journal se date à
         la minute, et deux passages sur le même fil gardent le premier. */
      heureOuverture(row.ouvertAt),
      /* Les minutes depuis la première ouverture : le fil se situe dans la
         visite, et deux fils voisins se comparent d'un coup d'œil. */
      minutesDepuisDebut(row.ouvertAt),
      replyGapLabel(row.gap, t) || '',
      /* La date et l'heure du dernier message : l'attente du fil se compare
         ainsi au moment de sa relecture, colonne voisine. */
      momentOuverture(row.lastAt),
    ]);
  });
  /* Chaque fil relu une seule fois : la mémoire de session ne garde qu'un
     repère par fil, le classeur ne peut donc pas le compter deux fois. */
  if (revueJournal.length === 0) {
    journalSheet.push([t('ad.xls.reviewJournalEmpty')]);
  }

  /* ---- le bas du journal : la visite elle-même ---- */
  /* La première et la dernière ouverture retenues pendant la visite : leur
     écart dit combien de temps la revue a duré, sans qu'on ait à recouper
     deux exports. Un instant illisible ne compte pas plutôt que d'inventer
     une heure. Les bornes sont celles lues plus haut, pour la colonne des
     minutes. */
  const ecartTexte = dureeEnMots(visite.minutes, t);
  journalSheet.push([]);
  journalSheet.push([t('ad.xls.reviewJournalSummary')]);
  journalSheet.push([t('ad.xls.reviewJournalReviewed'), visite.relus]);
  journalSheet.push([
    t('ad.xls.reviewJournalFirstOpen'),
    visite.debut === null ? '' : heureOuverture(new Date(visite.debut).toISOString()),
  ]);
  journalSheet.push([
    t('ad.xls.reviewJournalLastOpen'),
    visite.fin === null ? '' : heureOuverture(new Date(visite.fin).toISOString()),
  ]);
  journalSheet.push([t('ad.xls.reviewJournalSpan'), ecartTexte]);

  journalSheet.push([]);
  journalSheet.push([t('ad.xls.reviewJournalNote')]);
  /* La ligne de synthèse se dit aussi en clair, pour que la durée de la
     visite ne se lise pas comme un temps de réponse. */
  journalSheet.push([t('ad.xls.reviewJournalSummaryNote')]);

  /* ---- onglet 5 : les comptes en relecture longue, un par ligne ---- */
  const comptesLateSheet: XlsxCell[][] = [];
  comptesLateSheet.push(
    [
      'ad.clients.entreprise',
      'ad.xls.mail',
      'ad.xls.lateAccountCount',
      'ad.xls.oldestDepot',
      'ad.xls.type',
      'ad.xls.postedOn',
      'ad.xls.ageDays',
      'ad.xls.relanceOn',
      'ad.xls.afterRelance',
    ].map(t),
  );

  /* Les comptes se lisent sur les deux tables : un compte sans abonnement en
     cours garde sa relecture longue dans le fichier, et un compte annoncé par
     un seul dépôt n'est pas perdu non plus. */
  const nomsParMail = new Map<string, string>();
  comptes.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle && !nomsParMail.has(cle)) nomsParMail.set(cle, row.organisme || row.nom || '');
  });
  rows.forEach((row) => {
    const cle = (row.email || '').trim().toLowerCase();
    if (cle && !nomsParMail.has(cle)) nomsParMail.set(cle, row.entreprise || '');
  });

  const mailsEnRetard = [...new Set([...nomsParMail.keys(), ...lateParCompte.keys()])]
    .filter((cle) => (lateParCompte.get(cle) ?? []).length > 0)
    /* Le plus ancien dépôt d'abord : la ligne la plus urgente ouvre le fichier.
       Quand la console est triée par relectures longues, l'onglet suit ce
       choix : le compte le plus chargé ouvre le fichier, et l'ordre inverse le
       ferme. À nombre égal, c'est le plus ancien dépôt qui tranche, comme
       avant — deux comptes également chargés gardent leur urgence. */
    .sort((a, b) => {
      const listeA = lateParCompte.get(a) ?? [];
      const listeB = lateParCompte.get(b) ?? [];
      if (ordre === 'late' || ordre === 'lateDesc') {
        const ecart = listeB.length - listeA.length;
        if (ecart !== 0) return ordre === 'late' ? ecart : -ecart;
      }
      const ageA = ageJours(listeA[0]?.created_at) ?? -1;
      const ageB = ageJours(listeB[0]?.created_at) ?? -1;
      return ageB - ageA;
    });

  /* L'adresse de la console : le titre du plus ancien dépôt y mène d'un clic,
     sur la ligne déjà ouverte dans l'onglet « Annonces ». */
  const baseConsole = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  const lienDepot = (id: string, mail: string) =>
    `${baseConsole}/admin?depot=${encodeURIComponent(id)}&email=${encodeURIComponent(mail)}`;

  mailsEnRetard.forEach((cle) => {
    const liste = lateParCompte.get(cle) ?? [];
    /* La liste est déjà rangée par ancienneté de relecture : la première ligne
       est le dépôt qui attend depuis le plus longtemps. */
    const plusAncien = liste[0];
    const nom = nomsParMail.get(cle) || plusAncien?.organisation || '';
    const relanceLe = jour(readRelanceAt(cle), lang);
    const marque =
      relanceLe === '—'
        ? ''
        : apresRelance.has(plusAncien.id)
          ? t('ad.xls.afterRelanceYes')
          : t('ad.xls.afterRelanceNo');
    comptesLateSheet.push([
      nom || '—',
      cle,
      liste.length,
      /* Le titre du plus ancien dépôt ouvre sa ligne dans l'onglet
         « Annonces » : le classeur ne reste pas une lecture morte, il ramène
         à la liste où le dépôt s'ouvre. */
      plusAncien?.id
        ? { text: plusAncien.titre || '—', url: lienDepot(plusAncien.id, cle) }
        : plusAncien?.titre || '—',
      plusAncien?.kind || '',
      (plusAncien?.created_at ?? '').slice(0, 10),
      ageJours(plusAncien?.created_at) ?? '',
      relanceLe === '—' ? '' : relanceLe,
      marque,
    ]);
  });
  if (mailsEnRetard.length === 0) {
    comptesLateSheet.push([t('ad.xls.lateComptesSheetEmpty')]);
  }

  /* ---- onglet : les rubriques hors type, la liste à corriger ---- */
  /* Une ligne par dépôt dont la rubrique vient de l’autre famille, le plus
     récent en tête. La colonne des rubriques attendues nomme les quatre de la
     propre famille du dépôt : la correction se lit sans rouvrir la console. */
  const horsType = annonces
    .filter((row) => rubriqueHorsType(row.kind, row.rubrique))
    .slice()
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  const horsTypeSheet: XlsxCell[][] = [];
  horsTypeSheet.push(
    [
      'ad.xls.num',
      'ad.xls.accountMail',
      'ad.clients.entreprise',
      'ad.xls.depot',
      'ad.xls.type',
      'ad.xls.horsTypeRecorded',
      'ad.xls.horsTypeExpected',
      'ad.clients.ville',
      'ad.xls.postedOn',
      'ad.xls.ageDays',
    ].map(t),
  );

  horsType.forEach((row, index) => {
    const cle = (row.email || '').trim().toLowerCase();
    /* La famille du type déposé : c’est elle qui dit les rubriques attendues.
       Un type inconnu laisse la colonne vide plutôt que d’inventer une liste. */
    const type = (row.kind || '').trim().toLowerCase();
    const familleAttendue =
      type === 'annonce' ? 'annonce' : type === 'offre' ? 'offre' : null;
    const attendues = familleAttendue
      ? RUBRIQUES_PAR_FAMILLE[familleAttendue]
          .map((valeur) => {
            const label = cleRubrique(valeur);
            return label ? t(label) : valeur;
          })
          .join(' · ')
      : '';
    /* La rubrique enregistrée se nomme, et garde sa valeur brute entre
       parenthèses : la correction se fait sur une valeur qu’on a sous les
       yeux, pas sur une traduction approximative. */
    const labelRubrique = cleRubrique(row.rubrique);
    const rubrique = labelRubrique
      ? `${t(labelRubrique)} (${row.rubrique || ''})`
      : row.rubrique || '—';
    horsTypeSheet.push([
      index + 1,
      cle,
      nomsParMail.get(cle) || row.organisation || '',
      row.id ? { text: row.titre || '—', url: lienDepot(row.id, cle) } : row.titre || '—',
      row.kind || '',
      rubrique,
      attendues,
      row.wilaya || '',
      (row.created_at ?? '').slice(0, 10),
      ageJours(row.created_at) ?? '',
    ]);
  });

  if (horsType.length === 0) horsTypeSheet.push([t('ad.xls.horsTypeEmpty')]);

  horsTypeSheet.push([]);
  horsTypeSheet.push([t('dirCsv.noteTitle')]);
  horsTypeSheet.push([t('ad.xls.horsTypeCount'), horsType.length]);
  horsTypeSheet.push([t('dirCsv.exportedOn'), dateLabel]);
  horsTypeSheet.push([t('ad.xls.horsTypeNote')]);

  return [
    {
      name: 'Abonnés',
      rows: avecEntete(abonnes),
      widths: [5, 26, 30, 20, 14, 16, 14, 12, 16, 14, 20, 16, 16, 16, 18, 22, 18, 16],
    },
    /* Le journal des renvois, posé à côté des abonnés : une ligne par geste
       d'envoi, réussi ou non, avec sa date, son auteur et son destinataire. */
    buildRenvoisSheet({ rows: renvois, lang, t }),
    /* Et la file du renvoi, juste après : les accusés qui ne sont pas encore
       partis, la plus ancienne candidature en tête. Le classeur emporte ainsi
       le point d'étape tel qu'il se tient, sans avoir à rouvrir la console. */
    buildAttenteSheet({ rows: attente, lang, t }),
    /* Et la liste à corriger : les dépôts dont la rubrique vient de l’autre
       famille, avec les rubriques attendues de leur propre type. */
    {
      name: t('ad.xls.horsTypeSheet'),
      rows: avecEntete(horsTypeSheet),
      widths: [5, 30, 26, 40, 14, 30, 46, 16, 14, 12],
    },
    { name: 'Synthèse', rows: avecEntete(synthese), widths: [38, 30, 16] },
    {
      name: t('ad.xls.reviewJournalSheet'),
      rows: avecEntete(journalSheet),
      widths: [5, 44, 30, 30, 14, 14, 26, 18],
    },
    {
      name: 'Comptes',
      rows: avecEntete(comptesSheet),
      widths: [28, 30, 20, 18, 16, 12, 16, 20, 14, 30, 16, 28, 12, 18, 16],
    },
    {
      name: t('ad.xls.adminsSheet'),
      rows: avecEntete(adminsSheet),
      widths: [30, 30, 20, 16, 20, 14, 16],
    },
    {
      name: t('ad.xls.lateSheet'),
      rows: avecEntete(relecturesSheet),
      widths: [5, 30, 26, 40, 14, 18, 16, 14, 12, 22, 22],
    },
    {
      name: t('ad.xls.lateComptesSheet'),
      rows: avecEntete(comptesLateSheet),
      widths: [30, 30, 18, 40, 14, 14, 12, 22, 22],
    },
  ];
}

/**
 * `PaperAtlas-abonnes-tous-fils-dormants-revue-3-sur-8-jetons-2-admins-3-promos-relire-1-tri-promotion-ancienne-2026-11-07.xlsx`
 * — le nom dit la tranche que le fichier emporte, comme le classeur des devis
 * dit son état, l'état de la revue en cours, combien de jetons réduisaient la
 * liste, combien d'administrateurs la feuille dédiée emporte, combien de leurs
 * promotions demandent une relecture et l'ordre des lignes quand il diffère de
 * celui de la table — y compris le tri par promotion de la table des comptes,
 * qui range aussi l'onglet « Comptes » : deux exports du même jour ne se
 * confondent plus dans un dossier de téléchargement.
 */
export function abonnesWorkbookFilename(
  statut: string,
  nearOnly: boolean,
  lateOnly = false,
  recent: RelanceTranche = 'none',
  ordre: AdminTri = 'none',
  comptesDetache = false,
  sleepOnly = false,
  revue: { relus: number; total: number } | null = null,
  tete: {
    sort: 'revue' | 'apres' | 'recent' | 'jamais' | 'ancien' | 'gomme' | 'gommeAncienne';
    nom: string;
    n?: number;
  } | null = null,
  jetons = 0,
  dureeMin: number | null = null,
  admins = 0,
  staleAdmins = 0,
  comptesPromo: AdminTriPromo | null = null,
  airesTight: {
    n: number;
    oldest: number | null;
    fils?: number;
    /** Une entrée par aire, dans l'ordre du monde : le nom du fichier dit
     *  les fils que chacune laisse dans la boîte, une à une, compte celles
     *  qui n'ont encore jamais été relevées, et celles dont le relevé porte
     *  la date du jour. */
    rows?: { region: string; fils?: number; date?: number | null; jours?: number | null }[];
  } | null = null,
  gommePoids: {
    aires: number;
    fils: number;
    restantes?: number;
    parties?: number;
    dernierParti?: number | null;
  } | null = null,
) {
  const stamp = new Date().toISOString().slice(0, 10);
  const etat = (statut && statut !== 'all' ? statut : 'tous')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
  const tranche = [
    nearOnly ? '-echeances-30j' : '',
    lateOnly ? '-relectures-longues' : '',
    sleepOnly ? '-fils-dormants' : '',
    recent === 'today' ? '-relances-du-jour' : recent === 'week' ? '-relances-semaine' : '',
  ].join('');
  const tri = ordreFichier(ordre);
  /* Le tri par promotion de la table des comptes se lit comme les autres
     tris : deux exports du même jour, faits avant et après avoir posé ce
     tri, ne portent plus le même nom. */
  const promoPart =
    comptesPromo === 'old'
      ? '-tri-promotion-ancienne'
      : comptesPromo === 'recent'
        ? '-tri-promotion-recente'
        : '';
  /* L'état de la revue, réduit à ce qui se lit dans un nom de fichier :
     « -revue-3-sur-8 » dit où en était la visite, sans ouvrir le classeur. */
  const revuePart =
    revue && revue.total > 0 ? `-revue-${revue.relus}-sur-${revue.total}` : '';
  /* La durée de la visite se lit juste après le nombre de fils relus —
     « …-revue-3-sur-8-duree-42min-… » : deux exports d'une même revue
     arrêtée plus tard ne portent plus le même nom. Elle se mesure sur les
     ouvertures retenues, la même que la synthèse du journal. */
  const dureePart = dureeMin === null ? '' : `-duree-${dureeFichier(dureeMin)}`;
  /* Le nombre de jetons posés se lit juste après l'état de la revue :
     « …-revue-3-sur-8-jetons-2-… ». Il compte comme la synthèse, pour qu'un
     fichier dans un dossier de téléchargement dise de lui-même quelle tranche
     il emporte et combien de filtres la réduisaient. */
  const jetonsPart = `-jetons-${jetons}`;
  /* Le nombre d'administrateurs que la feuille emporte se lit juste après les
     jetons — « …-jetons-2-admins-3-… » : deux exports du même jour, faits
     avant et après une promotion, ne portent plus le même nom. */
  const adminsPart = `-admins-${Math.max(0, Math.round(admins))}`;
  /* Le nombre de promotions de plus de six mois se lit juste après les
     administrateurs — « …-admins-3-promos-relire-1-… » : deux exports du même
     jour, faits avant et après une relecture de rôle, ne portent plus le même
     nom. Le chiffre se lit sur la même liste et la même date que la feuille
     dédiée et la synthèse. */
  const stalePart = `-promos-relire-${Math.max(0, Math.round(staleAdmins))}`;
  /* Les aires resserrées dans la messagerie, leur poids et la plus ancienne
     date de leur relevé, réduite au jour et au mois pour se lire d'un coup
     dans un dossier, et son ancienneté en jours : « -aires-2-7-fils-releve-12j-plus-ancien-01-11 »,
     ou « -aires-2-7-fils-sans-releve » quand aucune ne porte encore de date.
     Deux exports du même jour, faits avant et après un relevé, ne se
     confondent plus. */
  const airesPart = (() => {
    const compte = Math.max(0, Math.round(airesTight?.n ?? 0));
    if (compte === 0) return '';
    /* Le compte des fils que ces aires laissent ensemble dans la boîte se lit
       juste après celui des aires — « -aires-2-7-fils-… » : le nom dit le
       poids du resserrement, pas seulement son étendue. Un fil n'y entre
       qu'une fois, comme dans la synthèse. */
    const fils = Math.max(0, Math.round(airesTight?.fils ?? 0));
    /* Les fils de chaque aire, une à une, juste après le total —
       « -par-aire-maghreb-4-golfe-3 » : le nom dit le poids réel de chacune,
       pas seulement celui du resserrement entier. Chaque nom d'aire est
       réduit à ce qu'un fichier peut porter, et une aire sans nom lisible
       s'efface plutôt que de laisser un tiret orphelin. */
    const parAire = (airesTight?.rows ?? [])
      .map((entry) => {
        const nom = slugFichier(entry.region).slice(0, 16);
        if (!nom) return '';
        return `${nom}-${Math.max(0, Math.round(entry.fils ?? 0))}`;
      })
      .filter(Boolean)
      .join('-');
    const detailPart = parAire ? `-par-aire-${parAire}` : '';
    /* Les aires encore sans relevé, comptées sur les lignes de la même
       mémoire d'appareil que la synthèse : leur nombre se lit à côté de la
       plus ancienne date — « …-plus-ancien-01-11-sans-releve-2 » —, pour que
       deux exports du même jour se distinguent aussi par ce qui reste à
       relever. Une aire jamais relevée compte une fois. */
    const lignesAires = airesTight?.rows ?? [];
    const sansReleve = lignesAires.filter(
      (entry) =>
        entry.date === null ||
        entry.date === undefined ||
        !Number.isFinite(entry.date),
    ).length;
    const sansPart = sansReleve > 0 ? `-sans-releve-${sansReleve}` : '';
    /* Les aires dont le relevé porte la date du jour, comptées sur les mêmes
       lignes : leur nombre se lit à côté de celles qui n'ont pas encore de
       date — « …-sans-releve-1-releve-aujourdhui-2 » —, pour que deux exports
       d'une même journée se distinguent aussi par ce qui vient d'être relevé.
       Une aire relevée aujourd'hui compte une fois. */
    const relevesJour = lignesAires.filter((entry) => entry.jours === 0).length;
    const jourPart = relevesJour > 0 ? `-releve-aujourdhui-${relevesJour}` : '';
    const oldest = airesTight?.oldest ?? null;
    const stamp = oldest === null ? new Date(NaN) : new Date(oldest);
    if (!Number.isFinite(stamp.getTime())) {
      return `-aires-${compte}-${fils}-fils${detailPart}-sans-releve${
        sansReleve > 0 ? `-${sansReleve}` : ''
      }${jourPart}`;
    }
    /* L'ancienneté du plus ancien relevé, en jours entiers : deux exports
       d'une même journée de relevé se distinguent par le jour et le mois qui
       suivent, et le chiffre se lit d'un coup d'œil dans un dossier. */
    const age = Math.max(0, Math.floor((Date.now() - stamp.getTime()) / 86400000));
    const jour = String(stamp.getDate()).padStart(2, '0');
    const mois = String(stamp.getMonth() + 1).padStart(2, '0');
    return `-aires-${compte}-${fils}-fils${detailPart}-releve-${age}j-plus-ancien-${jour}-${mois}${sansPart}${jourPart}`;
  })();
  /* Le poids du dernier geste de gomme — « -gomme-2-aires-7-fils-1-restante » :
     le nom dit ce qui vient d'être rendu, ce qu'il a emporté, et combien des
     aires rendues se tiennent encore dans la boîte, lus sur la même mémoire
     d'appareil que la pastille des aires du jour. */
  const gommePart = (() => {
    const aires = Math.max(0, Math.round(gommePoids?.aires ?? 0));
    const fils = Math.max(0, Math.round(gommePoids?.fils ?? 0));
    if (aires === 0 && fils === 0) return '';
    /* Les aires rendues qui restent portées par la boîte après le geste : le
       chiffre se lit juste après le poids, pour que deux exports du même jour,
       faits avant et après qu'une aire ait quitté la boîte, se distinguent. */
    const restantes = Math.max(0, Math.round(gommePoids?.restantes ?? 0));
    const restePart = `-${restantes}-${restantes === 1 ? 'restante' : 'restantes'}`;
    /* Les aires rendues qui ont quitté la boîte depuis le geste : leur compte
       se lit juste après celui des aires qui y restent — « -hors-boite-1 » —,
       pour que deux exports du même jour, faits avant et après un départ,
       ne se confondent plus dans un dossier de téléchargements. */
    const parties = Math.max(0, Math.round(gommePoids?.parties ?? 0));
    const horsPart = parties > 0 ? `-hors-boite-${parties}` : '';
    /* Le mois du dernier départ, posé juste après « -hors-boite » —
       « -hors-boite-2-mois-11-2026 » —, pour que deux exports faits le même
       jour, de part et d'autre d'un départ, ne s'écrivent plus pareil. Le
       mois se lit sur la même mémoire d'appareil que la pastille. */
    const dernierParti = gommePoids?.dernierParti ?? null;
    const moisPart = (() => {
      if (parties === 0 || dernierParti === null) return '';
      if (!Number.isFinite(dernierParti)) return '';
      const moment = new Date(dernierParti);
      if (!Number.isFinite(moment.getTime())) return '';
      return `-mois-${String(moment.getMonth() + 1).padStart(2, '0')}-${moment.getFullYear()}`;
    })();
    /* Le partage « encore / parties », posé juste à côté de « -hors-boite » :
       le même couple que la pastille de la messagerie — « 2 encore ·
       1 partie » —, pour que le nom du fichier se lise comme l'écran, sans
       avoir à ouvrir le classeur. */
    const splitPart = `-encore-${restantes}-parties-${parties}`;
    return `-gomme-${aires}-aires-${fils}-fils${restePart}${splitPart}${horsPart}${moisPart}`;
  })();
  /* Le compte ou l'aire qui ouvre la marche du tri actif se lit dans le nom,
     comme dans la ligne « Filtre de la liste » : « -tete-revue-… » pour
     l'ordre de revue, « -tete-apres-… » pour l'ordre après relance,
     « -tete-recent-… » pour le relevé le plus récent, « -tete-jamais-… » pour
     l'aire jamais relevée d'abord. Les cinq tris s'excluent, un seul nom
     peut donc s'écrire. */
  /* L'aire qui ouvre la marche se lit dans le nom ; quand c'est « aire jamais
     relevée d'abord » qui parle, le compte des aires encore à relever le
     suit — « -tete-jamais-maghreb-3-aires-… » : deux exports du même jour,
     faits avant et après un relevé, ne portent plus le même nom. */
  const tetePart =
    tete && tete.nom
      ? [
          '-tete-',
          tete.sort === 'revue'
            ? 'revue'
            : tete.sort === 'recent'
              ? 'recent'
              : tete.sort === 'jamais'
                ? 'jamais'
                : tete.sort === 'ancien'
                  ? 'ancien'
                  : tete.sort === 'gomme'
                    ? 'gomme'
                    : tete.sort === 'gommeAncienne'
                      ? 'gomme-ancienne'
                      : 'apres',
          '-',
          slugFichier(tete.nom),
          tete.sort === 'jamais' && (tete.n ?? 0) > 0
            ? `-${Math.round(tete.n ?? 0)}-aires`
            : '',
        ].join('')
      : '';
  /* La seconde table détachée du tri change ce que l'onglet « Comptes »
     contient : le nom le dit, pour distinguer deux exports par ailleurs
     identiques le même jour. */
  const detache = comptesDetache ? '-comptes-ordre-table' : '';
  return `PaperAtlas-abonnes-${etat}${tranche}${revuePart}${dureePart}${jetonsPart}${adminsPart}${stalePart}${airesPart}${gommePart}${tetePart}${tri}${promoPart}${detache}-${stamp}.xlsx`;
}

/** Un nom réduit à ce qu'un fichier peut porter : sans accent, sans espace
 *  et sans signe de ponctuation, assez court pour rester lisible. */
function slugFichier(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/** Le compte qui ouvrait la marche du tri de la messagerie au moment de
 *  l'export : celui de la revue d'abord, celui de l'après-relance ensuite,
 *  celui du relevé le plus récent, puis l'aire jamais relevée qui ouvrait le
 *  cinquième ordre — les cinq tris ne parlent jamais en même temps. */
function teteFichier(args: Args): {
  sort: 'revue' | 'apres' | 'recent' | 'jamais' | 'ancien' | 'gomme' | 'gommeAncienne';
  nom: string;
  n?: number;
} | null {
  if (args.revueTrie && args.revueTete) return { sort: 'revue', nom: args.revueTete };
  if (args.apresTrie && args.apresTete) return { sort: 'apres', nom: args.apresTete };
  if (args.recentTrie && args.recentTete) return { sort: 'recent', nom: args.recentTete };
  if (args.jamaisTrie && args.jamaisTete) {
    /* Le compte des aires jamais relevées au moment du clic accompagne l'aire
       qui ouvre la marche : les deux chiffres viennent de la même mémoire
       d'appareil que la synthèse et la pastille de la messagerie. */
    return {
      sort: 'jamais',
      nom: args.jamaisTete,
      n: Math.max(0, Math.round(args.airesJamais?.n ?? 0)),
    };
  }
  /* Le compte qui ouvre la marche de l'ordre « relevé le plus ancien
     d'abord » se nomme aussi : c'est ce qui attend depuis le plus longtemps. */
  if (args.ancienTrie && args.ancienTete) return { sort: 'ancien', nom: args.ancienTete };
  /* L'aire qui ouvre la marche de l'ordre « gomme la plus récente d'abord »
     se nomme aussi : c'est celle que la petite gomme vient de rendre vierge. */
  if (args.gommeTrie && args.gommeTete) return { sort: 'gomme', nom: args.gommeTete };
  /* L'aire qui ouvre la marche de l'ordre « gomme la plus ancienne d'abord »
     se nomme aussi : c'est la plus anciennement rendue vierge. */
  if (args.gommeAncienneTrie && args.gommeAncienneTete) {
    return { sort: 'gommeAncienne', nom: args.gommeAncienneTete };
  }
  return null;
}

/** L'ordre, réduit à ce qui se lit dans un nom de fichier : lisible sans
 *  ouvrir le classeur, et stable d'un export à l'autre. */
function ordreFichier(ordre: AdminTri): string {
  if (ordre === 'due') return '-tri-echeance';
  if (ordre === 'dueDesc') return '-tri-echeance-inverse';
  if (ordre === 'late') return '-tri-relectures-longues';
  if (ordre === 'lateDesc') return '-tri-relectures-longues-inverse';
  if (ordre === 'apres') return '-tri-apres-relance';
  if (ordre === 'apresDesc') return '-tri-apres-relance-inverse';
  if (ordre === 'sleep') return '-tri-fils-dormants';
  if (ordre === 'sleepDesc') return '-tri-fils-dormants-inverse';
  return '';
}

export function downloadAbonnesWorkbook(args: Args) {
  /* Les administrateurs que la feuille emporte, lus une seule fois : le
     compte et celui des promotions anciennes viennent de la même liste. */
  const admins = adminsDuClasseur(args.comptes);
  saveWorkbook(
    abonnesWorkbookFilename(
      args.statut,
      args.nearOnly,
      args.lateOnly,
      args.recent,
      args.ordre,
      args.comptesDetache ?? false,
      args.sleepOnly ?? false,
      args.revue ?? null,
      teteFichier(args),
      compterJetons(args),
      /* La durée de la visite, lue sur le même journal que la synthèse : le
         nom du fichier dit combien de temps la revue a couru, à côté du
         nombre de fils relus. */
      resumerVisite(args.revueJournal ?? []).minutes,
      /* Le nombre d'administrateurs que la feuille emporte : deux exports du
         même jour, faits avant et après une promotion, se distinguent. */
      admins.length,
      /* Et, juste après, combien de ces promotions demandent une relecture :
         le nom du fichier dit ce que la synthèse et la feuille annoncent. */
      admins.filter((row) => promotionARelire(row)).length,
      /* Le tri par promotion posé sur la table des comptes : le nom du
         fichier le dit, comme il dit les autres tris. */
      args.comptesPromo ?? null,
      /* Les aires resserrées dans la messagerie et la plus ancienne date de
         leur relevé : le nom du fichier les porte, pour que deux exports du
         même jour, faits avant et après un relevé, se distinguent. */
      args.airesTight
        ? {
            n: args.airesTight.n,
            oldest: args.airesTight.oldest ?? null,
            /* Les fils que ces aires laissent ensemble dans la boîte : le nom
               du fichier les porte à côté du nombre d'aires. */
            fils: args.airesTight.fils ?? 0,
            /* Et les fils de chacune, une à une, dans l'ordre du monde :
               « -par-aire-maghreb-4-golfe-3 ». */
            rows: (args.airesTight.rows ?? []).map((entry) => ({
              region: entry.region,
              fils: entry.fils ?? 0,
              /* La date du relevé de chaque aire : le nom du fichier compte
                 celles qui n'en ont pas encore — « -sans-releve-2 » — et
                 celles dont le relevé porte la date du jour —
                 « -releve-aujourdhui-2 ». */
              date: entry.date ?? null,
              jours: entry.jours ?? null,
            })),
          }
        : null,
      /* Le poids du dernier geste de gomme, lu sur la même mémoire d'appareil
         que la pastille de la messagerie : le nom du fichier le porte. */
      args.gommePoids ?? null,
    ),
    buildAbonnesWorkbook(args),
  );
}

type ApresRelanceArgs = {
  email: string;
  /** Le nom lu sur les dépôts, quand le compte en a un. */
  entreprise?: string | null;
  /** L'instant retenu au moment où la relance a été préparée. */
  relanceAt: string;
  /** Le rang de ce compte parmi ceux dont un dépôt est arrivé après leur
   *  relance : le même chiffre que la fiche, tenu par l'écran. */
  rang?: { rang: number; total: number } | null;
  /** Les dépôts de la console : la même liste que l'onglet « Annonces ». */
  annonces: AdminAnnonce[];
  /** Les jetons posés sur la liste des abonnés au moment du clic, relus dans
   *  la mémoire de l'appareil : le nom du fichier se date du même chiffre que
   *  le classeur des abonnés, sans le recalculer ici. */
  jetons?: number;
  /** La durée de la visite de la revue, lue sur le même journal que le
   *  classeur des abonnés : le nom du fichier porte la même durée, pour que
   *  tous les exports d'une visite se datent pareil. */
  dureeMin?: number | null;
  lang: string;
  t: (key: string) => string;
};

/**
 * Le classeur d'un seul geste : les dépôts d'un compte arrivés après sa
 * relance, et rien d'autre. Il ne refait pas la synthèse des abonnés — il
 * ouvre la poignée de lignes que le message n'a pas couvertes, avec leur âge
 * et leur état, pour les lire ou les transmettre telles quelles.
 */
export function buildApresRelanceWorkbook({
  email,
  entreprise,
  relanceAt,
  rang,
  annonces,
  jetons = 0,
  dureeMin = null,
  lang,
  t,
}: ApresRelanceArgs): XlsxSheet[] {
  const cle = (email || '').trim().toLowerCase();
  const stamp = new Date(relanceAt).getTime();
  const locale = localeFor(lang);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  /* L'en-tête du classeur, comme sur le classeur des abonnés : la date de
     l'export et le nombre de jetons posés sur la liste au moment du clic,
     en première ligne, pour dater le fichier sans ouvrir la synthèse. */
  const jetonsPoses = Math.max(0, Math.round(jetons ?? 0));
  const entete: (string | number)[][] = [
    [
      t('ad.xls.headLine')
        .replace('{date}', dateLabel)
        .replace(
          '{chips}',
          jetonsPoses === 1
            ? t('ad.msg.chipOne')
            : t('ad.msg.chipMany').replace('{n}', String(jetonsPoses)),
        ),
    ],
    [],
  ];

  /* La même règle que la pastille du bandeau et que l'onglet « Relectures
     longues » : un dépôt daté après le message n'est pas couvert par lui. */
  const apres = annonces
    .filter((row) => (row.email || '').trim().toLowerCase() === cle)
    .filter((row) => {
      const depot = new Date(row.created_at || '').getTime();
      return Number.isFinite(stamp) && Number.isFinite(depot) && depot > stamp;
    })
    .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));

  const sheet: (string | number)[][] = [];
  sheet.push(
    [
      'ad.xls.num',
      'ad.xls.accountMail',
      'ad.clients.entreprise',
      'ad.xls.depot',
      'ad.xls.type',
      'ad.xls.rubrique',
      'ad.clients.ville',
      'ad.xls.postedOn',
      'ad.xls.ageDays',
      'ad.clients.statut',
    ].map(t),
  );
  apres.forEach((row, index) => {
    sheet.push([
      index + 1,
      row.email || cle,
      entreprise || row.organisation || '',
      row.titre || '—',
      row.kind || '',
      row.rubrique || '',
      row.wilaya || '',
      (row.created_at ?? '').slice(0, 10),
      ageJours(row.created_at) ?? '',
      row.statut || '',
    ]);
  });
  if (apres.length === 0) sheet.push([t('ad.xls.afterSheetEmpty')]);

  /* Ce que la fiche annonce à côté du même compteur : combien de ces dépôts
     attendent déjà, et quel rang le compte occupe parmi les autres. Un
     compte seul dans cette situation n'annonce pas de rang — un « 1 / 1 »
     n'apprendrait rien, comme sur la fiche. */
  const apresLongues = apres.filter((row) =>
    relectureLongue(row.statut, row.created_at),
  ).length;
  sheet.push([]);
  sheet.push([t('ad.xls.afterSheetSummary')]);
  sheet.push([t('ad.xls.afterRelanceRows'), apres.length]);
  sheet.push([t('ad.xls.afterSheetLate'), apresLongues]);
  sheet.push([
    t('ad.xls.afterSheetRank'),
    rang && rang.total > 1
      ? t('ad.xls.afterRelanceRank')
          .replace('{r}', String(rang.rang))
          .replace('{t}', String(rang.total))
      : '',
  ]);

  /* La note ne cache pas d'où vient la date : un message ouvert depuis la
     console, pas un envoi. */
  sheet.push([]);
  sheet.push([t('dirCsv.noteTitle')]);
  sheet.push([t('ad.xls.relanceOn'), jour(relanceAt, lang)]);
  sheet.push([t('ad.xls.accountMail'), email || cle]);
  sheet.push([t('dirCsv.exportedOn'), dateLabel]);
  /* La durée de la visite se lit ici comme dans le nom du fichier : les deux
     exports d'une même revue se datent du même écart. */
  sheet.push([
    t('ad.xls.visitLength'),
    dureeEnMots(dureeMin, t) || '',
  ]);
  sheet.push([t('ad.xls.afterSheetNote')]);

  return [
    {
      name: t('ad.xls.afterSheet'),
      rows: [...entete, ...sheet],
      widths: [5, 30, 26, 40, 14, 18, 16, 14, 12, 14],
    },
  ];
}

/**
 * `PaperAtlas-depots-apres-relance-compte-exemple-jetons-2-2026-11-07.xlsx` —
 * le nom dit le compte, la tranche que le fichier emporte et le nombre de
 * jetons posés sur la liste au moment du clic : deux exports du même jour ne
 * se confondent plus dans un dossier de téléchargement.
 */
export function downloadApresRelanceWorkbook(args: ApresRelanceArgs) {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (args.email || 'compte')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
  /* Le même compte que la synthèse du classeur des abonnés : lu dans la
     mémoire de l'appareil, il date ce fichier aussi. */
  const jetons = Math.max(0, Math.round(args.jetons ?? 0));
  /* La durée de la visite se lit dans le nom, juste après les jetons : deux
     exports d'une même revue arrêtée plus tard ne portent plus le même nom,
     et le classeur des abonnés garde la même durée. */
  const dureePart =
    args.dureeMin === null || args.dureeMin === undefined
      ? ''
      : `-duree-${dureeFichier(args.dureeMin)}`;
  saveWorkbook(
    `PaperAtlas-depots-apres-relance-${slug}-jetons-${jetons}${dureePart}-${stamp}.xlsx`,
    buildApresRelanceWorkbook(args),
  );
}

type LateCompteArgs = {
  email: string;
  /** Le nom lu sur la fiche, quand le compte en a un. */
  entreprise?: string | null;
  /** Les dépôts de la console : la même liste que la fiche et l'onglet
   *  « Relectures longues ». */
  annonces: AdminAnnonce[];
  /** Les jetons posés sur la liste des abonnés au moment du clic : le nom du
   *  fichier se date du même chiffre que le classeur des abonnés. */
  jetons?: number;
  /** La durée de la visite de la revue, lue sur le même journal que le
   *  classeur des abonnés : le nom du fichier porte la même durée, pour que
   *  tous les exports d'une visite se datent pareil. */
  dureeMin?: number | null;
  lang: string;
  t: (key: string) => string;
};

/**
 * Le classeur d'un seul compte : ses dépôts encore en relecture depuis plus de
 * sept jours, et rien d'autre. Il ne refait pas la synthèse — il ouvre la
 * poignée de lignes que la fiche montre, avec leur âge, leur date de relance
 * et la pastille « arrivé après la relance ».
 */
export function buildCompteLateWorkbook({
  email,
  entreprise,
  annonces,
  jetons = 0,
  dureeMin = null,
  lang,
  t,
}: LateCompteArgs): XlsxSheet[] {
  const cle = (email || '').trim().toLowerCase();
  const locale = localeFor(lang);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  /* L'en-tête du classeur, comme sur le classeur des abonnés : la date de
     l'export et le nombre de jetons posés sur la liste au moment du clic,
     en première ligne, pour que deux fichiers du même jour ne se
     confondent plus. */
  const jetonsPoses = Math.max(0, Math.round(jetons ?? 0));
  const entete: (string | number)[][] = [
    [
      t('ad.xls.headLine')
        .replace('{date}', dateLabel)
        .replace(
          '{chips}',
          jetonsPoses === 1
            ? t('ad.msg.chipOne')
            : t('ad.msg.chipMany').replace('{n}', String(jetonsPoses)),
        ),
    ],
    [],
  ];

  /* La même règle que la fiche, le bandeau et l'onglet « Relectures
     longues » : un seul seuil, une seule liste. */
  const longues = triParRelecture(
    annonces.filter(
      (row) =>
        (row.email || '').trim().toLowerCase() === cle &&
        relectureLongue(row.statut, row.created_at),
    ),
  );
  const relanceLe = jour(readRelanceAt(cle), lang);

  const sheet: (string | number)[][] = [];
  sheet.push(
    [
      'ad.xls.num',
      'ad.xls.depot',
      'ad.xls.type',
      'ad.xls.rubrique',
      'ad.clients.ville',
      'ad.xls.postedOn',
      'ad.xls.ageDays',
      'ad.xls.relanceOn',
      'ad.xls.afterRelance',
    ].map(t),
  );
  longues.forEach((row, index) => {
    const marque =
      relanceLe === '—'
        ? ''
        : new Date(row.created_at || '').getTime() > new Date(readRelanceAt(cle) || '').getTime()
          ? t('ad.xls.afterRelanceYes')
          : t('ad.xls.afterRelanceNo');
    sheet.push([
      index + 1,
      row.titre || '—',
      row.kind || '',
      row.rubrique || '',
      row.wilaya || '',
      (row.created_at ?? '').slice(0, 10),
      ageJours(row.created_at) ?? '',
      relanceLe === '—' ? '' : relanceLe,
      marque,
    ]);
  });
  if (longues.length === 0) sheet.push([t('ad.xls.lateSheetEmpty')]);

  /* La note ne cache pas d'où vient la date de relance, ni le seuil retenu. */
  sheet.push([]);
  sheet.push([t('dirCsv.noteTitle')]);
  sheet.push([t('ad.xls.accountMail'), email || cle]);
  sheet.push([t('ad.clients.entreprise'), entreprise || '—']);
  sheet.push([t('dirCsv.exportedOn'), dateLabel]);
  /* La durée de la visite se lit ici comme dans le nom du fichier : les deux
     exports d'une même revue se datent du même écart. */
  sheet.push([
    t('ad.xls.visitLength'),
    dureeEnMots(dureeMin, t) || '',
  ]);
  sheet.push([t('ad.xls.lateOnlyNote')]);

  return [
    {
      name: t('ad.xls.lateSheet'),
      rows: [...entete, ...sheet],
      widths: [5, 40, 14, 18, 16, 14, 12, 22, 22],
    },
  ];
}

/**
 * `PaperAtlas-relectures-longues-compte-exemple-jetons-2-2026-11-07.xlsx` —
 * le nom dit le compte que le fichier emporte et le nombre de jetons posés
 * sur la liste au moment du clic.
 */
export function downloadCompteLateWorkbook(args: LateCompteArgs) {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (args.email || 'compte')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
  const jetons = Math.max(0, Math.round(args.jetons ?? 0));
  /* La durée de la visite se lit dans le nom, juste après les jetons : deux
     exports d'une même revue arrêtée plus tard ne portent plus le même nom,
     et le classeur des abonnés garde la même durée. */
  const dureePart =
    args.dureeMin === null || args.dureeMin === undefined
      ? ''
      : `-duree-${dureeFichier(args.dureeMin)}`;
  saveWorkbook(
    `PaperAtlas-relectures-longues-${slug}-jetons-${jetons}${dureePart}-${stamp}.xlsx`,
    buildCompteLateWorkbook(args),
  );
}

type JournalCompteArgs = {
  email: string;
  /** Le nom lu sur la fiche, quand le compte en a un. */
  entreprise?: string | null;
  /** Les fils de ce compte relus pendant la visite, dans l'ordre où ils l'ont
   *  été : la même mémoire de session que le journal du classeur, réduite à
   *  un seul compte. */
  journal: RevueJournalRow[];
  /** Les jetons posés sur la liste des abonnés au moment du clic : le nom du
   *  fichier se date du même chiffre que le classeur des abonnés. */
  jetons?: number;
  lang: string;
  t: (key: string) => string;
};

/**
 * Le journal de la revue d'un seul compte : les fils dormants de ce compte
 * relus pendant la visite, dans l'ordre de leurs ouvertures, avec les mêmes
 * colonnes que l'onglet du classeur des abonnés — l'heure d'ouverture, les
 * minutes depuis la première ouverture, le délai de réponse et le dernier
 * message. Le bas du journal reprend les bornes de la visite, pour dater la
 * revue sans ouvrir le fichier entier.
 */
export function buildCompteJournalWorkbook({
  email,
  entreprise,
  journal,
  jetons = 0,
  lang,
  t,
}: JournalCompteArgs): XlsxSheet[] {
  const cle = (email || '').trim().toLowerCase();
  const locale = localeFor(lang);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  /* L'en-tête du classeur, comme sur les autres exports d'un compte : la date
     de l'export et le nombre de jetons posés sur la liste au moment du clic. */
  const jetonsPoses = Math.max(0, Math.round(jetons ?? 0));
  const entete: (string | number)[][] = [
    [
      t('ad.xls.headLine')
        .replace('{date}', dateLabel)
        .replace(
          '{chips}',
          jetonsPoses === 1
            ? t('ad.msg.chipOne')
            : t('ad.msg.chipMany').replace('{n}', String(jetonsPoses)),
        ),
    ],
    [],
  ];

  const heureLabel = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const momentLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const heureDe = (stamp: string | null) => {
    if (!stamp) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return heureLabel.format(value);
  };
  const momentDe = (stamp: string | null) => {
    if (!stamp) return '';
    const value = new Date(stamp);
    if (!Number.isFinite(value.getTime())) return '';
    return momentLabel.format(value);
  };

  /* Les bornes de la visite, lues sur les instants retenus : la colonne des
     minutes et le bas du journal partent de la même mesure. */
  const visite = resumerVisite(journal);
  const minutesDepuisDebut = (stamp: string) => {
    if (!stamp || visite.debut === null) return '';
    const value = new Date(stamp).getTime();
    if (!Number.isFinite(value)) return '';
    return Math.max(0, Math.round((value - visite.debut) / 60000));
  };

  const sheet: (string | number)[][] = [];
  sheet.push(
    [
      'ad.xls.reviewJournalN',
      'ad.xls.reviewJournalThread',
      'ad.xls.reviewJournalCompte',
      'ad.xls.reviewJournalMail',
      'ad.xls.reviewJournalTime',
      'ad.xls.reviewJournalSince',
      'ad.xls.reviewJournalGap',
      'ad.xls.reviewJournalLast',
    ].map(t),
  );
  journal.forEach((row, index) => {
    sheet.push([
      index + 1,
      row.nom || '—',
      row.compte || entreprise || '',
      row.mail || cle,
      heureDe(row.ouvertAt || null),
      minutesDepuisDebut(row.ouvertAt),
      replyGapLabel(row.gap, t) || '',
      momentDe(row.lastAt),
    ]);
  });
  if (journal.length === 0) sheet.push([t('ad.xls.reviewJournalEmpty')]);

  /* Le bas du journal : les bornes de la visite, comme dans le classeur des
     abonnés, pour que la fiche et le fichier datent la revue de la même
     façon. */
  sheet.push([]);
  sheet.push([t('ad.xls.reviewJournalSummary')]);
  sheet.push([t('ad.xls.reviewJournalReviewed'), visite.relus]);
  sheet.push([
    t('ad.xls.reviewJournalFirstOpen'),
    visite.debut === null ? '' : heureDe(new Date(visite.debut).toISOString()),
  ]);
  sheet.push([
    t('ad.xls.reviewJournalLastOpen'),
    visite.fin === null ? '' : heureDe(new Date(visite.fin).toISOString()),
  ]);
  sheet.push([t('ad.xls.reviewJournalSpan'), dureeEnMots(visite.minutes, t)]);

  sheet.push([]);
  sheet.push([t('dirCsv.noteTitle')]);
  sheet.push([t('ad.xls.accountMail'), email || cle]);
  sheet.push([t('ad.clients.entreprise'), entreprise || '—']);
  sheet.push([t('dirCsv.exportedOn'), dateLabel]);
  sheet.push([t('ad.xls.visitLength'), dureeEnMots(visite.minutes, t) || '']);
  sheet.push([t('ad.xls.reviewJournalCompteNote')]);

  return [
    {
      name: t('ad.xls.reviewJournalSheet'),
      rows: [...entete, ...sheet],
      widths: [5, 44, 30, 30, 14, 14, 26, 18],
    },
  ];
}

/**
 * `PaperAtlas-journal-revue-compte-exemple-duree-42min-jetons-2-2026-11-07.xlsx`
 * — le nom dit le compte, la durée de la visite et le nombre de jetons posés
 * sur la liste : deux exports d'une même visite se datent pareil.
 */
export function downloadCompteJournalWorkbook(args: JournalCompteArgs) {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = (args.email || 'compte')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
  const jetons = Math.max(0, Math.round(args.jetons ?? 0));
  /* La durée de la visite, lue sur le même journal que la synthèse : le nom
     du fichier la porte, comme ceux des deux autres exports du compte. */
  const dureePart = resumerVisite(args.journal).minutes;
  const dureeSuffix = dureePart === null ? '' : `-duree-${dureeFichier(dureePart)}`;
  saveWorkbook(
    `PaperAtlas-journal-revue-${slug}${dureeSuffix}-jetons-${jetons}-${stamp}.xlsx`,
    buildCompteJournalWorkbook(args),
  );
}