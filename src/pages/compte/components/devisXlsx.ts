import { localeFor } from '@/i18n/localize';
import { STATUTS_DEVIS, statutDevis } from '@/lib/devis';
import type { DevisFiltre } from '@/lib/devisFiltre';
import {
  deviseDeLigne,
  montantCumule,
  partMontantCumule,
  partPreteParDevise,
  repartitionParDevise,
} from '@/lib/devisMontant';
import {
  devisDormantConfirmedHref,
  devisDormantHref,
  devisRestoredHref,
  devisRowHref,
} from '@/lib/b2bLinks';
import { saveWorkbook, type XlsxSheet } from '@/lib/xlsx';
import type { DeviseOrdre } from './DormantDeviseSplit';
import type {
  ForgottenMark,
  ForgottenMarks,
  RestoredMark,
  RestoredMarks,
} from './devisShareMemory';

/** One quote, as the list on screen shows it — nothing is added that the
 *  reader cannot see in « Mon compte ». */
export type DevisSheetRow = {
  reference: string;
  formule: string | null;
  etablissements: number | null;
  marche: string | null;
  rythme: string | null;
  montant_total: string | null;
  montant_mensuel: string | null;
  statut: string | null;
  statut_notifie: string | null;
  statut_notifie_at: string | null;
  created_at: string;
  relance_envoyee_at: string | null;
  /** The day the last grouped recap carried this file — null when none did. */
  recap_groupe_at: string | null;
};

type Args = {
  /** The very rows shown under the chips: the workbook keeps the chosen state. */
  rows: DevisSheetRow[];
  lang: string;
  t: (key: string) => string;
  filtre: DevisFiltre;
  /** True when the workbook only holds the files still unanswered after a week. */
  late?: boolean;
  /**
   * When the sheet does not hold a state but a given set of files — the ones a
   * group send has just carried, for instance — this sentence names that set
   * instead of a chip. Nothing else changes: the same rows, the same columns.
   */
  scopeLabel?: string;
  /**
   * True only for the trace of a group send: the summary then closes on the
   * list of the references that left, so the message can be re-read dossier by
   * dossier without reopening the site.
   */
  withRefs?: boolean;
  /**
   * Reference → the day that dossier was handed over to a colleague. The
   * address column marks those files, so a sheet read months later still says
   * which dossiers already circulate — and since when.
   */
  shared?: Record<string, string>;
  /**
   * Reference → the mark this account erased, with both days. A dossier whose
   * badge was taken off still leaves a line: the sheet says it once circulated
   * and when the mark was removed, instead of silently losing the trace.
   */
  forgotten?: ForgottenMarks;
  /**
   * Reference → the mark this account put back, with both days. The summary
   * counts them beside the erased ones: a sheet read later says how many lines
   * circulate again thanks to a restoration, and not only how many stopped.
   */
  restored?: RestoredMarks;
  /**
   * La lecture ouverte au moment de l'export, quand le classeur ne tient pas un
   * état mais une lecture : les dossiers rétablis, déjà partagés, seulement
   * adressés, ou endormis. La Synthèse la nomme, donc une feuille relue plus
   * tard dit ce qu'elle garde — et le nom du fichier le dit aussi.
   */
  reading?: 'restored' | 'shared' | 'addressed' | 'dormant' | 'dormantConfirmed' | null;
  /**
   * L'ordre choisi à l'écran pour les jetons de la répartition. Le classeur
   * écrit alors ses lignes de marché dans ce même ordre : la feuille suit la
   * lecture du lecteur, marché par marché, et ne le contredit jamais.
   */
  deviseOrder?: { dormant?: DeviseOrdre; confirmed?: DeviseOrdre };
};

/** Un jour, en millisecondes : le délai que porte chaque date de retour. */
const DAY_MS = 24 * 60 * 60 * 1000;
/** Same threshold as the list: a quote still « Reçu » after a full week. */
const LATE_DAYS = 7;

/** Whole days between the sending and today, never negative. */
function ageInDays(iso: string) {
  const at = new Date(iso).getTime();
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
}

/**
 * The filtered quotes as a real workbook, with two tabs: « Devis » holds one
 * line per file exactly as the list shows it, « Synthèse » counts them by
 * state. A sheet opened months later still says which slice of the list it
 * holds, and when it left.
 */
export function buildDevisWorkbook({
  rows,
  lang,
  t,
  filtre,
  late = false,
  scopeLabel,
  withRefs = false,
  shared,
  forgotten,
  restored,
  reading = null,
  deviseOrder,
}: Args): XlsxSheet[] {
  const locale = localeFor(lang);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());

  /* One day, written the same way everywhere in the sheet: the address note,
     the erased-mark trace and the summary all speak the same language. */
  const dayLabel = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(date);
  };

  /* ---- tab 1: the lines themselves ---- */
  const devis: (string | number)[][] = [];
  devis.push([
    'csv.num',
    'csv.ref',
    'csv.formule',
    'csv.etabs',
    'dv.marche',
    'dv.mensuel',
    'dv.listTotal',
    /* La durée retenue se lit juste à côté du montant : la feuille dit d'un
       coup ce que la structure paie et sur quelle longueur de temps, sans
       renvoyer à la formule écrite trois colonnes plus haut. */
    'dv.dureeRetenue',
    'csv.statut',
    'dv.listSentOn',
    'dv.csvDays',
    'dv.csvLate',
    'dv.relanceOn',
    'dv.recapGroupCol',
    'dv.notifiedOn',
    'dv.csvLinkCol',
    /* La situation du dossier, dans une colonne à elle : partagé, rendu après
       un retrait, ou seulement adressé. Les trois états s'excluent, donc la
       ligne se lit sans croiser les deux traces voisines. */
    'dv.csvShareStateCol',
    /* La colonne des marques retirées : une feuille relue des mois plus tard
       garde la trace des dossiers qui ont circulé puis dont la marque a été
       effacée. */
    'dv.csvForgotCol',
    /* Sa voisine, sur la même ligne : le jour où la marque est revenue, pour
       que le geste inverse se lise dossier par dossier dans l'onglet. */
    'dv.csvRestoredOnCol',
    /* Et le temps que ce retour porte : le délai écoulé depuis, ligne par
       ligne, sans avoir à compter les jours sur le calendrier. */
    'dv.csvRestoredAgoCol',
  ].map(t));

  /* The address of each dossier, written in its own column: a sheet read months
     later reopens one line of the list without hunting the filters. Built from
     the very reference of the row, never from the reading on screen. */
  const lienDe = (reference: string) => {
    try {
      return devisRowHref(reference, lang);
    } catch {
      return '';
    }
  };

  /* A dossier already handed over carries the mark of that share beside its
     address: the address itself comes first and stays whole, so it can still be
     read and copied; the note only says what already circulates. */
  /* Le jour du dernier partage de la feuille : la colonne le porte sur chaque
     dossier marqué, pour que la feuille dise, comme l’en-tête de la liste, quand
     le dernier dossier est parti. */
  /* Le jour du dernier rétablissement du lot : la Synthèse le nomme comme
     l'écran le fait, pour que la feuille et la bulle disent la même chose. */
  const dernierRetour = rows.reduce<string | null>((latest, row) => {
    const at = restored?.[row.reference]?.restoredAt;
    if (!at) return latest;
    const stamp = new Date(at).getTime();
    if (!Number.isFinite(stamp)) return latest;
    if (!latest) return at;
    return stamp > new Date(latest).getTime() ? at : latest;
  }, null);

  const dernierPartage = rows.reduce<string | null>((latest, row) => {
    const at = shared?.[row.reference];
    if (!at) return latest;
    const stamp = new Date(at).getTime();
    if (!Number.isFinite(stamp)) return latest;
    if (!latest) return at;
    return stamp > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Le délai moyen depuis le retour du lot exporté : la moyenne des délais que
     porte chaque dossier revenu, arrondie au jour. Rien n'est écrit quand le lot
     n'a aucun retour — une moyenne sans dossier ne dirait rien. */
  let retoursSomme = 0;
  let retoursComptes = 0;
  rows.forEach((row) => {
    const trace = restored?.[row.reference];
    if (!trace) return;
    const at = new Date(trace.restoredAt).getTime();
    if (!Number.isFinite(at)) return;
    retoursSomme += ageInDays(trace.restoredAt);
    retoursComptes += 1;
  });
  const retourMoyen = retoursComptes > 0 ? Math.round(retoursSomme / retoursComptes) : null;

  const adresseDe = (reference: string) => {
    const address = lienDe(reference);
    /* Seuls les dossiers marqués portent la date ; c’est la même pour tous, et
       c’est celle du partage le plus récent du lot. */
    const at = shared?.[reference] ? dernierPartage : null;
    const stamp = at ? new Date(at) : null;
    if (!address || !stamp || Number.isNaN(stamp.getTime())) return address;
    const jour = dayLabel(at as string);
    return `${address} · ${t('dv.csvSharedMark').replace('{date}', jour)}`;
  };

  /* Ce que le dossier est devenu : rendu après un retrait, partagé à un
     collègue, ou seulement adressé — c'est-à-dire muni de son adresse mais
     jamais transmis. Un dossier rendu n'est pas annoncé deux fois : le retour
     l'emporte, puisque c'est ce que la feuille doit lire. */
  const situationDe = (reference: string) => {
    if (restored?.[reference]) return t('dv.csvShareStateRestored');
    if (shared?.[reference]) return t('dv.csvShareStateShared');
    return t('dv.csvShareStateAddressed');
  };

  /* La trace d'une marque retirée, dans sa propre colonne : le jour du retrait,
     puis le jour où le dossier avait été partagé. Rien n'est dit pour un dossier
     qui n'a jamais perdu sa marque — la colonne reste alors vide. */
  const oubliDe = (reference: string) => {
    const trace = forgotten?.[reference];
    if (!trace) return '';
    const retrait = dayLabel(trace.forgottenAt);
    const partage = dayLabel(trace.sharedAt);
    if (!retrait || !partage) return '';
    return t('dv.csvForgotMark')
      .replace('{date}', retrait)
      .replace('{shared}', partage);
  };

  /* Le pendant de la colonne des retraits : le jour du retour, puis celui où
     le dossier avait été partagé. Un dossier dont la marque n'est jamais
     revenue laisse la colonne vide. */
  const retabliDe = (reference: string) => {
    const trace = restored?.[reference];
    if (!trace) return '';
    const retour = dayLabel(trace.restoredAt);
    const partage = dayLabel(trace.sharedAt);
    if (!retour || !partage) return '';
    return t('dv.csvRestoredMark')
      .replace('{date}', retour)
      .replace('{shared}', partage);
  };

  /* Le délai écoulé depuis le retour, dans sa propre colonne : un dossier
     revenu dit depuis combien de jours il est là ; les autres laissent la
     colonne vide, comme celles des deux marques voisines. */
  const retourDelaiDe = (reference: string) => {
    const trace = restored?.[reference];
    if (!trace) return '';
    const at = new Date(trace.restoredAt).getTime();
    if (!Number.isFinite(at)) return '';
    return t('dv.csvRestoredAgo').replace('{n}', String(ageInDays(trace.restoredAt)));
  };

  /* L'onglet « Devis » se lit par délai depuis le retour, du plus récent au
     plus ancien : les dossiers rendus passent donc en tête, du délai le plus
     court au plus long — c'est-à-dire du retour le plus récent au plus ancien.
     Les autres lignes gardent l'ordre de la liste, à la suite. */
  const lignesClassees = [...rows].sort((a, b) => {
    const at = restored?.[a.reference]?.restoredAt;
    const bt = restored?.[b.reference]?.restoredAt;
    if (at && bt) return ageInDays(at) - ageInDays(bt);
    if (at) return -1;
    if (bt) return 1;
    return 0;
  });

  lignesClassees.forEach((row, index) => {
    const etat = statutDevis(row.statut);
    const days = ageInDays(row.created_at);
    devis.push([
      index + 1,
      row.reference,
      row.formule || t('dv.acctTitle'),
      row.etablissements ?? '',
      row.marche ?? '',
      row.montant_mensuel ?? '',
      row.montant_total || row.montant_mensuel || '',
      row.rythme ?? '',
      t(`dv.st.${etat}`),
      row.created_at.slice(0, 10),
      days,
      etat === 'recu' && days >= LATE_DAYS ? t('dv.csvYes') : t('dv.csvNo'),
      row.relance_envoyee_at ? row.relance_envoyee_at.slice(0, 10) : '',
      row.recap_groupe_at ? row.recap_groupe_at.slice(0, 10) : '',
      row.statut_notifie_at
        ? `${row.statut_notifie_at.slice(0, 10)}${
            row.statut_notifie ? ` · ${t(`dv.st.${statutDevis(row.statut_notifie)}`)}` : ''
          }`
        : '',
      adresseDe(row.reference),
      situationDe(row.reference),
      oubliDe(row.reference),
      retabliDe(row.reference),
      retourDelaiDe(row.reference),
    ]);
  });

  /* ---- tab 2: how those very lines split between the states ---- */
  const parEtat: Record<string, number> = { recu: 0, en_etude: 0, confirme: 0, expire: 0 };
  let enRetard = 0;
  /* Files a grouped recap has already carried: the same date the « Devis » tab
     writes in its own column, counted here so the summary can say it. */
  let dejaGroupe = 0;
  /* Its exact mirror: the files no grouped recap has ever carried. Counted on
     the same rows, so the two « dont » lines always add up to the total. */
  let jamaisGroupe = 0;
  /* Files already handed over to a colleague, read from the share marks the
     account keeps: the summary says how many of these very lines circulate.
     La même ventilation que la bande des Offres : un dossier rendu après un
     retrait n'est compté ici que dans la ligne des retours, jamais deux fois. */
  let dejaPartages = 0;
  /* Parmi ces dossiers qui circulent, ceux dont le devis est confirmé : la
     synthèse dit combien de confirmés font partie de ce qui circule. */
  let confirmePartages = 0;
  /* La face opposée, sur les mêmes lignes : les devis déjà confirmés qu'aucune
     adresse n'a encore portés, donc ceux qui restent à confier à un collègue. */
  let confirmeAPartager = 0;
  /* Les marques retirées et celles rendues, comptées sur les mêmes lignes : les
     deux nombres se lisent côte à côte dans la synthèse. */
  let marquesRetirees = 0;
  let marquesRetablies = 0;
  /* La ventilation du lot en trois situations, qui s'additionnent au total :
     partagé, rendu après un retrait, seulement adressé. Le retour l'emporte,
     donc aucune ligne n'est comptée deux fois et les trois nombres font
     exactement le total exporté. */
  let situationPartages = 0;
  let situationRendus = 0;
  let situationAdresses = 0;
  /* Parmi ces dossiers seulement adressés, ceux qui attendent depuis plus d'une
     semaine sans avoir jamais circulé : la Synthèse les nomme, pour repérer ce
     qui dort au lieu de le laisser se fondre dans le total. */
  let adressesEndormies = 0;
  /* Et parmi ces endormis, ceux dont le devis est déjà confirmé : le devis est
     prêt, il n'a simplement jamais circulé. La Synthèse leur donne leur propre
     ligne, juste sous celle des endormis, avec la même adresse copiable. */
  let adressesEndormiesConfirmees = 0;
  /* Et le temps que ces dossiers portent : la somme des jours écoulés depuis
     leur envoi, pour que la Synthèse nomme leur délai moyen et non seulement
     leur nombre. */
  let adressesEndormiesConfirmeesJours = 0;
  /* Et le temps que porte l'attente entière : la somme des jours de tous les
     endormis, pour rapporter la moyenne des confirmés à la leur. */
  let adressesEndormiesJours = 0;

  rows.forEach((row) => {
    /* Un dossier rendu porte de nouveau sa marque de partage : il ne doit donc
       pas être annoncé à la fois comme partagé et comme revenu. */
    const partageSimple =
      Boolean(shared?.[row.reference]) && !restored?.[row.reference];
    if (partageSimple) dejaPartages += 1;
    if (partageSimple && statutDevis(row.statut) === 'confirme') confirmePartages += 1;
    if (!shared?.[row.reference] && statutDevis(row.statut) === 'confirme') confirmeAPartager += 1;
    if (forgotten?.[row.reference]) marquesRetirees += 1;
    if (restored?.[row.reference]) marquesRetablies += 1;
    if (restored?.[row.reference]) situationRendus += 1;
    else if (shared?.[row.reference]) situationPartages += 1;
    else {
      situationAdresses += 1;
      if (ageInDays(row.created_at) > LATE_DAYS) {
        adressesEndormies += 1;
        adressesEndormiesJours += ageInDays(row.created_at);
        if (statutDevis(row.statut) === 'confirme') {
          adressesEndormiesConfirmees += 1;
          adressesEndormiesConfirmeesJours += ageInDays(row.created_at);
        }
      }
    }
    const etat = statutDevis(row.statut);
    parEtat[etat] += 1;
    if (etat === 'recu' && ageInDays(row.created_at) >= LATE_DAYS) enRetard += 1;
    if (row.recap_groupe_at) dejaGroupe += 1;
    else jamaisGroupe += 1;
  });

  const part = (n: number) => (rows.length ? `${Math.round((n / rows.length) * 100)} %` : '0 %');

  /* Le montant cumulé des devis encore endormis, lu sur les mêmes lignes que la
     ligne « dont seulement adressés depuis plus de sept jours » : ce qui dort se
     lit alors aussi en valeur, et chaque devise garde son total. Rien n'est
     écrit quand aucun montant n'est lisible. */
  const endormiesListe = rows.filter(
    (row) =>
      !shared?.[row.reference] &&
      !restored?.[row.reference] &&
      ageInDays(row.created_at) > LATE_DAYS,
  );
  const endormiesMontant = montantCumule(endormiesListe);
  /* Un lot qui mêle plusieurs marchés ne s’additionne jamais : sa répartition
     par devise dit la place que tiennent, en dossiers, ceux de chaque marché.
     Elle ne sert que lorsqu’il y a vraiment plusieurs devises. */
  const endormiesRepartition = repartitionParDevise(endormiesListe);
  /* Le montant des seuls endormis confirmés, lu sur les mêmes lignes : la
     Synthèse le compare à celui de tous les endormis, pour dire quelle part de
     ce qui dort pèse déjà sur un devis tranché. Rien n'est additionné en
     aveugle : chaque devise garde son total. */
  const endormiesConfirmeesListe = endormiesListe.filter(
    (row) => statutDevis(row.statut) === 'confirme',
  );
  const endormiesConfirmeesMontant = montantCumule(endormiesConfirmeesListe);
  /* Et la part déjà prête de chaque marché, quand le lot mêle plusieurs
     devises : parmi les dossiers endormis d'une devise, ceux dont le devis est
     tranché. La feuille lit alors exactement la même répartition que la
     Synthèse de l'écran — chaque marché garde son total, et sa part se rapporte
     à lui, jamais au lot entier. */
  const endormiesConfirmeesParDevise = partPreteParDevise(
    endormiesConfirmeesListe,
    endormiesListe,
  );
  /* Le délai moyen de chaque marché, lu sur les mêmes lignes et la même
     horloge que les compteurs : chaque dossier se range sous sa devise avec la
     clé même de la répartition, donc la moyenne se rapporte au marché qu'elle
     nomme, et jamais au lot entier. Rien ne s'écrit pour un marché dont aucun
     montant n'est lisible. */
  const delaisParDevise = (liste: DevisSheetRow[]) => {
    const map = new Map<string, { somme: number; n: number }>();
    liste.forEach((row) => {
      const devise = deviseDeLigne(row);
      if (!devise) return;
      const garde = map.get(devise) ?? { somme: 0, n: 0 };
      map.set(devise, { somme: garde.somme + ageInDays(row.created_at), n: garde.n + 1 });
    });
    return map;
  };
  const delaiDuMarche = (
    map: Map<string, { somme: number; n: number }>,
    devise: string,
  ): number | null => {
    const garde = map.get(devise);
    if (!garde || garde.n <= 0) return null;
    return Math.round(garde.somme / garde.n);
  };
  const delaisEndormis = delaisParDevise(endormiesListe);
  const delaisConfirmees = delaisParDevise(endormiesConfirmeesListe);
  /* L'ordre des lignes de marché, celui que l'écran porte : par délai moyen
     croissant, le marché qui attend le plus se lit en dernier — un marché sans
     délai lisible garde sa place en fin de rang plutôt que de fausser l'ordre.
     Sans ordre choisi, la répartition garde son ordre de montant. */
  const ordonnerMarches = <T extends { devise: string }>(
    entrees: T[],
    delais: Map<string, { somme: number; n: number }>,
    ordre: DeviseOrdre | undefined,
  ): T[] => {
    if (ordre !== 'delai') return entrees;
    return [...entrees].sort((a, b) => {
      const aJours = delaiDuMarche(delais, a.devise) ?? Number.POSITIVE_INFINITY;
      const bJours = delaiDuMarche(delais, b.devise) ?? Number.POSITIVE_INFINITY;
      if (aJours === bJours) return 0;
      return aJours - bJours;
    });
  };
  const marchesEndormis = ordonnerMarches(
    endormiesRepartition,
    delaisEndormis,
    deviseOrder?.dormant,
  );
  const marchesConfirmes = ordonnerMarches(
    endormiesConfirmeesParDevise,
    delaisConfirmees,
    deviseOrder?.confirmed,
  );
  /* Et la part de ce montant dans l'attente entière : la Synthèse écrit le
     rapport brut, puis le pourcentage qui le résume. Rien n'est écrit quand
     les deux côtés ne parlent pas la même devise, ou qu'un montant manque. */
  const endormiesConfirmeesPart = partMontantCumule(
    endormiesConfirmeesListe,
    endormiesListe,
  );
  const etatLabel = filtre === 'tous' ? t('dv.filterAll') : t(`dv.st.${filtre}`);
  /* La lecture ouverte à l'export, quand ce n'est pas un état : la Synthèse la
     nomme à côté de l'état, donc la feuille emporte la lecture qu'elle a lue —
     un collègue qui l'ouvre plus tard sait qu'elle ne montre que les dossiers
     revenus, et non toute la liste. */
  const readingLabel =
    reading === 'restored'
      ? t('dv.csvReadingRestored')
      : reading === 'shared'
        ? t('dv.csvReadingShared')
        : reading === 'addressed'
          ? t('dv.csvReadingAddressed')
          : reading === 'dormant'
            ? t('dv.csvReadingDormant')
            : reading === 'dormantConfirmed'
              ? t('dv.csvReadingDormantConfirmed')
              : '';

  const synthese: (string | number)[][] = [];
  synthese.push([t('dv.csvSynthTitle')]);
  synthese.push([]);
  synthese.push([t('dv.csvSynthState'), t('dv.csvSynthCount'), t('dv.csvSynthShare')]);
  STATUTS_DEVIS.forEach((etat) => {
    synthese.push([t(`dv.st.${etat}`), parEtat[etat] ?? 0, part(parEtat[etat] ?? 0)]);
  });
  synthese.push([t('dv.csvSynthTotal'), rows.length, part(rows.length)]);
  /* La ventilation en trois situations, juste sous le total : partagé, rendu
     après un retrait, seulement adressé. Les trois lignes s'additionnent au
     total, et leur propre total le redit — aucune ligne n'est comptée deux
     fois, puisque le retour l'emporte sur le partage. */
  synthese.push([
    t('dv.csvSynthSituation'),
    t('dv.csvSynthCount'),
    t('dv.csvSynthShare'),
  ]);
  synthese.push([t('dv.csvShareStateShared'), situationPartages, part(situationPartages)]);
  synthese.push([t('dv.csvShareStateRestored'), situationRendus, part(situationRendus)]);
  synthese.push([t('dv.csvShareStateAddressed'), situationAdresses, part(situationAdresses)]);
  synthese.push([
    t('dv.csvSynthSituationTotal'),
    situationPartages + situationRendus + situationAdresses,
    part(situationPartages + situationRendus + situationAdresses),
  ]);
  /* Juste sous le total des situations, ceux qui dorment : munis de leur adresse
     mais jamais transmis depuis plus de sept jours. Une ligne à part, parce
     qu'un dossier qui attend sans avoir circulé ne se lit pas comme un total —
     et une porte : quand il y en a, la ligne porte l'adresse de la liste
     réduite à ces seuls dossiers, sans refaire les filtres. */
  synthese.push(
    adressesEndormies > 0
      ? [
          t('dv.csvSynthDormant'),
          adressesEndormies,
          part(adressesEndormies),
          `${t('dv.csvDormantList')} : ${devisDormantHref(lang)}`,
        ]
      : [t('dv.csvSynthDormant'), adressesEndormies, part(adressesEndormies)],
  );
  /* Et sous leur compte, le montant cumulé de ces devis avec sa devise : la
     feuille ne dit pas seulement combien dorment, mais ce qu'ils pèsent
     ensemble. Rien n'est ajouté quand aucun montant n'est lisible. */
  if (adressesEndormies > 0 && endormiesMontant) {
    synthese.push([t('dv.csvSynthDormantAmount'), endormiesMontant]);
    /* Et quand le lot mêle plusieurs marchés, chaque devise est nommée sous le
       total : sa part du lot, en dossiers, et ce qu’elle pèse. Une seule
       devise n’a rien à répartir — la ligne du total suffit alors. */
    if (endormiesRepartition.length > 1) {
      /* Le nombre de marchés que ce lot mêle, nommé juste avant sa répartition :
         la feuille dit sur combien de devises elle déroule, et pas seulement
         comment. */
      synthese.push([
        t('dv.csvSynthDormantDevises'),
        t('dv.listDormantDevises').replace(
          '{n}',
          String(endormiesRepartition.length),
        ),
      ]);
      synthese.push([t('dv.csvSynthDormantByDevise')]);
      marchesEndormis.forEach((entry) => {
        const moyenne = delaiDuMarche(delaisEndormis, entry.devise);
        synthese.push([
          t('dv.csvSynthDormantByDeviseLine').replace('{devise}', entry.devise),
          entry.montant,
          /* Chaque marché dit, à côté de sa part de l'attente, combien de devis
             il porte : « 3 devis · 40 % » — le nombre et la place se lisent
             dans le même jeton, sans quitter la ligne de ce marché. */
          /* Et juste après, son délai moyen : le marché ne se lit plus
             seulement en dossiers, mais en temps — lu sur ses seules lignes,
             avec la même horloge que le compteur du lot. Rien n'est ajouté
             quand le marché ne porte aucun délai lisible. */
          `${t('dv.csvSynthDormantByDeviseCount').replace(
            '{n}',
            String(entry.count),
          )} · ${entry.part}${
            moyenne !== null
              ? ` · ${t('dv.listDormantAvg').replace('{n}', String(moyenne))}`
              : ''
          }`,
        ]);
      });
    }
  }
  /* Juste sous la ligne des endormis, ceux dont le devis est déjà confirmé :
     le classeur dit combien ils sont, et porte la même adresse copiable que la
     ligne au-dessus — le collègue ouvre ces seuls dossiers. Rien n'est écrit
     quand aucun endormi n'a de devis tranché. */
  if (adressesEndormiesConfirmees > 0) {
    synthese.push([
      t('dv.csvSynthDormantConfirmed'),
      adressesEndormiesConfirmees,
      part(adressesEndormiesConfirmees),
      `${t('dv.csvDormantConfirmedList')} : ${devisDormantConfirmedHref(lang)}`,
    ]);
    /* Et juste sous ce compte, la comparaison de nombres : combien de ces
       dossiers sur l'ensemble de ceux qui dorment — la même lecture que la
       comparaison de montants, à quelques lignes d'ici. */
    synthese.push([
      t('dv.csvSynthDormantConfirmedCount'),
      t('dv.sumDormantConfirmedCountOf')
        .replace('{a}', String(adressesEndormiesConfirmees))
        .replace('{b}', String(adressesEndormies)),
    ]);
    /* Le délai moyen de ces devis prêts, et celui de tous les endormis, lus
       sur les mêmes lignes : la comparaison de temps se pose sous celle des
       montants, sans qu'aucune des deux moyennes ne se lise seule. */
    const dureeConfirmee = Math.round(
      adressesEndormiesConfirmeesJours / adressesEndormiesConfirmees,
    );
    /* Et sous leur compte, le délai moyen : la feuille ne dit pas seulement
       combien dorment avec un devis déjà prêt, mais depuis combien de temps
       ils attendent en moyenne — la même moyenne que la pastille de l'écran. */
    synthese.push([
      t('dv.csvSynthDormantConfirmedAgoAvg'),
      t('dv.csvRestoredAgoAvg').replace('{n}', String(dureeConfirmee)),
    ]);
    /* Et ce délai-là rapporté à celui de toute l'attente : « 18 j sur 24 j ».
       Rien ne s'écrit quand aucun endormi ne porte de délai lisible. */
    if (adressesEndormies > 0 && adressesEndormiesJours > 0) {
      synthese.push([
        t('dv.csvSynthDormantConfirmedAgoCompare'),
        t('dv.sumDormantConfirmedAvgOf')
          .replace('{a}', String(dureeConfirmee))
          .replace(
            '{b}',
            String(Math.round(adressesEndormiesJours / adressesEndormies)),
          ),
      ]);
    }
    /* Et sous leur délai, ce qu’ils pèsent face à l’attente entière : le montant
       des devis confirmés, rapporté à celui de tous les endormis. La ligne ne
       s’écrit que si les deux montants sont lisibles, pour ne pas comparer un
       chiffre à rien. */
    if (endormiesConfirmeesMontant && endormiesMontant) {
      synthese.push([
        t('dv.csvSynthDormantConfirmedAmount'),
        t('dv.sumDormantConfirmedAmountOf')
          .replace('{a}', endormiesConfirmeesMontant)
          .replace('{b}', endormiesMontant),
      ]);
      /* Et juste dessous, le pourcentage que ce montant représente : la ligne
         du dessus donne le rapport brut, celle-ci la proportion. */
      if (endormiesConfirmeesPart) {
        synthese.push([
          t('dv.csvSynthDormantConfirmedShare'),
          endormiesConfirmeesPart,
        ]);
      }
    }
    /* Et quand ces devis prêts mêlent plusieurs marchés, leur propre bloc de
       répartition : une ligne de titre, puis chaque devise avec ce qu'elle
       pèse et la place de ses dossiers parmi les confirmés. Une seule devise
       n'a rien à répartir — la ligne du montant suffit alors. */
    if (endormiesConfirmeesParDevise.length > 1) {
      /* Le nombre de marchés que ce lot mêle, nommé juste avant sa répartition,
         comme le fait le lot endormi : la feuille dit sur combien de devises
         elle déroule, et pas seulement comment. */
      synthese.push([
        t('dv.csvSynthDormantConfirmedDevises'),
        t('dv.listDormantDevises').replace(
          '{n}',
          String(endormiesConfirmeesParDevise.length),
        ),
      ]);
      synthese.push([t('dv.csvSynthDormantConfirmedByDevise')]);
      marchesConfirmes.forEach((entry) => {
        const moyenne = delaiDuMarche(delaisConfirmees, entry.devise);
        /* Chaque marché dit, dans sa ligne, ce qu'il pèse et la part de ses
           propres dossiers endormis qui est déjà prête — « 2 sur 5 dossiers ·
           40 % » se rapporte à ce marché-là, jamais au lot entier. */
        synthese.push([
          t('dv.csvSynthDormantByDeviseLine').replace('{devise}', entry.devise),
          entry.montant,
          /* Et son délai moyen, à côté de son nombre de devis : les devis déjà
             prêts de ce marché s'attendent depuis combien de temps, en
             moyenne — la même lecture que le bloc des endormis. */
          `${t('dv.sumDormantConfirmedCountOf')
            .replace('{a}', String(entry.prets))
            .replace('{b}', String(entry.total))} · ${entry.part}${
            moyenne !== null
              ? ` · ${t('dv.listDormantAvg').replace('{n}', String(moyenne))}`
              : ''
          }`,
        ]);
      });
    }
  }
  /* Right beside the total: how many of those very files already left as a
     single-dossier address. The day of each share stays in the « Devis » tab. */
  synthese.push([t('dv.csvSynthShared'), dejaPartages, part(dejaPartages)]);
  /* Dans ces dossiers qui circulent, les devis déjà confirmés : la feuille dit
     quelle part de ce qui circule est déjà tranchée. */
  synthese.push([
    t('dv.csvSynthSharedConfirmed'),
    confirmePartages,
    part(confirmePartages),
  ]);
  /* Et juste en dessous, l'autre face du même compte : les confirmés qu'aucune
     adresse n'a encore portés, donc ce qui reste à confier à un collègue. */
  synthese.push([
    t('dv.csvSynthConfirmedToShare'),
    confirmeAPartager,
    part(confirmeAPartager),
  ]);
  /* Le jour du dernier partage du lot exporté, nommé ici : la feuille ne dit
     pas seulement combien de dossiers circulent, mais quand le dernier est
     parti — la même date que la colonne des adresses et que l’en-tête. */
  synthese.push([
    t('dv.csvSynthLastShare'),
    dernierPartage ? dayLabel(dernierPartage) : '—',
  ]);
  /* Les deux traces des marques, l'une à côté de l'autre : ce qui a été retiré,
     puis ce qui a été rétabli — la feuille dit les deux gestes. */
  synthese.push([t('dv.csvSynthForgot'), marquesRetirees, part(marquesRetirees)]);
  synthese.push([t('dv.csvSynthRestored'), marquesRetablies, part(marquesRetablies)]);
  /* Juste sous les deux comptes, le jour du dernier retour : la Synthèse de la
     feuille et la bulle de l'écran donnent la même date. */
  synthese.push([
    t('dv.csvSynthLastRestored'),
    dernierRetour ? dayLabel(dernierRetour) : '—',
  ]);
  /* Et juste sous la date, le délai moyen du lot : la feuille ne dit pas
     seulement quand le dernier est revenu, mais combien de temps ces retours
     portent en moyenne. Rien n'est ajouté quand le lot n'a aucun retour. */
  if (retourMoyen !== null) {
    synthese.push([
      t('dv.csvSynthRestoredAgoAvg'),
      t('dv.csvRestoredAgoAvg').replace('{n}', String(retourMoyen)),
    ]);
  }
  /* Une marque retirée ne reste pas un simple nombre : juste sous le compte, la
     feuille les nomme une par une, avec le jour du partage et celui du
     retrait — la bulle de la liste, écrite noir sur blanc. Rien n'est ajouté
     quand aucune marque du lot n'a été retirée. */
  const marquesNommees = rows.reduce<Array<{ reference: string; trace: ForgottenMark }>>(
    (kept, row) => {
      const trace = forgotten?.[row.reference];
      if (trace) kept.push({ reference: row.reference, trace });
      return kept;
    },
    [],
  );
  if (marquesNommees.length > 0) {
    synthese.push([]);
    synthese.push([
      t('dv.csvSynthForgotRefs').replace('{n}', String(marquesNommees.length)),
    ]);
    synthese.push([t('csv.ref'), t('dv.csvSharedOnCol'), t('dv.csvForgotOnCol')]);
    marquesNommees.forEach(({ reference, trace }) => {
      synthese.push([
        reference,
        dayLabel(trace.sharedAt),
        dayLabel(trace.forgottenAt),
      ]);
    });
  }
  /* Le pendant du bloc des marques retirées : la feuille nomme aussi les
     marques rétablies, une ligne par dossier, avec le jour du partage, celui
     du retour et le délai écoulé depuis ce retour. Rien n'est ajouté quand
     aucune marque du lot n'est revenue. */
  const retablisNommes = rows.reduce<Array<{ reference: string; trace: RestoredMark }>>(
    (kept, row) => {
      const trace = restored?.[row.reference];
      if (trace) kept.push({ reference: row.reference, trace });
      return kept;
    },
    [],
  );
  if (retablisNommes.length > 0) {
    synthese.push([]);
    synthese.push([
      t('dv.csvSynthRestoredRefs').replace('{n}', String(retablisNommes.length)),
    ]);
    synthese.push([
      t('csv.ref'),
      t('dv.csvSharedOnCol'),
      t('dv.csvRestoredOnCol'),
      /* À côté du jour du retour, le temps qu'il porte : la feuille situe
         chaque retour, comme la bulle situe chaque retrait. */
      t('dv.csvRestoredAgoCol'),
    ]);
    retablisNommes.forEach(({ reference, trace }) => {
      synthese.push([
        reference,
        dayLabel(trace.sharedAt),
        dayLabel(trace.restoredAt),
        t('dv.csvRestoredAgo').replace('{n}', String(ageInDays(trace.restoredAt))),
      ]);
    });
  }
  /* Les endormis confirmés ne restent pas un simple nombre : la feuille les
     nomme un par un, une ligne par dossier, avec le jour de l'envoi, le délai
     écoulé et l'adresse qui rouvre la ligne dans la liste. Rien n'est ajouté
     quand aucun dossier endormi n'a de devis tranché. */
  const endormisConfirmesNommes = rows.filter(
    (row) =>
      !shared?.[row.reference] &&
      !restored?.[row.reference] &&
      ageInDays(row.created_at) > LATE_DAYS &&
      statutDevis(row.statut) === 'confirme',
  );
  if (endormisConfirmesNommes.length > 0) {
    synthese.push([]);
    synthese.push([
      t('dv.csvSynthDormantConfirmedRefs').replace(
        '{n}',
        String(endormisConfirmesNommes.length),
      ),
    ]);
    synthese.push([
      t('csv.ref'),
      t('dv.listSentOn'),
      t('dv.csvDays'),
      t('dv.csvLinkCol'),
    ]);
    endormisConfirmesNommes.forEach((row) => {
      synthese.push([
        row.reference,
        row.created_at.slice(0, 10),
        ageInDays(row.created_at),
        adresseDe(row.reference),
      ]);
    });
  }
  synthese.push([t('dv.csvSynthLate'), enRetard, part(enRetard)]);
  /* The second « dont » line: these files already left inside a grouped recap.
     The date itself stays in the « Devis » tab, one column per file. */
  synthese.push([t('dv.csvSynthBulk'), dejaGroupe, part(dejaGroupe)]);
  /* The mirror line: what no group send has ever gathered. Same rows, same
     reading — a file is either carried or not, never both. */
  synthese.push([t('dv.csvSynthBulkNever'), jamaisGroupe, part(jamaisGroupe)]);
  synthese.push([]);
  synthese.push([t('dv.csvSynthNote')]);
  synthese.push([]);
  synthese.push([t('dirCsv.noteTitle')]);
  synthese.push([t('dv.csvFilterLabel'), scopeLabel ?? (late ? `${etatLabel} · ${t('dv.filterLate')}` : etatLabel)]);
  /* Juste après l'état, la lecture qui l'accompagnait : « Rétablies » ou
     « Déjà partagés ». Rien n'est ajouté quand le classeur tient un état seul. */
  if (readingLabel) synthese.push([t('dv.csvReading'), readingLabel]);
  /* Le lien de retour : la feuille ne dit pas seulement quels dossiers sont
     revenus, elle rouvre la liste réduite à eux. Rien n'est écrit quand le lot
     n'a aucun retour — une adresse vers une page vide ne rendrait rien. */
  if (marquesRetablies > 0) {
    synthese.push([t('dv.csvRestoredList'), devisRestoredHref(lang)]);
  }
  synthese.push([t('dv.listTitle'), rows.length]);
  /* L'ordre des lignes du premier onglet est dit ici : une feuille relue plus
     tard sait dans quel sens ses dossiers rendus ont été écrits. Rien n'est
     ajouté quand le lot ne contient aucun retour. */
  if (marquesRetablies > 0) synthese.push([t('dv.csvSortNote')]);
  /* L'ordre des lignes de marché suit celui choisi à l'écran : la feuille le
     dit, pour qu'une lecture plus tard ne prenne pas ce rang pour un ordre de
     montant. Rien n'est ajouté quand les jetons sont restés par montant. */
  if (deviseOrder?.dormant === 'delai' || deviseOrder?.confirmed === 'delai') {
    synthese.push([t('dv.csvDeviseOrder')]);
  }
  synthese.push([t('dirCsv.exportedOn'), dateLabel]);
  synthese.push([t('dv.csvNote')]);

  /* The trace of a group send closes on the files that left, named one by one:
     the same rows as the first tab, but read as the message the reader received
     — reference, plan, market, amount and state, dossier by dossier. */
  if (withRefs) {
    synthese.push([]);
    synthese.push([t('dv.csvSynthRefsTitle').replace('{n}', String(rows.length))]);
    synthese.push([
      t('csv.ref'),
      t('csv.formule'),
      t('dv.marche'),
      t('dv.listTotal'),
      /* La durée retenue se lit juste à côté du montant, comme dans l'onglet
         des lignes : la trace du groupé dit sur quelle longueur chaque
         dossier est parti, sans renvoyer à la formule écrite avant. */
      t('dv.dureeRetenue'),
      t('csv.statut'),
      /* The address of each dossier that left, marked like the first tab when
         it has already been handed over: the trace opens file by file. */
      t('dv.csvLinkCol'),
    ]);
    rows.forEach((row) => {
      synthese.push([
        row.reference,
        row.formule || t('dv.acctTitle'),
        row.marche ?? '',
        row.montant_total || row.montant_mensuel || '',
        row.rythme ?? '',
        t(`dv.st.${statutDevis(row.statut)}`),
        adresseDe(row.reference),
      ]);
    });
  }

  return [
    {
      name: 'Devis',
      rows: devis,
      widths: [5, 20, 24, 13, 18, 17, 17, 20, 14, 13, 12, 11, 16, 20, 26, 52, 24, 44, 44, 18],
    },
    {
      name: 'Synthèse',
      rows: synthese,
      /* La quatrième colonne porte l'adresse des dossiers endormis : elle est
         large assez pour qu'on la lise et la copie sans étirer la cellule. */
      /* La colonne de la durée s'insère entre le montant et l'état : la trace
         garde ses sept colonnes lisibles, largeur comprise. */
      widths: withRefs ? [32, 22, 20, 18, 20, 14, 52] : [38, 30, 18, 46],
    },
  ];
}

/**
 * `PaperAtlas-devis-confirme-2026-11-06.xlsx` — the workbook names its own state,
 * and says so too when it only holds the files left unanswered. A sheet drawn
 * right after a group send names that send instead, so its name can never be
 * mistaken for a state export.
 */
export function devisWorkbookFilename(
  filtre: DevisFiltre,
  late = false,
  group = false,
  reading: 'restored' | 'shared' | 'addressed' | 'dormant' | 'dormantConfirmed' | null = null,
  /* Le montant cumulé de la lecture, quand elle en porte un : le nom du fichier
     le dit avant même qu’il soit ouvert. */
  amount = '',
  /* Et sur combien de marchés ce lot s’étend, posé juste après le montant :
     un cumul ne se prend pas pour un total d’une seule devise quand le nom
     l’annonce déjà. Rien n’est écrit au-delà d’une devise. */
  markets = 0,
  /* Le délai moyen du lot, posé juste après le nombre de marchés : le nom du
     fichier dit, avant d’être ouvert, depuis combien de temps ce lot attend en
     moyenne. Rien n’est écrit quand le lot ne porte aucune moyenne lisible. */
  avgDays: number | null = null,
  /* Le délai moyen du lot auquel celui-ci se rapporte, quand la lecture n'est
     pas ce lot-là — les endormis confirmés, par exemple, rapportés à tout le
     lot endormi. Le nom du fichier pose alors les deux moyennes,
     « 18-j-sur-24-j », et seulement quand elles diffèrent : deux délais égaux
     n'ont rien à comparer. Rien n'est écrit non plus quand l'un des deux
     manque. */
  avgRefDays: number | null = null,
  /* La part de l'attente que ce lot tient, déjà écrite par la Synthèse —
     « 32 % ». Le nom du fichier la pose juste après le délai moyen : le lot
     s'annonce alors par son temps et par son poids. Rien n'est écrit quand la
     Synthèse elle-même n'a rien pu lire. */
  share = '',
  /* Et la part du lot auquel celle-ci se rapporte — celle de tout le lot
     endormi, quand le classeur est celui des endormis confirmés. Le nom pose
     alors les deux parts l'une sur l'autre, « 18-pct-sur-32-pct », et
     seulement quand elles diffèrent : deux parts égales n'ont rien à comparer. */
  shareRef = '',
) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (group) return `PaperAtlas-devis-groupe-${stamp}.xlsx`;
  /* La lecture entre dans le nom : un fichier « restaures » ou « adresses »
     s'annonce comme tel, avant même d'être ouvert. */
  const suffixe =
    reading === 'restored'
      ? 'restaures'
      : reading === 'shared'
        ? 'partages'
        : reading === 'addressed'
          ? 'adresses'
          : reading === 'dormant'
            ? 'endormis'
            : reading === 'dormantConfirmed'
              ? 'endormis-confirmes'
              : '';
  /* Le montant cumulé, réduit à ce qu'un nom de fichier supporte : les espaces
     deviennent des tirets, la devise reste lisible — « 125 000 DZD » s'écrit
     « 125-000-DZD ». Rien n'est ajouté quand aucun montant n'est lisible. */
  const poids = amount
    .replace(/[\s\u202f\u00a0]+/g, ' ')
    .trim()
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .replace(/ +/g, '-');
  const marches = markets > 1 ? `-${markets}-marches` : '';
  /* Le délai moyen du lot, en jours : il suit le nombre de marchés, pour que
     l’attente se lise aussi dans le nom — « …-2-marches-24-j-… ». */
  const dureeSeule =
    avgDays !== null && Number.isFinite(avgDays) && avgDays > 0 ? `-${avgDays}-j` : '';
  /* Et quand le lot se rapporte à un autre lot — les endormis confirmés à tout
     le lot endormi — le nom porte le rapport entier, dès que les deux moyennes
     diffèrent. Deux délais égaux gardent la seule moyenne : rien à comparer. */
  const duree =
    dureeSeule &&
    avgRefDays !== null &&
    Number.isFinite(avgRefDays) &&
    avgRefDays > 0 &&
    avgRefDays !== avgDays
      ? `-${avgDays}-j-sur-${avgRefDays}-j`
      : dureeSeule;
  /* La part de l'attente, réduite à ce qu'un nom de fichier supporte : les
     chiffres gardent leur valeur, le signe devient un mot — « 32 % » s'écrit
     « 32-pct ». Et quand le lot se rapporte à un autre, les deux parts se
     posent l'une sur l'autre, « 18-pct-sur-32-pct », dès qu'elles diffèrent.
     Rien n'est ajouté quand la part n'est pas lisible. */
  const partChiffres = share.replace(/[^\d]/g, '');
  const partRefChiffres = shareRef.replace(/[^\d]/g, '');
  const partAttente = partChiffres
    ? partRefChiffres && partRefChiffres !== partChiffres
      ? `-${partChiffres}-pct-sur-${partRefChiffres}-pct`
      : `-${partChiffres}-pct`
    : '';
  /* L'ordre du nom : l'état, puis ce que le lot pèse et sur combien de
     marchés, puis son délai moyen, puis sa part de l'attente, puis la lecture
     ouverte — juste avant la date, comme un sceau posé sur la dernière ligne. */
  return `PaperAtlas-devis-${filtre}${late ? '-retard' : ''}${
    poids ? `-${poids}` : ''
  }${marches}${duree}${partAttente}${suffixe ? `-${suffixe}` : ''}-${stamp}.xlsx`;
}

export function downloadDevisWorkbook(
  sheets: XlsxSheet[],
  filtre: DevisFiltre,
  late = false,
  group = false,
  reading: 'restored' | 'shared' | 'addressed' | 'dormant' | 'dormantConfirmed' | null = null,
  amount = '',
  markets = 0,
  avgDays: number | null = null,
  /* Le délai moyen du lot de référence, quand ce classeur en rapporte un à
     l'autre : le nom du fichier en garde la comparaison, comme la Synthèse. */
  avgRefDays: number | null = null,
  /* La part de l'attente du lot, posée dans le nom à côté de son délai
     moyen : la feuille s'annonce par son temps et par son poids. */
  share = '',
  /* Et la part du lot de référence, quand le classeur en rapporte un à
     l'autre : le nom garde la comparaison — « 18-pct-sur-32-pct ». */
  shareRef = '',
) {
  saveWorkbook(
    devisWorkbookFilename(
      filtre,
      late,
      group,
      reading,
      amount,
      markets,
      avgDays,
      avgRefDays,
      share,
      shareRef,
    ),
    sheets,
  );
}