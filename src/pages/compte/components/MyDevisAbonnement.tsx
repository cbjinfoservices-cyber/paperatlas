import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { supabase } from '@/lib/supabase';
import { statutDevis } from '@/lib/devis';
import {
  devisAddressedHref,
  devisDormantConfirmedHref,
  devisDormantHref,
  suiviRefHref,
} from '@/lib/b2bLinks';
import {
  deviseDeLigne,
  montantCumule,
  partMontantCumule,
  partPreteParDevise,
  repartitionParDevise,
} from '@/lib/devisMontant';
import { estDevisFiltre, readDevisFiltre, saveDevisFiltre, type DevisFiltre } from '@/lib/devisFiltre';
import { useFacturation } from '@/hooks/useFacturation';
import CsvExportButton from '@/components/feature/CsvExportButton';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { buildDevisWorkbook, downloadDevisWorkbook } from './devisXlsx';
import { markRecall, noteOpened, readOpened, readRecall } from './devisWalkMemory';
import DevisHeadCounts from './DevisHeadCounts';
import DormantDeviseSplit from './DormantDeviseSplit';
import type { DeviseOrdre } from './DormantDeviseSplit';
import {
  bulkKey,
  bulkNeverKey,
  bulkRefsKey,
  saveLastBulk,
  saveLastBulkNever,
  saveLastBulkRefs,
} from './devisBulkMemory';
import {
  dureeOnlyKey,
  groupOnlyKey,
  noteOpenedAt,
  openedAtKey,
  readDureeOnly,
  readGroupOnly,
  readOpenedAt,
  readRestoredOnly,
  readRythmeOnly,
  readSortRecent,
  restoredOnlyKey,
  rythmeOnlyKey,
  saveDureeOnly,
  saveGroupOnly,
  saveRestoredOnly,
  saveSortOpened,
  saveRythmeOnly,
  saveSortRecent,
  sortOpenedKey,
  sortRecentKey,
  readSortOpened,
} from './devisViewMemory';
import {
  clearShares,
  forgetShared,
  markShared,
  readForgotten,
  readRestored,
  readShares,
  restoreForgottenMarks,
  restoreShared,
  shareKey,
  type ForgottenMarks,
  type RestoredMarks,
  type ShareMarks,
} from './devisShareMemory';
import '@/styles/devis.css';

/** One quote as the box reads it back: what was sent, for how much, and where
 *  the dossier stands. */
type DevisEnvoye = {
  reference: string;
  formule: string | null;
  etablissements: number | null;
  marche: string | null;
  devise: string | null;
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

/** The feedback of one resend, kept next to its own line. */
type Note = { ok: boolean; text: string };

const DAY_MS = 24 * 60 * 60 * 1000;
/** A quote still « Reçu » after a full week is worth calling out on its row. */
const LATE_DAYS = 7;
/** Combien de marques la bulle de l'en-tête montre avant de se replier : au-delà
 *  de ce nombre, le reste attend derrière « Voir tout ». */
const MARKS_PREVIEW = 3;
/** La Synthèse déroule davantage avant de se replier : c'est la vue d'ensemble,
 *  elle supporte une dizaine de lignes — pas davantage, sinon la liste entière
 *  se retrouve dans un cadre qui devait tenir en un coup d'œil. */
const MARKS_SUMMARY_PREVIEW = 10;

/** Whole days between the sending and today, never negative. */
function ageInDays(iso: string) {
  const at = new Date(iso).getTime();
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
}

/**
 * Le délai moyen d’un lot, arrondi au jour. Toutes les moyennes de l’écran
 * passent par ici : le lot endormi, ceux qui dorment avec un devis prêt, la
 * liste entière et le classeur lisent donc la même horloge. Vaut null quand le
 * lot est vide — une moyenne sans dossier ne dirait rien.
 */
function moyenneJours(rows: DevisEnvoye[]): number | null {
  if (rows.length === 0) return null;
  const somme = rows.reduce((total, row) => total + ageInDays(row.created_at), 0);
  return Math.round(somme / rows.length);
}

/**
 * « Devis envoyés » — the list that sits next to the B2B requests: every
 * subscription quote composed with this account, its amount, its reference and
 * where it stands. Each line can send its recap again, so a lost e-mail never
 * costs a second composition.
 */
export default function MyDevisAbonnement() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  /* Le rythme retenu sur cet appareil : la liste y rapporte les durées écrites
     dans les dossiers, pour retrouver ceux qui viennent d’un réglage plus
     ancien — la même lecture que le compteur de la bande des Offres. */
  const { facturation } = useFacturation();
  const location = useLocation();
  const navigate = useNavigate();
  /* Which state is being read: the whole list, or one of the four. The last
     reading is kept on the device, so the account reopens where it was left. */
  const [filtre, setFiltre] = useState<DevisFiltre>(readDevisFiltre);
  /* « En retard » is not a state but a shorter reading of the same list: the
     files still received with no answer after a full week. It composes with
     the state chips, and is deliberately not written down — it is an urgency,
     not a place to come back to. */
  const [retard, setRetard] = useState(false);
  /* The third reading, next to the fifth counter: only the files a grouped
     recap has already carried. Its choice is written down per account, like
     the states of the B2B summary, so the next visit opens on the same view. */
  const [groupeSeul, setGroupeSeul] = useState(false);
  /* Its opposite, offered beside it: the files no grouped recap has ever
     carried. The two readings exclude each other — a file cannot be both. */
  const [jamaisSeul, setJamaisSeul] = useState(false);
  /* The fourth reading, offered with the others: only the dossiers already
     handed to a colleague. It combines with the states above, and is not
     written down — it is a look at what circulates, not a place to come back
     to. */
  const [partagesSeul, setPartagesSeul] = useState(false);
  /* Where the group reading is remembered: one memory per account. */
  const groupeMemoryKey = user ? groupOnlyKey(user.id) : '';
  /* Où l'ordre « partagé récemment » est retenu : la bande des Offres lit la
     même mémoire, donc les deux lectures s'ouvrent dans le même ordre. */
  const triMemoryKey = user ? sortRecentKey(user.id) : '';
  /* Où la lecture « rétablies » est retenue, comme celle des devis repris dans
     un groupé : le membre la retrouve à sa prochaine visite. */
  const rendusMemoryKey = user ? restoredOnlyKey(user.id) : '';
  /* Où la lecture « Durée · N mois » est retenue, comme celle des devis repris
     dans un groupé : la prochaine visite rouvre la liste sur ce nombre de
     mois-là, sans avoir à recliquer le jeton d’une ligne. */
  const dureeMemoryKey = user ? dureeOnlyKey(user.id) : '';
  /* Où la lecture « Durées héritées » est retenue, comme celle de la durée
     exacte : la prochaine visite rouvre la liste sur ces dossiers-là. */
  const rythmeMemoryKey = user ? rythmeOnlyKey(user.id) : '';
  const [rows, setRows] = useState<DevisEnvoye[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [notes, setNotes] = useState<Record<string, Note>>({});
  /* Which late files were ticked for the grouped recap, and what the group
     send answered. The ticks only live in the « En retard » reading. */
  const [choisis, setChoisis] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkNote, setBulkNote] = useState<Note | null>(null);
  /* What the last group send carried, kept after the send so the reader can
     take that very trace out of the site, in Excel, before doing anything else. */
  const [bulkTrace, setBulkTrace] = useState<{ at: string; rows: DevisEnvoye[] } | null>(null);
  /* The visit came from an address a colleague handed over: the list says so,
     and says how many quotes are on screen — a reader who did not do the clicks
     must still know what he is looking at. */
  const [shared, setShared] = useState(false);
  /* The reading arrived narrowed to one dossier: a colleague handed over the
     link of a single file, and the list opens on that very line alone. */
  const [refLue, setRefLue] = useState<string | null>(null);
  /* The dossiers already handed over to a colleague, read from the account's
     own memory: the workbook marks their address, so a reader spots at a glance
     which files already circulate outside the site. */
  const [shares, setShares] = useState<ShareMarks>();
  /* Les marques effacées, relues à chaque geste : c'est la trace qui permet de
     remettre une marque avec le jour où le dossier avait été partagé. */
  const [oublies, setOublies] = useState<ForgottenMarks>();
  /* Les marques rendues, tenues à l'écran comme les autres traces : la Synthèse
     du classeur les compte à côté des marques retirées. */
  const [retablis, setRetablis] = useState<RestoredMarks>();
  /* Le tri « partagé récemment » remonte ce qui vient de circuler. C'est un
     ordre, pas un filtre : il est retenu par compte, pour que la bande des
     Offres et la liste s'ouvrent dans le même sens. */
  const [triRecents, setTriRecents] = useState(false);
  /* La dernière ouverture de chaque dossier, gardée par compte : le tri
     « ouverture récente » remonte ce qui a été consulté en dernier, même
     après avoir quitté le site. */
  const [openedAt, setOpenedAt] = useState<Record<string, string>>({});
  const [triOuverts, setTriOuverts] = useState(false);
  const ouvertsMemoryKey = user ? openedAtKey(user.id) : '';
  /* Où l'ordre « ouverture récente » est retenu, comme celui des partages :
     la liste se rouvre dans le sens où elle avait été laissée. */
  const triOuvertsMemoryKey = user ? sortOpenedKey(user.id) : '';
  /* Le compteur du tri peut arriver avec une adresse partagée : le collègue lit
     alors le nombre que l'expéditeur avait sous les yeux, même si son propre
     navigateur ne connaît aucune de ces marques. */
  const [triDuLien, setTriDuLien] = useState<number | null>(null);
  /* Le compteur de l'ordre « ouverture récente » venu d'une adresse partagée,
     tenu à part de celui des partages : chaque ordre lit le sien, jamais
     celui de l'autre. */
  const [triOuvertsDuLien, setTriOuvertsDuLien] = useState<number | null>(null);
  /* The one door that erases those marks: it asks once, so a click never wipes
     a trace the reader did not mean to lose. */
  const [oubliOuvert, setOubliOuvert] = useState(false);
  const [oubliNote, setOubliNote] = useState('');
  /* La bulle de l'en-tête se replie d'elle-même : au-delà de quelques lignes,
     le reste des marques attend derrière « Voir tout », pour que la liste ne
     s'ouvre pas sur un mur de références. */
  const [marquesToutes, setMarquesToutes] = useState(false);
  /* Le même repli pour la Synthèse, mais plus large : dix lignes visibles, le
     reste derrière son propre « Voir tout ». Les deux bulles gardent chacune
     leur état, pour qu'ouvrir l'une ne déplie pas l'autre. */
  const [marquesSyntheseToutes, setMarquesSyntheseToutes] = useState(false);
  /* La date du dernier rétablissement est une porte : un clic ouvre la bulle
     sur les dossiers rendus, chacun avec son jour de retour. Les deux états
     restent séparés de ceux des marques retirées, pour qu'ouvrir l'un ne
     déplie jamais l'autre. */
  const [rendusOuverts, setRendusOuverts] = useState(false);
  const [rendusTous, setRendusTous] = useState(false);
  /* La lecture « rétablies », offerte près de « Déjà partagés » : ne garder
     dans la liste que les dossiers revenus après un retrait. C'est un regard,
     comme la lecture des partages, et les deux ne se cumulent pas. */
  const [rendusSeul, setRendusSeul] = useState(false);
  /* La lecture « seulement adressés », à la suite des deux autres : les
     dossiers munis de leur adresse mais jamais transmis. C'est un regard,
     comme celle des partages, et les trois ne se cumulent jamais. */
  const [adressesSeul, setAdressesSeul] = useState(false);
  /* La lecture des dossiers endormis, juste à côté : seulement adressés, jamais
     transmis, et qui attendent depuis plus d'une semaine. C'est la ligne que la
     Synthèse du classeur nomme, et la porte qu'elle ouvre. */
  const [endormisSeul, setEndormisSeul] = useState(false);
  /* La lecture des endormis confirmés, à la suite de celle des endormis : les
     dossiers qui dorment alors que leur devis est déjà confirmé — le devis est
     prêt, il n'a jamais circulé. C'est la ligne que la Synthèse du classeur
     nomme, et la porte que son adresse ouvre. */
  const [endormisConfirmesSeul, setEndormisConfirmesSeul] = useState(false);
  /* La lecture « sans durée » : les dossiers ouverts avant que la durée retenue
     soit conservée. La bande des Offres en fait une porte — un clic ouvre
     exactement ces lignes-là, donc celles que son compteur annonce. */
  const [sansDureeSeul, setSansDureeSeul] = useState(false);
  /* La lecture des durées héritées, à la suite de celle des dossiers sans
     durée : la durée écrite ne correspond pas au rythme retenu sur cet
     appareil. La bande des Offres en fait une porte — un clic ouvre
     exactement ces lignes-là, donc celles que son compteur annonce. */
  const [rythmeHeriteSeul, setRythmeHeriteSeul] = useState(false);
  /* La durée exacte : le jeton « héritée · 6 mois » d’une ligne est une porte —
     un clic ouvre la liste réduite aux dossiers écrits sur cette durée-là, donc
     sur ce nombre de mois précis. Les lectures ne se cumulent jamais. */
  const [dureeSeule, setDureeSeule] = useState<number | null>(null);
  /* L'ordre des jetons de la répartition, tenu ici plutôt que dans les jetons
     eux-mêmes : le classeur écrit ses lignes de marché dans ce même ordre, donc
     l'écran et la feuille ne peuvent pas se contredire. */
  const [ordreEndormis, setOrdreEndormis] = useState<DeviseOrdre>('montant');
  const [ordreConfirmes, setOrdreConfirmes] = useState<DeviseOrdre>('montant');
  /* La pastille « rétablies » de l'en-tête se replie d'elle-même : au-delà
     d'une dizaine de dossiers rendus, son chevron ouvre la liste des retours,
     dix lignes à la fois, le reste derrière son propre « Voir tout ». */
  const [rendusEnteteOuverts, setRendusEnteteOuverts] = useState(false);
  const [rendusEnteteTous, setRendusEnteteTous] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: failure } = await supabase.functions.invoke('devis-abonnement', {
        body: { action: 'list' },
      });
      if (failure) throw failure;
      const answer = data as { ok?: boolean; devis?: DevisEnvoye[] } | null;
      if (!answer?.ok) throw new Error('list');
      setRows(Array.isArray(answer.devis) ? answer.devis : []);
    } catch {
      setError(t('dv.listError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  /* The account can change on the same screen: the remembered group reading
     follows it rather than staying on the previous member's view. */
  useEffect(() => {
    if (!groupeMemoryKey) return;
    setGroupeSeul(readGroupOnly(groupeMemoryKey));
  }, [groupeMemoryKey]);

  /* The share memory follows the account too, so a colleague's dossier list can
     never be marked by the previous member's sends. */
  useEffect(() => {
    setShares(user ? readShares(shareKey(user.id)) : {});
    setOublies(user ? readForgotten(shareKey(user.id)) : {});
    setRetablis(user ? readRestored(shareKey(user.id)) : {});
    /* L'ordre suit le compte, comme la lecture « repris dans un groupé » : le
       membre retrouve le tri qu'il avait laissé. */
    setTriRecents(user ? readSortRecent(sortRecentKey(user.id)) : false);
    /* Les jours de visite suivent le compte comme les marques : un membre ne
       retrouve jamais les ouvertures du précédent. */
    setOpenedAt(user ? readOpenedAt(openedAtKey(user.id)) : {});
    /* L'ordre de lecture suit le compte, comme celui des partages : le
       membre retrouve le tri qu'il avait laissé. */
    setTriOuverts(user ? readSortOpened(sortOpenedKey(user.id)) : false);
    setOubliOuvert(false);
    setOubliNote('');
    setMarquesToutes(false);
    setMarquesSyntheseToutes(false);
    setRendusOuverts(false);
    setRendusTous(false);
    setRendusEnteteOuverts(false);
    setRendusEnteteTous(false);
    /* Les lectures « seulement adressés » et « endormis » sont des regards :
       elles ne suivent pas le compte, et le changement de membre les relâche. */
    setEndormisSeul(false);
    setEndormisConfirmesSeul(false);
    setSansDureeSeul(false);
    setRythmeHeriteSeul(false);
    setDureeSeule(null);
    /* La lecture « rétablies » est retenue par compte, comme celle des devis
       repris dans un groupé : le membre la retrouve à sa prochaine visite. Une
       adresse partagée garde la main — c'est elle qui annonce la lecture, et
       rien ne l'écrase. */
    const params = new URLSearchParams(location.search);
    const lectureDuLien =
      params.get('restaures') === '1' ||
      params.get('partages') === '1' ||
      params.get('adresses') === '1' ||
      params.get('endormis') === '1' ||
      params.get('endormisConfirmes') === '1' ||
      params.get('sansDuree') === '1' ||
      params.get('rythmeHerite') === '1' ||
      params.get('duree') !== null;
    if (!lectureDuLien) {
      setRendusSeul(user ? readRestoredOnly(restoredOnlyKey(user.id)) : false);
      /* La lecture « Durée · N mois » suit la même mémoire : le membre la
         retrouve telle quelle. Elle ne revient pas quand celle des devis
         repris dans un groupé est déjà ouverte — les lectures ne se cumulent
         jamais. */
      const groupeRappele = user ? readGroupOnly(groupeMemoryKey) : false;
      const dureeRappelee = groupeRappele ? null : readDureeOnly(dureeMemoryKey);
      setDureeSeule(dureeRappelee);
      /* Et la lecture « Durées héritées » se relit de la même façon : elle ne
         revient pas à côté d'une des deux autres, pour que les lectures ne se
         cumulent jamais. */
      const rythmeRappele = user ? readRythmeOnly(rythmeMemoryKey) : false;
      setRythmeHeriteSeul(!groupeRappele && dureeRappelee === null && rythmeRappele);
    }
  }, [user]);

  /* How many dossiers of this account carry a share mark: the door that erases
     them only stands when there is something to erase. */
  const shareCount = Object.keys(shares ?? {}).length;

  /* The dossiers of this very list that already carry a mark: the head of the
     list counts them beside the quotes, and the chip above the rows leads to
     them. Counted on the rows shown, never on the whole memory of the account. */
  /* La même ventilation que la bande des Offres : un dossier rendu après un
     retrait n'est plus annoncé comme « déjà partagé », il a sa pastille à lui.
     Les deux nombres ne se recoupent donc jamais, et les deux écrans annoncent
     exactement les mêmes — celui de l'en-tête et celui de la bande. */
  const partagesCount = rows.filter(
    (row) => Boolean(shares?.[row.reference]) && !retablis?.[row.reference],
  ).length;

  /* Le jour du partage le plus récent de cette liste : l'en-tête le pose à côté
     du compteur, pour savoir quand le dernier dossier est parti sans ouvrir
     une seule ligne. Il parle du même lot que le compteur, donc des seuls
     dossiers jamais rendus. */
  const dernierPartageAt = rows.reduce<string | null>((latest, row) => {
    const at = shares?.[row.reference];
    if (!at || retablis?.[row.reference]) return latest;
    if (!latest) return at;
    return new Date(at).getTime() > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Combien de marques ce compte peut remettre : la trace du retrait est la
     preuve du partage, et le jour qu'elle porte est celui qui revient. */
  const oubliCount = Object.keys(oublies ?? {}).length;

  /* Les marques retirées du compte, la plus récente d'abord : l'en-tête les
     nomme une par une, avec le jour du retrait et le délai écoulé — la même
     lecture que la bulle au-dessus des Offres. */
  const marquesOubliees = Object.entries(oublies ?? {})
    .map(([reference, trace]) => ({ reference, at: trace.forgottenAt }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  /* Ce que la bulle de l'en-tête laisse voir : les marques les plus récentes,
     et le reste seulement sur demande — la Synthèse, elle, les nomme toutes. */
  const marquesPliees = marquesOubliees.length > MARKS_PREVIEW;
  const marquesVisibles =
    marquesPliees && !marquesToutes ? marquesOubliees.slice(0, MARKS_PREVIEW) : marquesOubliees;

  /* La Synthèse se replie plus loin, et pour son propre compte : au-delà d'une
     dizaine de lignes, le reste attend derrière son « Voir tout » à elle. */
  const marquesSynthesePliees = marquesOubliees.length > MARKS_SUMMARY_PREVIEW;
  const marquesSyntheseVisibles =
    marquesSynthesePliees && !marquesSyntheseToutes
      ? marquesOubliees.slice(0, MARKS_SUMMARY_PREVIEW)
      : marquesOubliees;

  /* Ce que les marques ont fait sur ce lot : celles qui sont retirées
     aujourd'hui, celles qui sont revenues, et le total que les deux font —
     c'est ce total qui dit ce qui reste encore à rendre. */
  const retablisCount = Object.keys(retablis ?? {}).length;
  const marquesRetireesLot = oubliCount + retablisCount;

  /* Le jour du dernier retour : la Synthèse le pose à côté de la ligne de
     comparaison, pour savoir quand le dernier dossier a été rendu — sans
     descendre jusqu'aux lignes du classeur. */
  const dernierRetablisAt = Object.values(retablis ?? {}).reduce<string | null>((latest, trace) => {
    const at = trace.restoredAt;
    if (!at) return latest;
    if (!latest) return at;
    return new Date(at).getTime() > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Les dossiers rendus, le plus récent d'abord : la même lecture que les
     marques retirées, mais du côté du retour — la date du dernier
     rétablissement ouvre exactement cette liste. */
  const marquesRendues = Object.entries(retablis ?? {})
    .map(([reference, trace]) => ({ reference, at: trace.restoredAt }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const rendusPlies = marquesRendues.length > MARKS_SUMMARY_PREVIEW;
  const rendusVisibles =
    rendusPlies && !rendusTous ? marquesRendues.slice(0, MARKS_SUMMARY_PREVIEW) : marquesRendues;
  /* Le repli de la pastille de l'en-tête : il ne compte que les dossiers
     rendus de cette liste, donc le nombre du chevron ne promet jamais une
     ligne que la pastille n'annonce pas. */
  const rendusEnteteListe = rows
    .filter((row) => Boolean(retablis?.[row.reference]))
    .map((row) => ({
      reference: row.reference,
      at: retablis?.[row.reference]?.restoredAt ?? '',
    }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const rendusEntetePlies = rendusEnteteListe.length > MARKS_SUMMARY_PREVIEW;
  const rendusEnteteVisibles = rendusEnteteTous
    ? rendusEnteteListe
    : rendusEnteteListe.slice(0, MARKS_SUMMARY_PREVIEW);

  /* Combien de dossiers de cette liste sont revenus après un retrait : le
     compteur de la pastille, et ce qu'elle garde quand on la presse. */
  const rendusCount = rows.filter((row) => Boolean(retablis?.[row.reference])).length;

  /* Le troisième compte de la même ventilation, sur les mêmes lignes : les
     dossiers munis de leur adresse mais jamais transmis à un collègue — ni
     partagés, ni rendus. Les trois nombres ne se recoupent donc jamais. */
  const adressesCount = rows.filter(
    (row) => !shares?.[row.reference] && !retablis?.[row.reference],
  ).length;

  /* Les dossiers dont la durée n'a pas été enregistrée : ouverts avant que la
     durée retenue soit conservée. C'est le compte que la bande des Offres pose
     à côté du dernier devis, et la porte qu'elle ouvre. */
  const sansDureeCount = rows.filter((row) => !row.rythme).length;

  /* Ce que chaque durée enregistrée retient : « Semestre · 6 mois » porte son
     nombre de mois. C’est ce nombre qui se compare au rythme de l’appareil, et
     non le mot de la formule, écrit dans la langue du jour de l’envoi. */
  const moisDuRythme = (rythme: string | null): number | null => {
    if (!rythme) return null;
    const trouve = rythme.match(/(\d+)/);
    if (!trouve) return null;
    const mois = Number(trouve[1]);
    return Number.isFinite(mois) && mois > 0 ? mois : null;
  };
  const moisRetenus = facturation === 'annee' ? 12 : 1;
  const estRythmeHerite = (row: DevisEnvoye) => {
    const mois = moisDuRythme(row.rythme);
    return mois !== null && mois !== moisRetenus;
  };
  const rythmeHeriteCount = rows.filter(estRythmeHerite).length;
  const rythmeRetenuLabel =
    facturation === 'annee' ? t('ofj.rythmeAnnee') : t('ofj.rythmeMois');

  /* Les dossiers écrits sur la durée exacte qu’une ligne vient de désigner :
     le compteur de la pastille, et ce qu’elle garde quand on la presse. */
  const dureeCount =
    dureeSeule !== null
      ? rows.filter((row) => moisDuRythme(row.rythme) === dureeSeule).length
      : 0;

  /* Le jour du dernier dossier resté seulement adressé : celui de son entrée
     dans le lot, puisque son adresse n'a jamais été confiée à personne. La
     pastille de l'en-tête le pose à côté de son compteur. */
  const dernierAdresseAt = rows.reduce<string | null>((latest, row) => {
    if (shares?.[row.reference] || retablis?.[row.reference]) return latest;
    const at = row.created_at;
    if (!at) return latest;
    if (!latest) return at;
    return new Date(at).getTime() > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Ceux qui dorment : jamais transmis, jamais revenus, et en attente depuis
     plus d'une semaine. C'est la ligne que la Synthèse du classeur nomme, et
     que la pastille de l'en-tête sait envoyer par son adresse. */
  const estEndormi = (row: DevisEnvoye) =>
    !shares?.[row.reference] &&
    !retablis?.[row.reference] &&
    ageInDays(row.created_at) > LATE_DAYS;
  const endormisCount = rows.filter(estEndormi).length;

  /* Le plus ancien des dossiers qui dorment : la date à laquelle l'attente la
     plus longue a commencé. La pastille de l'en-tête la pose à côté du lien
     copié, pour savoir d'un coup d'œil depuis quand cela dort. */
  const endormisOldestAt = rows.reduce<string | null>((oldest, row) => {
    if (!estEndormi(row)) return oldest;
    if (!oldest) return row.created_at;
    return new Date(row.created_at).getTime() < new Date(oldest).getTime()
      ? row.created_at
      : oldest;
  }, null);

  /* Parmi les dossiers qui dorment, ceux dont le devis est déjà confirmé : la
     Synthèse nomme ce nombre à côté du total, parce que ce sont eux qui
     attendent peut-être le plus — le devis est prêt, il n'a jamais circulé. */
  const endormisConfirmesListe = rows.filter(
    (row) => estEndormi(row) && statutDevis(row.statut) === 'confirme',
  );
  const endormisConfirmes = endormisConfirmesListe.length;

  /* Le montant cumulé de ces devis-là, à côté de leur compteur : parmi ceux qui
     dorment, ce que pèsent les devis déjà prêts — lu sur les lignes elles-mêmes,
     jamais sur une estimation. Rien n'est écrit quand aucun montant n'est lisible. */
  const endormisConfirmesMontant = montantCumule(endormisConfirmesListe);

  /* Le montant cumulé des devis encore endormis : posé à côté du compteur,
     dans l'en-tête comme dans la Synthèse, pour que ce qui dort se lise aussi
     en valeur. Rien n'est écrit quand aucun montant n'est lisible. */
  const endormisListe = rows.filter(estEndormi);
  const endormisMontant = montantCumule(endormisListe);

  /* Et la place que ces devis tiennent dans l'ensemble : le pourcentage de
     l'attente qu'ils représentent, rapporté au total des devis. Il ne s'écrit
     que si les deux côtés parlent d'une seule et même devise. */
  const endormisPart = partMontantCumule(endormisListe, rows);

  /* Et la répartition par devise, quand la lecture mêle plusieurs marchés : la
     Synthèse à l'écran la dit comme le classeur, chaque devise gardant son
     total — un dinar ne s'additionne jamais à un euro. Une seule devise n'a
     rien à répartir, donc rien ne s'écrit. */
  const endormisRepartition = repartitionParDevise(endormisListe);

  /* Et la part déjà prête de chaque marché, sous la ligne des endormis
     confirmés : parmi les dossiers endormis d'une devise, ceux dont le devis
     est tranché. La part se rapporte à ce marché-là, jamais au lot entier —
     un marché de deux devis dont un est prêt n'est pas prêt à 5 %. */
  const endormisConfirmesParDevise = partPreteParDevise(
    endormisConfirmesListe,
    endormisListe,
  );

  /* Et la part que les confirmés représentent dans cette attente : le rapport
     brut dit « 40 000 DZD sur 125 000 DZD », le pourcentage dit « 32 % » — la
     proportion se lit sans faire la division. Rien n'est écrit quand les deux
     côtés ne parlent pas de la même devise, ou qu'un montant manque. */
  const endormisConfirmesPart = partMontantCumule(endormisConfirmesListe, endormisListe);

  /* Et la part des confirmés rapportée à toute la liste de devis, et non au
     seul lot endormi : c'est l'échelle sur laquelle la bande des Offres
     compare déjà les deux parts — « 18 % sur 32 % ». Les deux pourcentages
     parlent du même ensemble de devis, donc ils se comparent vraiment. Rien
     ne s'écrit quand l'un des deux côtés ne parle pas d'une seule devise. */
  const endormisConfirmesPartListe = partMontantCumule(endormisConfirmesListe, rows);

  /* Et leur délai moyen, rapporté à celui de toute l'attente : la même
     comparaison que les montants, mais en jours. Les deux moyennes se lisent
     sur les mêmes lignes et sur la même horloge — un dossier endormi n'entre
     dans la seconde que s'il attend depuis plus d'une semaine. Rien ne s'écrit
     quand aucun des deux côtés n'a de dossier. */
  const endormisMoyenne =
    endormisCount > 0
      ? Math.round(
          endormisListe.reduce((total, row) => total + ageInDays(row.created_at), 0) /
            endormisCount,
        )
      : null;
  const endormisConfirmesMoyenne =
    endormisConfirmes > 0
      ? Math.round(
          endormisConfirmesListe.reduce(
            (total, row) => total + ageInDays(row.created_at),
            0,
          ) / endormisConfirmes,
        )
      : null;

  /* Et le délai moyen de toute la liste : il sert de second terme à la
     comparaison des délais dans la Synthèse, à côté de celui du lot endormi —
     les deux moyennes se lisent sur les mêmes lignes et la même horloge. */
  const listeMoyenne = moyenneJours(rows);

  /* Le délai moyen de chaque marché, lu sur les lignes de ce marché-là
     seulement : la clé est celle de la répartition, donc la moyenne se rapporte
     bien au marché qu'elle nomme, jamais au lot entier. Rien ne s'écrit pour un
     marché dont aucun montant n'est lisible. */
  const delaisParDevise = (liste: DevisEnvoye[]) => {
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
  const delaisEndormis = delaisParDevise(endormisListe);
  const delaisConfirmes = delaisParDevise(endormisConfirmesListe);

  /* Le marché qui attend le plus longtemps, parmi ceux que la répartition
     déroule : la Synthèse le nomme à côté de leur nombre, pour que l'attente la
     plus longue se repère sans lire chaque jeton. La moyenne est celle du
     marché seul, avec la même horloge que les autres. Rien n'est écrit quand
     aucun marché ne porte de délai lisible. */
  const marcheLePlusLong = (
    devises: string[],
    delais: Map<string, { somme: number; n: number }>,
  ): { devise: string; jours: number } | null => {
    let plusLong: { devise: string; jours: number } | null = null;
    for (const devise of devises) {
      const jours = delaiDuMarche(delais, devise);
      if (jours === null) continue;
      if (!plusLong || jours > plusLong.jours) plusLong = { devise, jours };
    }
    return plusLong;
  };
  const marcheEndormiPlusLong = marcheLePlusLong(
    endormisRepartition.map((entry) => entry.devise),
    delaisEndormis,
  );
  const marcheConfirmePlusLong = marcheLePlusLong(
    endormisConfirmesParDevise.map((entry) => entry.devise),
    delaisConfirmes,
  );

  /* Le délai moyen depuis le retour, sur ces mêmes lignes : la pastille des
     rétablissements dit combien de temps ces retours portent en moyenne, à
     côté du jour du dernier d'entre eux. Rien n'est écrit quand rien n'est
     revenu — une moyenne sans dossier ne dirait rien. */
  const retoursSomme = rows.reduce((total, row) => {
    const at = retablis?.[row.reference]?.restoredAt;
    if (!at) return total;
    const stamp = new Date(at).getTime();
    if (!Number.isFinite(stamp)) return total;
    return total + ageInDays(at);
  }, 0);
  const retourMoyen = rendusCount > 0 ? Math.round(retoursSomme / rendusCount) : null;

  /* Forgetting the marks of this account, and nothing else: the chosen state,
     the group reading and the rest of the settings stay where they are. */
  const oublierLesPartages = () => {
    if (!user) return;
    setShares(clearShares(shareKey(user.id)));
    setOublies(readForgotten(shareKey(user.id)));
    setRetablis(readRestored(shareKey(user.id)));
    setPartagesSeul(false);
    /* Plus rien n'est rétabli : la lecture qui ne gardait que les dossiers
       rendus n'a plus rien à montrer, et sa mémoire s'efface avec elle. */
    setRendusSeul(false);
    if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    /* Plus rien ne circule : le tri qui remonte les partages n'a plus rien à
       remonter, il s'efface avec les marques — et sa mémoire aussi. */
    setTriRecents(false);
    if (triMemoryKey) saveSortRecent(triMemoryKey, false);
    setOubliOuvert(false);
    setOubliNote(t('dv.forgetSharesOk'));
  };

  /* Forgetting the mark of one dossier, and nothing else: the other dossiers
     keep their day, and the account's other settings stay where they are. */
  const oublierUnPartage = (reference: string) => {
    if (!user) return;
    const key = shareKey(user.id);
    const next = forgetShared(key, reference);
    setShares(next);
    setOublies(readForgotten(key));
    setRetablis(readRestored(key));
    /* Le dernier dossier marqué vient de partir : le tri n'a plus de quoi
       trier, et le filtre restant ne doit pas laisser une page vide. */
    if (Object.keys(next).length === 0) {
      setPartagesSeul(false);
      setTriRecents(false);
      if (triMemoryKey) saveSortRecent(triMemoryKey, false);
    }
    setOubliOuvert(false);
    setOubliNote('');
    setNotes((prev) => ({
      ...prev,
      [reference]: { ok: true, text: t('dv.rowForgetShareOk') },
    }));
  };

  /* Remettre une marque effacée, avec le jour où le dossier avait été partagé —
     jamais celui du jour. La trace du retrait s'efface avec la marque qu'elle
     rend : un dossier ne peut pas être à la fois partagé et oublié. */
  const restaurerUnPartage = (reference: string) => {
    if (!user) return;
    const key = shareKey(user.id);
    setShares(restoreShared(key, reference));
    setOublies(readForgotten(key));
    setRetablis(readRestored(key));
    setOubliNote('');
    setNotes((prev) => ({
      ...prev,
      [reference]: { ok: true, text: t('dv.rowRestoreShareOk') },
    }));
  };

  /* Toutes les marques effacées d'un coup, chacune à sa date d'origine : le
     classeur retrouve les jours qu'il avait inscrits. */
  const restaurerLesPartages = () => {
    if (!user) return;
    const key = shareKey(user.id);
    setShares(restoreForgottenMarks(key));
    setOublies(readForgotten(key));
    setRetablis(readRestored(key));
    setOubliNote('');
    setOubliOuvert(false);
  };

  /* Choosing a state writes it down: the next visit opens on that same slice,
     and the strip on « Offres » reads that choice too. */
  const choisir = (next: DevisFiltre) => {
    setFiltre(next);
    saveDevisFiltre(next);
    setChoisis([]);
    setBulkNote(null);
  };

  /* « En retard » is a reading, not a place to come back to: the counter at
     the head of the list and the chip above the rows drive that same flag. */
  const basculerRetard = () => {
    setRetard((prev) => !prev);
    setChoisis([]);
    setBulkNote(null);
  };

  /* Relâcher la lecture d’une durée efface aussi sa mémoire : ouvrir une autre
     lecture ne doit pas la voir revenir seule à la prochaine visite. */
  const relacherDuree = () => {
    setDureeSeule(null);
    if (dureeMemoryKey) saveDureeOnly(dureeMemoryKey, null);
  };

  /* The group reading is a place to come back to: its choice is written down
     under the account, and it clears its opposite — a file is never both. */
  const basculerGroupe = () => {
    const next = !groupeSeul;
    setGroupeSeul(next);
    if (next) {
      setJamaisSeul(false);
      relacherDuree();
      /* Le groupé referme aussi la lecture des durées héritées : deux lectures
         ne se cumulent jamais, et celle qui se referme quitte sa mémoire. */
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
    }
    if (groupeMemoryKey) saveGroupOnly(groupeMemoryKey, next);
    setChoisis([]);
    setBulkNote(null);
  };

  /* The reading on the dossiers already handed over: a look, offered beside
     the states, that never touches the saved reading of the list. */
  const basculerPartages = () => {
    const next = !partagesSeul;
    setPartagesSeul(next);
    /* Un dossier rétabli porte aussi une marque : les deux lectures se
       ressembleraient trop. Ouvrir l'une referme l'autre — et la mémoire de
       la lecture « rétablies », elle aussi, pour qu'elle ne revienne pas
       seule à la prochaine visite. */
    if (next) {
      setRendusSeul(false);
      setAdressesSeul(false);
      setEndormisSeul(false);
      setEndormisConfirmesSeul(false);
      setSansDureeSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      relacherDuree();
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture « rétablies » : les dossiers revenus après un retrait, et rien
     d'autre. Même geste que la précédente — un clic la garde seule, un second
     la relâche. Comme celle des devis repris dans un groupé, elle est écrite
     sous le compte : la prochaine visite s'ouvrira dessus. */
  const basculerRendus = () => {
    const next = !rendusSeul;
    setRendusSeul(next);
    if (next) {
      setPartagesSeul(false);
      setAdressesSeul(false);
      setEndormisSeul(false);
      setEndormisConfirmesSeul(false);
      setSansDureeSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      relacherDuree();
    }
    if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, next);
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture « seulement adressés » : les dossiers qui n'ont jamais circulé et
     ne sont pas revenus. Même geste que les deux autres — un clic la garde
     seule, un second la relâche. Comme celle des partages, elle n'est pas
     écrite sous le compte : c'est un regard, pas un endroit où revenir. */
  const basculerAdresses = () => {
    const next = !adressesSeul;
    setAdressesSeul(next);
    if (next) {
      setPartagesSeul(false);
      setRendusSeul(false);
      setEndormisSeul(false);
      setEndormisConfirmesSeul(false);
      setSansDureeSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      relacherDuree();
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture des dossiers endormis : seulement adressés depuis plus d'une
     semaine. Même geste que les trois autres — un clic la garde seule, un
     second la relâche — et, comme elles, elle ne s'écrit pas sous le compte. */
  const basculerEndormis = () => {
    const next = !endormisSeul;
    setEndormisSeul(next);
    if (next) {
      setPartagesSeul(false);
      setRendusSeul(false);
      setAdressesSeul(false);
      setEndormisConfirmesSeul(false);
      setSansDureeSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      relacherDuree();
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture des endormis confirmés : les dossiers qui dorment alors que leur
     devis est déjà confirmé. Même geste que les autres — un clic la garde seule,
     un second la relâche — et, comme elles, elle ne s'écrit pas sous le compte. */
  const basculerEndormisConfirmes = () => {
    const next = !endormisConfirmesSeul;
    setEndormisConfirmesSeul(next);
    if (next) {
      setPartagesSeul(false);
      setRendusSeul(false);
      setAdressesSeul(false);
      setEndormisSeul(false);
      setSansDureeSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      relacherDuree();
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture des dossiers sans durée : ceux ouverts avant que la durée
     retenue soit conservée. Même geste que les autres — un clic la garde seule,
     un second la relâche — et, comme elles, elle ne s'écrit pas sous le compte. */
  const basculerSansDuree = () => {
    const next = !sansDureeSeul;
    setSansDureeSeul(next);
    if (next) {
      setPartagesSeul(false);
      setRendusSeul(false);
      setAdressesSeul(false);
      setEndormisSeul(false);
      setEndormisConfirmesSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      relacherDuree();
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture des durées héritées : les dossiers dont la durée écrite ne
     correspond pas au rythme retenu sur cet appareil. Même geste que les
     autres — un clic la garde seule, un second la relâche — et, comme elles,
     elle ne s’écrit pas sous le compte. */
  const basculerRythmeHerite = () => {
    const next = !rythmeHeriteSeul;
    setRythmeHeriteSeul(next);
    /* La lecture est retenue par compte, comme celle de la durée exacte : la
       prochaine visite rouvre la liste sur ces dossiers-là. Un second clic la
       relâche, et sa mémoire avec elle. */
    if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, next);
    if (next) {
      setPartagesSeul(false);
      setRendusSeul(false);
      setAdressesSeul(false);
      setEndormisSeul(false);
      setEndormisConfirmesSeul(false);
      setSansDureeSeul(false);
      relacherDuree();
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* La lecture d’une durée exacte : le jeton « héritée · 6 mois » d’une ligne
     ouvre la liste réduite aux dossiers écrits sur cette durée-là. Même geste
     que les autres lectures — un clic la garde seule, un second la relâche —
     et, comme elles, elle ne s’écrit pas sous le compte. */
  const basculerDuree = (mois: number) => {
    const next = dureeSeule === mois ? null : mois;
    setDureeSeule(next);
    /* La durée exacte est retenue par compte, comme les devis repris dans un
       groupé : la prochaine visite rouvre la liste sur ce nombre de mois-là.
       Un second clic la relâche, et sa mémoire avec elle. */
    if (dureeMemoryKey) saveDureeOnly(dureeMemoryKey, next);
    if (next !== null) {
      /* Les lectures ne se cumulent jamais : le groupé refermé quitte aussi sa
         mémoire, pour ne pas revenir à côté de celle-ci. */
      if (groupeMemoryKey) saveGroupOnly(groupeMemoryKey, false);
      setPartagesSeul(false);
      setRendusSeul(false);
      setAdressesSeul(false);
      setEndormisSeul(false);
      setEndormisConfirmesSeul(false);
      setSansDureeSeul(false);
      setRythmeHeriteSeul(false);
      if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
      setGroupeSeul(false);
      setJamaisSeul(false);
      setRetard(false);
      if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    }
    setChoisis([]);
    setBulkNote(null);
  };

  /* Le tri « partagé récemment » est un simple ordre de lecture : un second clic
     rend la liste à son ordre habituel, sans rien oublier de ses marques. */
  const basculerTriRecents = () => {
    const next = !triRecents;
    setTriRecents(next);
    /* Les deux ordres ne se cumulent jamais : ouvrir l'un referme l'autre —
       et l'ordre refermé quitte aussi sa mémoire de compte. */
    if (next) {
      setTriOuverts(false);
      if (triOuvertsMemoryKey) saveSortOpened(triOuvertsMemoryKey, false);
    }
    /* L'ordre est retenu par compte : la bande des Offres ouvrira ses portes
       dans le même sens que cette liste. */
    if (triMemoryKey) saveSortRecent(triMemoryKey, next);
    setChoisis([]);
    setBulkNote(null);
  };

  /* L'ordre « ouverture récente » : les dossiers consultés en dernier d'abord.
     C'est un ordre de lecture, pas un filtre — un second clic rend la liste à
     son ordre habituel, sans rien oublier des jours de visite. */
  const basculerTriOuverts = () => {
    const next = !triOuverts;
    setTriOuverts(next);
    if (next) {
      setTriRecents(false);
      if (triMemoryKey) saveSortRecent(triMemoryKey, false);
    }
    /* L'ordre est écrit sous le compte, comme celui des partages : la
       prochaine visite s'ouvrira sur le même sens de lecture. */
    if (triOuvertsMemoryKey) saveSortOpened(triOuvertsMemoryKey, next);
    setChoisis([]);
    setBulkNote(null);
  };

  /* The opposite reading is not written down: it is a look at what no send has
     ever gathered, not a place to come back to. Turning it on drops the group
     one and its memory, so the two can never fight — and it also opens the
     group send of the late files no recap has ever carried: the counter is a
     door to the message, not only to a filtered page. */
  const basculerJamais = () => {
    const next = !jamaisSeul;
    setJamaisSeul(next);
    if (next) relacherDuree();
    setBulkNote(null);
    if (!next) {
      setRetard(false);
      setChoisis([]);
      return;
    }
    setGroupeSeul(false);
    if (groupeMemoryKey) saveGroupOnly(groupeMemoryKey, false);
    /* Only the late ones can leave in a grouped recap: the others are still
       inside their first week, and nothing is urgent about them yet. */
    const jamaisEnRetard = rows.filter(
      (row) =>
        statutDevis(row.statut) === 'recu' &&
        ageInDays(row.created_at) >= LATE_DAYS &&
        !row.recap_groupe_at,
    );
    if (jamaisEnRetard.length > 0) {
      /* The send bar only stands in the « En retard » reading: the counter puts
         the list there, with those very files already ticked. */
      setRetard(true);
      setChoisis(jamaisEnRetard.map((row) => row.reference));
    } else {
      setChoisis([]);
    }
  };

  const day = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(date);
  };

  /* The recap of one file leaves again, read from what was stored: the amount
     on screen and the amount in the mail can never disagree. */
  const renvoyer = async (reference: string) => {
    setBusy(reference);
    setNotes((prev) => {
      const next = { ...prev };
      delete next[reference];
      return next;
    });
    try {
      const { data, error: failure } = await supabase.functions.invoke('devis-abonnement', {
        body: { action: 'resend', reference },
      });
      const answer = data as { ok?: boolean; emailed?: boolean } | null;
      if (failure || !answer?.ok || !answer.emailed) {
        setNotes((prev) => ({ ...prev, [reference]: { ok: false, text: t('dv.resendErr') } }));
        return;
      }
      setNotes((prev) => ({ ...prev, [reference]: { ok: true, text: t('dv.resendOk') } }));
    } catch {
      setNotes((prev) => ({ ...prev, [reference]: { ok: false, text: t('dv.resendErr') } }));
    } finally {
      setBusy('');
    }
  };

  /* The head of the list says where the account stands before any line is
     read: how many quotes were received, how many are under review, how many
     are confirmed. Counted from the very rows shown below, never elsewhere. */
  const tally = { recu: 0, en_etude: 0, confirme: 0, expire: 0 };
  rows.forEach((row) => {
    const etat = statutDevis(row.statut);
    if (etat === 'recu' || etat === 'en_etude' || etat === 'confirme' || etat === 'expire') {
      tally[etat] += 1;
    }
  });

  /* The filter never recounts anything: it only picks which of the rows below
     are shown, so a chip and the line it leads to can never disagree. */
  const estEnRetard = (row: DevisEnvoye) =>
    statutDevis(row.statut) === 'recu' && ageInDays(row.created_at) >= LATE_DAYS;
  const enRetard = rows.filter(estEnRetard);
  /* The last grouped recap that carried files of this list, read from the very
     dates the row badges show — the summary says it before any line is read. */
  const dernierGroupeAt = rows.reduce<string | null>((latest, row) => {
    if (!row.recap_groupe_at) return latest;
    if (!latest) return row.recap_groupe_at;
    const stamp = new Date(row.recap_groupe_at).getTime();
    const kept = new Date(latest).getTime();
    if (!Number.isFinite(stamp)) return latest;
    return stamp > kept ? row.recap_groupe_at : latest;
  }, null);
  /* How many files that very send carried: two sends on one day count as one,
     so the line never adds up two different group recaps. */
  const groupeLeMemeJour = dernierGroupeAt
    ? new Date(dernierGroupeAt).toDateString()
    : '';
  const groupeCount = dernierGroupeAt
    ? rows.filter(
        (row) =>
          row.recap_groupe_at &&
          new Date(row.recap_groupe_at).toDateString() === groupeLeMemeJour,
      ).length
    : 0;
  /* The very files that send carried, each with the day it left: written down
     for the B2B workbook, which names them one by one under the line of the
     last group send instead of only counting them. */
  const groupeRefs = dernierGroupeAt
    ? rows
        .filter(
          (row) =>
            row.recap_groupe_at &&
            new Date(row.recap_groupe_at).toDateString() === groupeLeMemeJour,
        )
        .map((row) => ({ reference: row.reference, at: row.recap_groupe_at as string }))
    : [];
  /* Files a grouped recap has already carried: the seventh counter of the head
     is their count, and pressing it keeps them alone. */
  const groupes = rows.filter((row) => Boolean(row.recap_groupe_at));
  /* Its exact opposite: the files no grouped recap has ever carried. Counted
     on the very same rows, so the two readings always add up to the list. */
  const jamais = rows.filter((row) => !row.recap_groupe_at);

  /* A remembered reading that no longer has anything to show falls back on the
     whole list, rather than leaving the member in front of an empty page. */
  useEffect(() => {
    if (loading || error || !groupeSeul || groupes.length > 0) return;
    setGroupeSeul(false);
    if (groupeMemoryKey) saveGroupOnly(groupeMemoryKey, false);
  }, [loading, error, groupeSeul, groupes.length, groupeMemoryKey]);

  /* Une lecture « rétablies » retenue qui n'a plus rien à montrer revient à la
     liste entière, plutôt que de laisser le membre devant une page vide — et sa
     mémoire s'efface, comme celle du groupé. */
  useEffect(() => {
    /* Une lecture arrivée par un lien garde la main : c'est l'expéditeur qui a
       choisi ce qu'elle montre, pas la mémoire de ce navigateur. */
    if (loading || error || shared || !rendusSeul || rendusCount > 0) return;
    setRendusSeul(false);
    if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
  }, [loading, error, shared, rendusSeul, rendusCount, rendusMemoryKey]);

  /* Une lecture « Durée · N mois » retenue qui n’a plus rien à montrer revient
     à la liste entière, plutôt que de laisser le membre devant une page vide —
     et sa mémoire s’efface, comme celle du groupé. Une lecture arrivée par un
     lien garde la main : c’est l’expéditeur qui a choisi ce qu’elle montre. */
  useEffect(() => {
    if (loading || error || shared || dureeSeule === null) return;
    if (dureeCount > 0) return;
    setDureeSeule(null);
    if (dureeMemoryKey) saveDureeOnly(dureeMemoryKey, null);
  }, [loading, error, shared, dureeSeule, dureeCount, dureeMemoryKey]);

  /* Une lecture « Durées héritées » retenue qui n’a plus rien à montrer revient
     à la liste entière, plutôt que de laisser le membre devant une page vide —
     et sa mémoire s’efface, comme celle de la durée exacte. Une lecture arrivée
     par un lien garde la main. */
  useEffect(() => {
    if (loading || error || shared || !rythmeHeriteSeul) return;
    if (rythmeHeriteCount > 0) return;
    setRythmeHeriteSeul(false);
    if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
  }, [loading, error, shared, rythmeHeriteSeul, rythmeHeriteCount, rythmeMemoryKey]);

  /* Two doors hand a reading over by link: `?devis=jamais` on the files no
     grouped recap has ever carried (the late ones come up already ticked, the
     send bar standing), `?devis=groupe` on the ones a recap has carried. The
     shared address also keeps the state and the late reading, so a colleague
     lands exactly where the reader was. The order leaves the address at once,
     so a reload never re-imposes it. */
  useEffect(() => {
    if (loading || error) return;
    const params = new URLSearchParams(location.search);
    const lecture = params.get('devis');
    const etatParam = params.get('etat');
    const refParam = params.get('ref');
    const retardParam = params.get('retard') === '1';
    /* La lecture « déjà partagés » voyage aussi avec le lien : le collègue
       arrive directement sur les dossiers qui circulent. */
    const partagesParam = params.get('partages') === '1';
    /* La lecture « seulement adressés » voyage aussi avec l'adresse : le
       collègue tombe sur les dossiers qui n'ont jamais circulé. */
    const adressesParam = params.get('adresses') === '1';
    /* La lecture des dossiers endormis voyage de la même façon : la ligne du
       classeur et la pastille de l'en-tête ouvrent ces seuls dossiers. */
    const endormisParam = params.get('endormis') === '1';
    /* La lecture des endormis confirmés voyage de la même façon : la ligne du
       classeur l'ouvre sur ces seuls dossiers. */
    const endormisConfirmesParam = params.get('endormisConfirmes') === '1';
    /* La lecture « sans durée » voyage aussi : la porte de la bande ouvre
       exactement ces dossiers-là. */
    const sansDureeParam = params.get('sansDuree') === '1';
    /* La lecture des durées héritées voyage de la même façon : le compteur de
       la bande ouvre exactement ces dossiers-là. */
    const rythmeHeriteParam = params.get('rythmeHerite') === '1';
    /* La lecture d’une durée exacte : le jeton d’une ligne l’ouvre, et son
       adresse l’emporte — le collègue ouvre les dossiers écrits sur ce nombre
       de mois-là. */
    const dureeParam = Number(params.get('duree'));
    const dureeLue =
      Number.isFinite(dureeParam) && dureeParam > 0 ? Math.round(dureeParam) : null;
    /* L'ordre « partagé récemment » voyage aussi : la liste s'ouvre triée.
       L'ordre « ouverture récente » prend la même adresse, avec son mot. */
    const triParam = params.get('tri');
    const triRecentsParam = triParam === 'recents';
    const triOuvertsParam = triParam === 'ouverts';
    /* Le repli de la Synthèse voyage avec l'adresse : celui qui l'ouvre voit
       la bulle ouverte ou fermée comme l'expéditeur la lisait. */
    const marquesParam = params.get('marques');
    /* La bulle des dossiers rendus voyage de la même façon : son ouverture
       suit l'adresse, sans rien écrire dans les réglages du compte. */
    const rendusParam = params.get('rendus');
    /* Le repli de la pastille « rétablies » de l'en-tête voyage lui aussi :
       son chevron ouvert ou fermé suit la lecture de l'expéditeur. */
    const enteteParam = params.get('entete');
    /* Son « Voir tout » voyage dans la même adresse : la bulle s'ouvre sur
       toutes ses lignes, et pas sur les dix premières. */
    const enteteToutParam = params.get('enteteTout') === '1';
    /* La lecture « rétablies » part aussi avec le lien, comme celle des
       dossiers déjà partagés. */
    const restauresParam = params.get('restaures') === '1';
    /* Le compteur du tri voyage dans la même adresse : il est relu tel quel,
       sans jamais être pris pour une marque du compte qui l'ouvre. */
    const triNParam = Number(params.get('triN'));
    const triNLu = Number.isFinite(triNParam) && triNParam > 0 ? Math.round(triNParam) : null;
    if (
      !lecture &&
      !etatParam &&
      !retardParam &&
      !refParam &&
      !partagesParam &&
      !adressesParam &&
      !endormisParam &&
      !endormisConfirmesParam &&
      !sansDureeParam &&
      !rythmeHeriteParam &&
      dureeLue === null &&
      !triParam &&
      !marquesParam &&
      !rendusParam &&
      !enteteParam &&
      !enteteToutParam &&
      !restauresParam &&
      triNLu === null
    ) {
      return;
    }
    setShared(true);
    setTriDuLien(triRecentsParam ? triNLu : null);
    setTriOuvertsDuLien(triOuvertsParam ? triNLu : null);
    /* One dossier, handed over on its own: the list keeps that very line. */
    setRefLue(refParam ? refParam.trim() : null);
    setBulkNote(null);
    setChoisis([]);
    /* The reading on the shared dossiers travels with the address too, and is
       only a look: it narrows the list without being written down. */
    setPartagesSeul(
      !adressesParam &&
        !endormisParam &&
        !endormisConfirmesParam &&
        !rythmeHeriteParam &&
        partagesParam,
    );
    /* La lecture « rétablies » voyage pareillement, et ne se cumule pas avec
       celle des partages ni avec celle des dossiers seulement adressés. */
    setRendusSeul(
      !partagesParam &&
        !adressesParam &&
        !endormisParam &&
        !endormisConfirmesParam &&
        !rythmeHeriteParam &&
        restauresParam,
    );
    /* Et la troisième lecture de la ventilation, quand aucune des deux autres
       n'est demandée : l'expéditeur n'en montrait qu'une. */
    setAdressesSeul(
      !partagesParam &&
        !restauresParam &&
        !endormisParam &&
        !endormisConfirmesParam &&
        !rythmeHeriteParam &&
        adressesParam,
    );
    /* La lecture des dossiers endormis ferme la marche : elle ne se cumule
       avec aucune des trois autres. */
    setEndormisSeul(
      !partagesParam &&
        !restauresParam &&
        !adressesParam &&
        !endormisConfirmesParam &&
        !rythmeHeriteParam &&
        endormisParam,
    );
    /* Et celle des endormis confirmés, quand c'est elle que l'adresse porte :
       les lectures ne se cumulent jamais. */
    setEndormisConfirmesSeul(
      !partagesParam &&
        !restauresParam &&
        !adressesParam &&
        !endormisParam &&
        !sansDureeParam &&
        !rythmeHeriteParam &&
        endormisConfirmesParam,
    );
    /* Et celle des dossiers sans durée, quand c'est elle que l'adresse porte. */
    setSansDureeSeul(
      !partagesParam &&
        !restauresParam &&
        !adressesParam &&
        !endormisParam &&
        !endormisConfirmesParam &&
        !rythmeHeriteParam &&
        sansDureeParam,
    );
    /* Et celle des durées héritées, quand c'est elle que l'adresse porte :
       toutes les lectures de la liste ne se cumulent jamais. */
    setRythmeHeriteSeul(
      !partagesParam &&
        !restauresParam &&
        !adressesParam &&
        !endormisParam &&
        !endormisConfirmesParam &&
        !sansDureeParam &&
        rythmeHeriteParam,
    );
    /* Et celle de la durée exacte, quand c’est elle que l’adresse porte :
       toutes les lectures de la liste ne se cumulent jamais. */
    setDureeSeule(
      dureeLue !== null &&
        !partagesParam &&
        !restauresParam &&
        !adressesParam &&
        !endormisParam &&
        !endormisConfirmesParam &&
        !sansDureeParam &&
        !rythmeHeriteParam
        ? dureeLue
        : null,
    );
    /* Le tri n'est qu'un ordre de lecture : il suit l'adresse sans être
       enregistré comme le réglage du compte. */
    setTriRecents(triRecentsParam);
    setTriOuverts(triOuvertsParam);
    /* Le repli de la Synthèse suit l'adresse : rien n'est écrit dans les
       réglages du compte, c'est une lecture qui voyage. */
    if (marquesParam === 'toutes') setMarquesSyntheseToutes(true);
    else if (marquesParam === 'pliees') setMarquesSyntheseToutes(false);
    /* La bulle des dossiers rendus s'ouvre ou reste fermée comme chez
       l'expéditeur — rien n'est enregistré, c'est une lecture. */
    setRendusOuverts(rendusParam === 'ouverts');
    /* Le repli de la pastille de l'en-tête suit la même règle : rien n'est
       enregistré, c'est une lecture qui repart avec l'adresse. */
    setRendusEnteteOuverts(enteteParam === 'ouverts');
    /* Et son « Voir tout » aussi : arrivé ouvert sur toutes ses lignes, il
       reste tel quel — un repli refermé ne déplie rien. */
    setRendusEnteteTous(enteteParam === 'ouverts' && enteteToutParam);
    /* A shared address is a look, not a decision: the state it carries is shown
       but not written down as this member's own last reading. */
    if (estDevisFiltre(etatParam)) setFiltre(etatParam);
    if (lecture === 'groupe') {
      setGroupeSeul(true);
      setJamaisSeul(false);
      setRetard(retardParam);
    } else if (lecture === 'jamais') {
      setJamaisSeul(true);
      setGroupeSeul(false);
      if (groupeMemoryKey) saveGroupOnly(groupeMemoryKey, false);
      /* Only the late files can go out in a grouped recap: the other ones are
         still inside their first week, and nothing is urgent about them yet. */
      const jamaisEnRetard = rows.filter(
        (row) =>
          statutDevis(row.statut) === 'recu' &&
          ageInDays(row.created_at) >= LATE_DAYS &&
          !row.recap_groupe_at,
      );
      if (jamaisEnRetard.length > 0) {
        setRetard(true);
        setChoisis(jamaisEnRetard.map((row) => row.reference));
      } else {
        setRetard(retardParam);
      }
    } else {
      setRetard(retardParam);
    }
    navigate(`${location.pathname}#mes-devis`, { replace: true });
    window.setTimeout(() => {
      document
        .getElementById('mes-devis')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 170);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.search, location.pathname, loading, error]);

  /* The very date the badges and the line under the counters show is written
     down for this account: the B2B workbook reads it to close its own summary
     with the same day, and the number of files that send carried, so the sheet
     never states a day without its count. */
  useEffect(() => {
    if (!user || !dernierGroupeAt) return;
    saveLastBulk(bulkKey(user.id), dernierGroupeAt, groupeCount);
  }, [user, dernierGroupeAt, groupeCount]);

  /* How many quotes no grouped recap has ever carried yet: written under the
     account, so the B2B workbook can say it beside the day of the last send
     without opening this list. A reading that has not happened yet writes
     nothing, rather than a zero the sheet would take at face value. */
  useEffect(() => {
    if (!user || loading || error) return;
    saveLastBulkNever(bulkNeverKey(user.id), jamais.length);
  }, [user, loading, error, rows, jamais.length]);

  /* The references of that very send are written down beside its day, so the B2B
     summary can list the files one by one, each with the day it left — never a
     count without its names. */
  useEffect(() => {
    if (!user || !dernierGroupeAt || groupeRefs.length === 0) return;
    saveLastBulkRefs(bulkRefsKey(user.id), dernierGroupeAt, groupeRefs);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [user, dernierGroupeAt, rows]);

  const visibles = rows.filter(
    (row) =>
      (!refLue || row.reference === refLue) &&
      (filtre === 'tous' || statutDevis(row.statut) === filtre) &&
      (!retard || estEnRetard(row)) &&
      (!groupeSeul || Boolean(row.recap_groupe_at)) &&
      (!jamaisSeul || !row.recap_groupe_at) &&
      (!partagesSeul || (Boolean(shares?.[row.reference]) && !retablis?.[row.reference])) &&
      (!rendusSeul || Boolean(retablis?.[row.reference])) &&
      (!adressesSeul || (!shares?.[row.reference] && !retablis?.[row.reference])) &&
      (!endormisSeul || estEndormi(row)) &&
      (!endormisConfirmesSeul ||
        (estEndormi(row) && statutDevis(row.statut) === 'confirme')) &&
      (!sansDureeSeul || !row.rythme) &&
      (!rythmeHeriteSeul || estRythmeHerite(row)) &&
      (!dureeSeule || moisDuRythme(row.rythme) === dureeSeule),
  );

  /* Le tri « partagé récemment » ne cache rien : il remonte seulement les
     dossiers qui viennent de circuler, du plus récent au plus ancien. Ceux qui
     n'ont jamais été transmis gardent leur ordre, à la suite. */
  /* Et l'ordre « ouverture récente » fait de même avec les dossiers consultés :
     le dernier ouvert passe devant, les autres suivent du plus récent au plus
     ancien, et ceux jamais ouverts gardent leur ordre à la queue. */
  const heureOuverture = (reference: string): number => {
    const at = openedAt[reference];
    if (!at) return 0;
    const stamp = new Date(at).getTime();
    return Number.isFinite(stamp) ? stamp : 0;
  };
  const listeAffichee = triOuverts
    ? [...visibles].sort((a, b) => {
        const at = heureOuverture(a.reference);
        const bt = heureOuverture(b.reference);
        if (at && bt) return bt - at;
        if (at) return -1;
        if (bt) return 1;
        return 0;
      })
    : triRecents
      ? [...visibles].sort((a, b) => {
          const at = shares?.[a.reference];
          const bt = shares?.[b.reference];
          if (at && bt) return new Date(bt).getTime() - new Date(at).getTime();
          if (at) return -1;
          if (bt) return 1;
          return 0;
        })
      : visibles;

  /*
   * La liste des devis se pilote comme les autres listes du site : les flèches
   * haut et bas mettent un devis en avant (le geste boucle d'un bout à l'autre),
   * Entrée ouvre sa page de suivi, Échap rend la liste au repos. Les boutons de
   * la ligne — renvoyer, suivre, partager — gardent leurs touches à eux : le
   * raccourci ne vole jamais un geste déjà commencé.
   */
  const [keyedRef, setKeyedRef] = useState<string | null>(null);
  /*
   * Les devis parcourus au clavier pendant la visite : chaque dossier mis en
   * avant y entre une seule fois, pour dire combien de fiches ont défilé sous
   * les flèches — la visite se compte au lieu de se deviner.
   */
  const [walked, setWalked] = useState<string[]>([]);
  const markWalked = (ref: string) => {
    setWalked((prev) => (prev.includes(ref) ? prev : [...prev, ref]));
  };
  /*
   * La fiche rappelée par le compteur, et les dossiers ouverts depuis ce
   * rappel : le second compteur dit ce que le geste a vraiment ouvert, sans
   * se confondre avec les fiches simplement parcourues sous les flèches.
   */
  const [walkRecall, setWalkRecall] = useState<string>(() => readRecall());
  const [walkOpened, setWalkOpened] = useState<string[]>(() => readOpened());
  /* Un dossier s'ouvre d'un geste (Entrée, référence, lien de suivi) : il
     entre au compte une seule fois, à condition qu'une fiche ait été
     rappelée. */
  const noterOuverture = (reference: string) => {
    setWalkOpened(noteOpened(reference));
    /* Le jour de visite est écrit pour ce compte : le tri « ouverture
       récente » remonte alors le dossier sans attendre un rechargement. */
    if (ouvertsMemoryKey) setOpenedAt(noteOpenedAt(ouvertsMemoryKey, reference));
  };
  /* Le dossier que le compteur vient de rouvrir : il est ramené au centre et
     désigné quelques secondes, puis redevient une ligne ordinaire. */
  const [focusRef, setFocusRef] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  /* Une liste qui change de contenu ne garde pas un devis qui n'y est plus. */
  const listKey = listeAffichee.map((row) => row.reference).join(',');

  useEffect(() => {
    setKeyedRef(null);
  }, [listKey]);

  /* Le devis mis en avant reste sous les yeux : la liste défile juste assez
     pour le garder dans le cadre. */
  useEffect(() => {
    if (!keyedRef) return;
    listRef.current?.querySelector('.dvl-row.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [keyedRef]);

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (listeAffichee.length === 0) return;
    const target = event.target as HTMLElement | null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      /* Un menu déroulant ou un champ garde ses flèches. */
      if (target?.closest('select, input, textarea, [contenteditable="true"]')) return;
      event.preventDefault();
      const current = listeAffichee.findIndex((row) => row.reference === keyedRef);
      const next = event.key === 'ArrowDown'
        ? (current < listeAffichee.length - 1 ? current + 1 : 0)
        : (current > 0 ? current - 1 : listeAffichee.length - 1);
      const nextRef = listeAffichee[next]?.reference ?? null;
      setKeyedRef(nextRef);
      if (nextRef) markWalked(nextRef);
      return;
    }
    if (event.key === 'Escape') {
      setKeyedRef(null);
      return;
    }
    if (event.key !== 'Enter') return;
    /* Un lien ou un bouton déjà pris au clavier s'ouvre de lui-même. */
    if (target?.closest('a, button, input, textarea, select, label, form')) return;
    const chosen = listeAffichee.find((row) => row.reference === keyedRef);
    if (!chosen) return;
    event.preventDefault();
    /* Entrée ouvre un dossier : il entre au compte des ouvertures. */
    noterOuverture(chosen.reference);
    navigate(`/suivi?ref=${encodeURIComponent(chosen.reference)}`);
  };

  /*
   * Le compteur des devis parcourus n'est pas qu'un chiffre : il rouvre la
   * dernière fiche mise en avant. La liste revient entière — aucun filtre ne
   * peut la cacher — puis le dossier est désigné et ramené au centre.
   */
  const reopenLastWalked = () => {
    const ref = walked[walked.length - 1];
    if (!ref) return;
    setFiltre('tous');
    saveDevisFiltre('tous');
    setRetard(false);
    setGroupeSeul(false);
    if (groupeMemoryKey) saveGroupOnly(groupeMemoryKey, false);
    setJamaisSeul(false);
    setPartagesSeul(false);
    setRendusSeul(false);
    if (rendusMemoryKey) saveRestoredOnly(rendusMemoryKey, false);
    setAdressesSeul(false);
    setEndormisSeul(false);
    setEndormisConfirmesSeul(false);
    setSansDureeSeul(false);
    setRythmeHeriteSeul(false);
    if (rythmeMemoryKey) saveRythmeOnly(rythmeMemoryKey, false);
    relacherDuree();
    setRefLue(null);
    setChoisis([]);
    setBulkNote(null);
    setFocusRef(ref);
    /* Le rappel prend la main : il devient le point de départ du compte des
       dossiers ouverts, et les ouvertures d'avant s'effacent — elles
       appartenaient à un autre rappel. */
    markRecall(ref);
    setWalkRecall(ref);
    setWalkOpened([]);
  };

  /* Le dossier rouvert est ramené au centre et désigné quelques secondes : le
     geste dit « celui-là, justement », il n'en fait pas un repère permanent. */
  useEffect(() => {
    if (!focusRef || loading) return undefined;
    const node = listRef.current?.querySelector(`.dvl-row[data-ref="${focusRef}"]`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = window.setTimeout(() => setFocusRef(null), 4200);
    return () => window.clearTimeout(timer);
  }, [focusRef, loading, listKey]);

  /* Combien de dossiers ce tri a réellement à remonter : les lignes affichées
     qui portent une marque de partage. Le compteur de la pastille dit ce
     nombre-là, jamais celui d'une autre lecture — et, à défaut, le nombre
     annoncé par l'adresse partagée. */  const remontes = visibles.filter((row) => Boolean(shares?.[row.reference])).length;
  const remontesAffiches = remontes > 0 ? remontes : triDuLien ?? 0;
  /* Combien de dossiers de cette lecture ont déjà été ouverts : le compteur du
     tri dit ce qu'il remonte, sans promettre un ordre vide. */
  const ouvertsConnus = visibles.filter((row) => Boolean(openedAt[row.reference])).length;
  /* Et quand la liste arrive par une adresse partagée, le compteur de
     l'expéditeur prend le relais — comme celui de la pastille des partages :
     le collègue lit le même nombre, même si son navigateur ne connaît aucune
     de ces visites. */
  const remontesOuverts = ouvertsConnus > 0 ? ouvertsConnus : triOuvertsDuLien ?? 0;

  /* Un ordre retenu qui n'a plus aucune visite à remonter rend la liste à son
     sens habituel, plutôt que de laisser une pastille qui ne trie rien — la
     mémoire du tri s'efface avec lui. Une lecture arrivée par un lien garde
     la main : c'est l'expéditeur qui a choisi. */
  useEffect(() => {
    if (loading || error || shared || !triOuverts) return;
    if (Object.keys(openedAt).length > 0) return;
    setTriOuverts(false);
    if (triOuvertsMemoryKey) saveSortOpened(triOuvertsMemoryKey, false);
  }, [loading, error, shared, triOuverts, openedAt, triOuvertsMemoryKey]);

  /* Only the rows actually shown can be ticked, so a tick always points at a
     file the reader can see. */
  const selection = visibles.filter((row) => choisis.includes(row.reference));
  const tousChoisis = visibles.length > 0 && selection.length === visibles.length;

  const basculerChoix = (reference: string) => {
    setChoisis((prev) =>
      prev.includes(reference) ? prev.filter((ref) => ref !== reference) : [...prev, reference],
    );
  };

  const basculerTous = () => {
    setChoisis(tousChoisis ? [] : visibles.map((row) => row.reference));
  };

  /* One grouped recap for every late file that was ticked: a single e-mail
     listing them all, instead of one message per dossier. */
  const envoyerGroupe = async () => {
    const references = selection.map((row) => row.reference);
    if (!references.length) return;
    setBulkBusy(true);
    setBulkNote(null);
    /* A new send replaces the previous trace: an old workbook can never be
       mistaken for the one that has just left. */
    setBulkTrace(null);
    try {
      const { data, error: failure } = await supabase.functions.invoke('devis-abonnement', {
        body: { action: 'resend-bulk', references },
      });
      const answer = data as {
        ok?: boolean;
        emailed?: boolean;
        count?: number;
        sentAt?: string | null;
      } | null;
      if (failure || !answer?.ok || !answer.emailed) {
        setBulkNote({ ok: false, text: t('dv.bulkErr') });
        return;
      }
      /* The badge follows the mail that really left: only a send with a written
         date marks the files, so a failed one never dresses them up. */
      if (answer.sentAt) {
        const stamp = answer.sentAt;
        setRows((prev) =>
          prev.map((row) =>
            references.includes(row.reference) ? { ...row, recap_groupe_at: stamp } : row,
          ),
        );
      }
      setBulkNote({
        ok: true,
        text: t('dv.bulkOk').replace('{n}', String(answer.count ?? references.length)),
      });
      /* The files that have just left, with the date they went out: the export
         offered right after the send holds exactly them, never the whole list. */
      setBulkTrace({
        at: answer.sentAt ?? new Date().toISOString(),
        rows: selection.map((row) => ({
          ...row,
          recap_groupe_at: answer.sentAt ?? row.recap_groupe_at,
        })),
      });
      setChoisis([]);
    } catch {
      setBulkNote({ ok: false, text: t('dv.bulkErr') });
    } finally {
      setBulkBusy(false);
    }
  };

  /* The address of the reading on screen: the state, the late face and the
     group / never-group reading, so a colleague opens the very same lines —
     built at click time, never stored anywhere. */
  const shareHref = (reference?: string) => {
    try {
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = 'mes-devis';
      if (groupeSeul) url.searchParams.set('devis', 'groupe');
      else if (jamaisSeul) url.searchParams.set('devis', 'jamais');
      if (filtre !== 'tous') url.searchParams.set('etat', filtre);
      if (retard) url.searchParams.set('retard', '1');
      /* La lecture sur les dossiers déjà confiés à un collègue part avec
         l'adresse : celui qui l'ouvre tombe sur ce qui circule, pas sur tout. */
      if (partagesSeul) url.searchParams.set('partages', '1');
      /* La lecture des dossiers seulement adressés part de la même façon : le
         collègue ouvre les dossiers qui n'ont jamais circulé. */
      if (adressesSeul) url.searchParams.set('adresses', '1');
      /* Ceux qui dorment voyagent aussi : la ligne du classeur et la pastille
         de l'en-tête ouvrent exactement ces dossiers. */
      if (endormisSeul) url.searchParams.set('endormis', '1');
      /* Les endormis confirmés partent avec la leur : le collègue ouvre les
         dossiers qui dorment avec un devis déjà prêt. */
      if (endormisConfirmesSeul) url.searchParams.set('endormisConfirmes', '1');
      /* La lecture « sans durée » part avec l'adresse : le collègue ouvre les
         dossiers dont la durée manque, et rien d'autre. */
      if (sansDureeSeul) url.searchParams.set('sansDuree', '1');
      /* La lecture des durées héritées part avec l'adresse : le collègue ouvre
         les dossiers dont la durée vient d'un réglage plus ancien. */
      if (rythmeHeriteSeul) url.searchParams.set('rythmeHerite', '1');
      /* La durée exacte voyage aussi : le collègue ouvre les dossiers écrits
         sur ce nombre de mois-là, et rien d'autre. */
      if (dureeSeule !== null) url.searchParams.set('duree', String(dureeSeule));
      /* L'ordre « partagé récemment » voyage avec l'adresse : le collègue
         ouvre la même lecture, dans le même ordre. */
      if (triRecents) {
        url.searchParams.set('tri', 'recents');
        /* Son compteur part avec elle : le collègue lit le même nombre, même
           si son navigateur ne connaît aucune de ces marques. */
        if (remontes > 0) url.searchParams.set('triN', String(remontes));
      } else if (triOuverts) {
        /* L'ordre « ouverture récente » voyage de la même façon : le collègue
           ouvre la liste dans le sens où elle était lue, et lit le même
           nombre de dossiers remontés. */
        url.searchParams.set('tri', 'ouverts');
        if (ouvertsConnus > 0) url.searchParams.set('triN', String(ouvertsConnus));
      }
      /* Le repli de la Synthèse part avec l'adresse : le collègue ouvre la bulle
         des marques dans l'état où elle était lue — ouverte ou fermée. */
      if (marquesSynthesePliees) {
        url.searchParams.set('marques', marquesSyntheseToutes ? 'toutes' : 'pliees');
      }
      /* La bulle des dossiers rendus part grande ouverte ou refermée : le
         collègue la retrouve dans la lecture de l'expéditeur. */
      if (marquesRendues.length > 0) {
        url.searchParams.set('rendus', rendusOuverts ? 'ouverts' : 'fermes');
      }
      /* Le repli de la pastille « rétablies » de l'en-tête part de la même
         façon : le collègue la retrouve dépliée ou refermée comme ici. */
      if (rendusEntetePlies) {
        url.searchParams.set('entete', rendusEnteteOuverts ? 'ouverts' : 'fermes');
        /* Et son « Voir tout » voyage avec elle : la bulle s'ouvre chez le
           collègue sur toutes ses lignes, pas seulement sur les dix
           premières. */
        if (rendusEnteteOuverts && rendusEnteteTous) {
          url.searchParams.set('enteteTout', '1');
        }
      }
      /* La lecture « rétablies » part avec l'adresse, comme celle des
         dossiers déjà confiés à un collègue. */
      if (rendusSeul) url.searchParams.set('restaures', '1');
      /* One dossier handed over on its own: the address keeps the reading and
         narrows it to that very file, so the colleague opens one line. */
      if (reference) url.searchParams.set('ref', reference);
      url.searchParams.set('lang', lang);
      return url.toString();
    } catch {
      return '';
    }
  };

  const buildShareHref = () => shareHref();

  const filterChips: Array<{ key: DevisFiltre; label: string; n: number; icon: string }> = [
    { key: 'tous', label: t('dv.filterAll'), n: rows.length, icon: 'ri-file-list-3-line' },
    { key: 'recu', label: t('dv.st.recu'), n: tally.recu, icon: 'ri-inbox-line' },
    { key: 'en_etude', label: t('dv.st.en_etude'), n: tally.en_etude, icon: 'ri-time-line' },
    { key: 'confirme', label: t('dv.st.confirme'), n: tally.confirme, icon: 'ri-check-double-line' },
    { key: 'expire', label: t('dv.st.expire'), n: tally.expire, icon: 'ri-forbid-line' },
  ];

  return (
    <section className="pro-card dvl" id="mes-devis">
      <div className="dvl-head">
        <div>
          <h2 className="page-h2">{t('dv.listTitle')}</h2>
          <p className="auth-note">{t('dv.listSub')}</p>
        </div>
        <DevisHeadCounts
          loading={loading}
          error={error}
          total={rows.length}
          shares={{ count: partagesCount, lastAt: dernierPartageAt }}
          restored={{
            count: rendusCount,
            lastAt: dernierRetablisAt,
            avgDays: retourMoyen,
            alone: rendusSeul,
            onToggle: basculerRendus,
            folded: rendusEntetePlies,
            open: rendusEnteteOuverts,
            onToggleOpen: () => setRendusEnteteOuverts((prev) => !prev),
            all: rendusEnteteTous,
            onToggleAll: () => setRendusEnteteTous((prev) => !prev),
            list: rendusEnteteListe,
            visible: rendusEnteteVisibles,
          }}
          addressed={{
            count: adressesCount,
            lastAt: dernierAdresseAt,
            alone: adressesSeul,
            onToggle: basculerAdresses,
          }}
          dormant={{
            count: endormisCount,
            oldestAt: endormisOldestAt,
            amount: endormisMontant,
            share: endormisPart,
            devises: endormisRepartition.length,
            /* Le délai moyen du lot endormi, posé à côté de sa part de
               l'attente : le compteur dit combien dorment, le pourcentage ce
               qu'ils pèsent, la moyenne depuis combien de temps. */
            avgDays: endormisMoyenne,
            alone: endormisSeul,
            onToggle: basculerEndormis,
          }}
          dormantConfirmed={{
            count: endormisConfirmes,
            amount: endormisConfirmesMontant,
            dormantAmount: endormisMontant,
            share: endormisConfirmesPart,
            /* Les marchés que ce lot de devis prêts mêle : la pastille le dit
               comme celle des endormis, et la répartition déroulée juste
               au-dessus en nomme chaque devise. */
            devises: endormisConfirmesParDevise.length,
            /* Les deux délais moyens, celui des confirmés et celui de toute
               l'attente : la pastille les compare comme elle compare les
               montants. */
            avgDays: endormisConfirmesMoyenne,
            dormantAvgDays: endormisMoyenne,
            alone: endormisConfirmesSeul,
            onToggle: basculerEndormisConfirmes,
          }}
          forgotten={{
            count: oubliCount,
            total: marquesOubliees.length,
            onRestore: restaurerLesPartages,
            visible: marquesVisibles,
            folded: marquesPliees,
            all: marquesToutes,
            onToggleAll: () => setMarquesToutes((prev) => !prev),
          }}
          lang={lang}
          day={day}
          t={t}
        />
      </div>

      {!loading && !error && rows.length > 0 && (
        <div className="dvl-summary" aria-label={t('dv.sumTitle')}>
          <div className="dvl-summary-head">
            <p className="dvl-summary-stamp">{t('dv.sumTitle')}</p>
            {/* La Synthèse entière se copie d'ici : l'adresse emporte la
                lecture ouverte, donc le collègue ouvre le même écran, la même
                lecture, sans refaire un seul clic. */}
            <CopyTextButton
              build={buildShareHref}
              label={t('dv.sumCopy')}
              hint={t('dv.sumCopyHint')}
              className="dvl-summary-copy"
            />
          </div>
          <div className="dvl-summary-grid">
            <div className="dvl-summary-cell" data-state="recu">
              <span className="dvl-summary-n">{tally.recu}</span>
              <span className="dvl-summary-l">
                <i className="ri-inbox-line" aria-hidden="true"></i>
                {t('dv.sumReceived')}
              </span>
            </div>
            <div className="dvl-summary-cell" data-state="en_etude">
              <span className="dvl-summary-n">{tally.en_etude}</span>
              <span className="dvl-summary-l">
                <i className="ri-time-line" aria-hidden="true"></i>
                {t('dv.sumReview')}
              </span>
            </div>
            <div className="dvl-summary-cell" data-state="confirme">
              <span className="dvl-summary-n">{tally.confirme}</span>
              <span className="dvl-summary-l">
                <i className="ri-check-double-line" aria-hidden="true"></i>
                {t('dv.sumConfirmed')}
              </span>
            </div>
            <div className="dvl-summary-cell" data-state="expire">
              <span className="dvl-summary-n">{tally.expire}</span>
              <span className="dvl-summary-l">
                <i className="ri-forbid-line" aria-hidden="true"></i>
                {t('dv.sumExpired')}
              </span>
            </div>
            {/* The fifth counter is not a state: the files still received with
                no answer after a week. It is also the door to that reading. */}
            <button
              type="button"
              className="dvl-summary-cell"
              data-state="retard"
              aria-pressed={retard}
              title={t('dv.sumLateHint')}
              onClick={basculerRetard}
            >
              <span className="dvl-summary-n">{enRetard.length}</span>
              <span className="dvl-summary-l">
                <i className="ri-alarm-warning-line" aria-hidden="true"></i>
                {t('dv.sumLate')}
              </span>
            </button>
            {/* Its mirror, counted on the very same rows: the files no grouped
                recap has ever carried. A counter of its own, pressed like the
                overdue one — and, because a count is not a message, pressing it
                also opens the group send of the overdue ones. */}
            <button
              type="button"
              className="dvl-summary-cell"
              data-state="jamais"
              aria-pressed={jamaisSeul}
              title={t('dv.sumNeverHint')}
              onClick={basculerJamais}
            >
              <span className="dvl-summary-n">{jamais.length}</span>
              <span className="dvl-summary-l">
                <i className="ri-mail-line" aria-hidden="true"></i>
                {t('dv.sumNever')}
              </span>
            </button>
            {/* The seventh counter, the exact mirror of the one before: the
                files a grouped recap has already carried. Same gesture as the
                others — a click keeps them alone, a second releases them. */}
            <button
              type="button"
              className="dvl-summary-cell"
              data-state="groupe"
              aria-pressed={groupeSeul}
              title={t('dv.sumGroupHint')}
              onClick={basculerGroupe}
            >
              <span className="dvl-summary-n">{groupes.length}</span>
              <span className="dvl-summary-l">
                <i className="ri-mail-send-line" aria-hidden="true"></i>
                {t('dv.sumGroup')}
              </span>
            </button>
            {/* La quatrième lecture de la ventilation entre dans la Synthèse
                comme dans l'en-tête : le même compteur, et la cellule est un
                lien direct vers sa lecture — un clic ouvre ces seuls dossiers,
                sans repasser par les pastilles de la liste. */}
            {adressesCount > 0 && (
              <Link
                to={devisAddressedHref(lang)}
                className="dvl-summary-cell"
                data-state="adresses"
                title={t('dv.sumAddressedHint')}
              >
                <span className="dvl-summary-n">{adressesCount}</span>
                <span className="dvl-summary-l">
                  <i className="ri-at-line" aria-hidden="true"></i>
                  {t('dv.sumAddressed')}
                </span>
                <i className="ri-arrow-right-up-line dvl-summary-arrow" aria-hidden="true"></i>
              </Link>
            )}
          </div>
          {/* La ligne des dossiers qui dorment, dans la Synthèse à l'écran
              comme dans le classeur : elle est aussi une porte — un clic
              ouvre la liste réduite à ces seuls dossiers, et son lien se
              copie d'ici, sans ouvrir la liste. */}
          {endormisCount > 0 && (
            <div className="dvl-summary-bulk dvl-summary-dormant">
              <Link
                to={devisDormantHref(lang)}
                className="dvl-summary-dormant-main"
                title={t('dv.sumDormantHint')}
              >
                <i className="ri-moon-line" aria-hidden="true"></i>
                <span>{t('dv.sumDormant').replace('{n}', String(endormisCount))}</span>
                {/* Le montant cumulé de ces devis, juste après le compteur :
                    ce qui dort se lit alors aussi en valeur. */}
                {endormisMontant && (
                  <em
                    className="dvl-summary-dormant-amount"
                    title={t('dv.listDormantAmountHint')}
                  >
                    {endormisMontant}
                  </em>
                )}
                {/* Depuis quand l'attente la plus longue court, à côté du
                    nombre : le compteur dit combien dorment, la date dit
                    depuis quand — la même date que la pastille de l'en-tête. */}
                {endormisOldestAt && (
                  <em className="dvl-summary-dormant-oldest">
                    {t('dv.listDormantOldest').replace('{date}', day(endormisOldestAt))}
                  </em>
                )}
                {/* Le délai moyen du lot endormi, rapporté à celui de toute la
                    liste : « 24 j sur 41 j ». Le lot ne se lit plus seul — la
                    Synthèse dit s'il attend plus longtemps que l'ensemble des
                    devis, sur la même horloge que leurs compteurs. */}
                {endormisMoyenne !== null && listeMoyenne !== null && (
                  <em
                    className="dvl-summary-dormant-avg"
                    title={t('dv.sumDormantAvgCompareHint')}
                  >
                    {t('dv.sumDormantAvgOf')
                      .replace('{a}', String(endormisMoyenne))
                      .replace('{b}', String(listeMoyenne))}
                  </em>
                )}
                <i className="ri-arrow-right-line dvl-summary-go" aria-hidden="true"></i>
              </Link>
              {/* Ceux dont le devis est déjà confirmé, à côté du total : parmi
                  tous ceux qui dorment, le nombre qui attend pour rien. Ce
                  n’est pas un simple chiffre mais une porte — un clic ouvre
                  la liste réduite à ces seuls dossiers. Rien ne s’écrit quand
                  il n’y en a aucun. */}
              {endormisConfirmes > 0 && (
                <Link
                  to={devisDormantConfirmedHref(lang)}
                  className="dvl-summary-dormant-confirmed dvl-summary-dormant-confirmed-link"
                  title={t('dv.sumDormantConfirmedOpen')}
                >
                  <i className="ri-check-double-line" aria-hidden="true"></i>
                  <span>
                    {t('dv.sumDormantConfirmed').replace('{n}', String(endormisConfirmes))}
                  </span>
                  <i
                    className="ri-arrow-right-up-line dvl-summary-dormant-confirmed-go"
                    aria-hidden="true"
                  ></i>
                  {/* Ce qu'ils pèsent, rapporté à tous les endormis : le
                      nombre dit combien attendent pour rien, la comparaison
                      dit quelle part de l'attente est déjà prête à partir.
                      Rien ne s'écrit quand l'un des deux montants manque. */}
                  {endormisConfirmesMontant && endormisMontant && (
                    <em
                      className="dvl-summary-dormant-amount"
                      title={t('dv.listDormantConfirmedAmountHint')}
                    >
                      {t('dv.sumDormantConfirmedAmountOf')
                        .replace('{a}', endormisConfirmesMontant)
                        .replace('{b}', endormisMontant)}
                    </em>
                  )}
                  {/* Et la part que cela représente, juste après le rapport
                      brut : la proportion se lit sans poser la division. Rien
                      ne s'écrit quand les deux montants ne parlent pas la même
                      devise. */}
                  {endormisConfirmesPart && (
                    <em
                      className="dvl-summary-dormant-share"
                      title={t('dv.sumDormantConfirmedShareHint')}
                    >
                      {endormisConfirmesPart}
                    </em>
                  )}
                  {/* Et les deux parts lues sur la même échelle, celle de
                      toute la liste de devis : celle des devis prêts et celle
                      de tout le lot endormi — « 18 % sur 32 % ». La Synthèse
                      compare ainsi les deux lots comme la bande des Offres,
                      et pas seulement par leurs montants. */}
                  {endormisConfirmesPartListe && endormisPart && (
                    <em
                      className="dvl-summary-dormant-share"
                      title={t('dv.listDormantConfirmedShareOfHint')}
                    >
                      {t('dv.sumDormantShareOf')
                        .replace('{a}', endormisConfirmesPartListe)
                        .replace('{b}', endormisPart)}
                    </em>
                  )}
                  {/* Et sous les montants, les deux délais moyens : « 18 j sur
                      24 j ». Le nombre de dossiers prêts ne dit pas s'ils
                      attendent plus longtemps que les autres ; cette
                      comparaison-là le dit, sur la même horloge que le
                      classeur. */}
                  {endormisConfirmesMoyenne !== null && endormisMoyenne !== null && (
                    <em
                      className="dvl-summary-dormant-avg"
                      title={t('dv.listDormantConfirmedAvgCompareHint')}
                    >
                      {t('dv.sumDormantConfirmedAvgOf')
                        .replace('{a}', String(endormisConfirmesMoyenne))
                        .replace('{b}', String(endormisMoyenne))}
                    </em>
                  )}
                </Link>
              )}
              {/* Et sous la ligne des endormis confirmés, la part déjà prête de
                  chaque marché : dans sa propre devise, combien de dossiers
                  dorment avec un devis tranché. Le lot entier ne mélange rien —
                  chaque marché garde son total, et sa part se rapporte à lui. */}
              {/* Le nombre de marchés du lot confirmé, juste avant sa
                  répartition : la Synthèse le nomme au même endroit et avec
                  les mêmes mots que le classeur, pour qu'un cumul ne se
                  prenne jamais pour un total d'une seule devise. */}
              {endormisConfirmesParDevise.length > 1 && (
                <p
                  className="dvl-summary-dormant-markets"
                  title={t('dv.listDormantConfirmedDevisesHint')}
                >
                  <i className="ri-scales-3-line" aria-hidden="true"></i>
                  <span>{t('dv.csvSynthDormantConfirmedDevises')}</span>
                  <em>
                    {t('dv.listDormantDevises').replace(
                      '{n}',
                      String(endormisConfirmesParDevise.length),
                    )}
                  </em>
                  {/* Et le marché qui attend le plus longtemps parmi eux : le
                      nombre de marchés dit combien, ce jeton dit lequel porte
                      l'attente la plus longue. */}
                  {marcheConfirmePlusLong && (
                    <em title={t('dv.sumDormantMarketsLongestHint')}>
                      {t('dv.sumDormantMarketsLongest')
                        .replace('{devise}', marcheConfirmePlusLong.devise)
                        .replace('{n}', String(marcheConfirmePlusLong.jours))}
                    </em>
                  )}
                </p>
              )}
              <DormantDeviseSplit
                entries={endormisConfirmesParDevise.map((entry) => {
                  const moyenne = delaiDuMarche(delaisConfirmes, entry.devise);
                  return {
                    devise: entry.devise,
                    montant: entry.montant,
                    part: entry.part,
                    count: t('dv.sumDormantConfirmedCountOf')
                      .replace('{a}', String(entry.prets))
                      .replace('{b}', String(entry.total)),
                    avgDays: moyenne,
                    avg:
                      moyenne !== null
                        ? t('dv.listDormantAvg').replace('{n}', String(moyenne))
                        : undefined,
                    title: `${t('dv.sumDormantConfirmedCountOf')
                      .replace('{a}', String(entry.prets))
                      .replace('{b}', String(entry.total))} · ${t('dv.sumDormantConfirmedByDevisePart')}`,
                  };
                })}
                hint={t('dv.sumDormantConfirmedByDeviseHint')}
                avgHint={t('dv.listDormantAvgHint')}
                icon="ri-check-double-line"
                copyHint={t('dv.sumDormantDeviseCopyHint')}
                sortAmountLabel={t('dv.sumDeviseSortAmount')}
                sortAvgLabel={t('dv.sumDeviseSortAvg')}
                sortAmountHint={t('dv.sumDeviseSortAmountHint')}
                sortAvgHint={t('dv.sumDeviseSortAvgHint')}
                order={ordreConfirmes}
                onOrderChange={setOrdreConfirmes}
                copyAllLabel={t('dv.sumDeviseCopyAll')}
                copyAllHint={t('dv.sumDeviseCopyAllHint')}
                ready
              />
              {/* Quand le lot mêle plusieurs marchés, la Synthèse les compte
                  avant de les dérouler : la ligne du classeur nomme déjà ce
                  nombre, l'écran le dit au même endroit, avec le même mot. */}
              {endormisRepartition.length > 1 && (
                <p
                  className="dvl-summary-dormant-markets"
                  title={t('dv.listDormantDevisesHint')}
                >
                  <i className="ri-scales-3-line" aria-hidden="true"></i>
                  <span>{t('dv.csvSynthDormantDevises')}</span>
                  <em>{t('dv.listDormantDevises').replace('{n}', String(endormisRepartition.length))}</em>
                  {/* Le marché qui attend le plus longtemps : à côté de leur
                      nombre, l'écran dit lequel porte l'attente la plus longue
                      — la même moyenne que son jeton, marché par marché. */}
                  {marcheEndormiPlusLong && (
                    <em title={t('dv.sumDormantMarketsLongestHint')}>
                      {t('dv.sumDormantMarketsLongest')
                        .replace('{devise}', marcheEndormiPlusLong.devise)
                        .replace('{n}', String(marcheEndormiPlusLong.jours))}
                    </em>
                  )}
                </p>
              )}
              {/* Quand le lot mêle plusieurs marchés, la Synthèse nomme chaque
                  devise : ce qu'elle pèse, et la place de ses dossiers dans le
                  lot. Même lecture que le classeur, au même endroit. */}
              <DormantDeviseSplit
                entries={endormisRepartition.map((entry) => {
                  const moyenne = delaiDuMarche(delaisEndormis, entry.devise);
                  return {
                    devise: entry.devise,
                    montant: entry.montant,
                    part: entry.part,
                    count: t('dv.csvSynthDormantByDeviseCount').replace(
                      '{n}',
                      String(entry.count),
                    ),
                    avgDays: moyenne,
                    avg:
                      moyenne !== null
                        ? t('dv.listDormantAvg').replace('{n}', String(moyenne))
                        : undefined,
                  };
                })}
                hint={t('dv.sumDormantByDeviseHint')}
                avgHint={t('dv.listDormantAvgHint')}
                icon="ri-scales-3-line"
                copyHint={t('dv.sumDormantDeviseCopyHint')}
                sortAmountLabel={t('dv.sumDeviseSortAmount')}
                sortAvgLabel={t('dv.sumDeviseSortAvg')}
                sortAmountHint={t('dv.sumDeviseSortAmountHint')}
                sortAvgHint={t('dv.sumDeviseSortAvgHint')}
                order={ordreEndormis}
                onOrderChange={setOrdreEndormis}
                copyAllLabel={t('dv.sumDeviseCopyAll')}
                copyAllHint={t('dv.sumDeviseCopyAllHint')}
              />
              {/* Le lien des endormis se copie depuis la ligne elle-même : le
                  collègue ouvre ces dossiers-là, sans que la liste soit
                  ouverte ici. */}
              <CopyTextButton
                build={() => devisDormantHref(lang)}
                label={t('dv.sumDormantCopy')}
                hint={t('dv.sumDormantCopyHint')}
                className="dvl-summary-dormant-copy"
              />
            </div>
          )}
          {/* The counters do not say when a recap last left: the line
              under them answers it, with the same date the badges carry. */}
          {dernierGroupeAt && (
            <p className="dvl-summary-bulk" title={t('dv.sumLastBulkHint')}>
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              <span>
                {t('dv.sumLastBulk')
                  .replace('{date}', day(dernierGroupeAt))
                  .replace('{n}', String(groupeCount))}
              </span>
            </p>
          )}
          {/* La même bulle que dans l'en-tête, ici dans la Synthèse : le
              nombre de marques retirées, « Rétablir » dans la même bulle, et
              sous eux chaque dossier nommé avec sa date de retrait — la même
              lecture que la bulle de l'en-tête. C'est ce compte-là que la
              feuille du classeur nomme ensuite, dossier par dossier. */}
          {oubliCount > 0 && (
            <div className="dvl-summary-bulk dvl-summary-marks" title={t('dv.listForgotHint')}>
              <i className="ri-eraser-line" aria-hidden="true"></i>
              <span className="dvl-summary-marks-head">
                <span>
                  {t(oubliCount > 1 ? 'dv.lastForgotMany' : 'dv.lastForgotOne').replace(
                    '{n}',
                    String(oubliCount),
                  )}
                </span>
                <button
                  type="button"
                  className="dvl-count-restore"
                  title={t('dv.restoreSharesHint')}
                  onClick={restaurerLesPartages}
                >
                  <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('dv.rowRestoreShare')}</span>
                </button>
              </span>
              {/* Dossier par dossier : la référence, le jour du retrait et le
                  délai écoulé — exactement la bulle de l'en-tête. Passé une
                  dizaine de lignes, la Synthèse se replie à son tour : elle
                  doit rester un coup d'œil, pas la liste entière. */}
              <span className="dvl-last-mark-rows dvl-count-mark-rows">
                {marquesSyntheseVisibles.map(({ reference, at }) => (
                  <span className="dvl-last-mark" key={reference}>
                    <b>{reference}</b>
                    <span className="dvl-last-mark-when">
                      {t('dv.lastForgotOn').replace('{date}', day(at))}
                    </span>
                    <span className="dvl-last-mark-ago">
                      {t('dv.lastForgotAgo').replace('{n}', String(ageInDays(at)))}
                    </span>
                  </span>
                ))}
                {marquesSynthesePliees && (
                  <button
                    type="button"
                    className="dvl-mark-more"
                    aria-expanded={marquesSyntheseToutes}
                    title={
                      marquesSyntheseToutes
                        ? t('dv.markSeeLess')
                        : t('dv.markSeeAll').replace('{n}', String(marquesOubliees.length))
                    }
                    onClick={() => setMarquesSyntheseToutes((prev) => !prev)}
                  >
                    <i
                      className={
                        marquesSyntheseToutes ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                      }
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {marquesSyntheseToutes
                        ? t('dv.markSeeLess')
                        : t('dv.markSeeAll').replace('{n}', String(marquesOubliees.length))}
                    </span>
                  </button>
                )}
              </span>
            </div>
          )}
          {/* Les deux gestes côte à côte, sur une seule ligne : ce que le lot
              a retiré, ce qu'il a rendu, et ce qui reste encore à rendre. */}
          {(oubliCount > 0 || retablisCount > 0) && (
            <p
              className="dvl-summary-bulk dvl-marks-compare"
              title={t('dv.sumMarksCompareHint')}
            >
              <i className="ri-scales-3-line" aria-hidden="true"></i>
              <span>
                {t('dv.sumMarksCompare')
                  .replace('{n}', String(marquesRetireesLot))
                  .replace('{r}', String(retablisCount))
                  .replace('{k}', String(oubliCount))}
              </span>
              {/* Le jour du dernier rétablissement, dans la même ligne : le
                  geste se date sans ouvrir le classeur — et la date elle-même
                  est une porte vers les dossiers rendus. */}
              {dernierRetablisAt && (
                <button
                  type="button"
                  className="dvl-marks-restored-on dvl-marks-restored-btn"
                  title={t('dv.sumMarksRestoredHint')}
                  aria-expanded={rendusOuverts}
                  aria-controls="dvl-marks-restored"
                  onClick={() => setRendusOuverts((prev) => !prev)}
                >
                  <i
                    className={rendusOuverts ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                    aria-hidden="true"
                  ></i>
                  {t('dv.sumMarksRestoredOn').replace('{date}', day(dernierRetablisAt))}
                </button>
              )}
            </p>
          )}
          {/* La bulle des dossiers rendus, ouverte par la date : une ligne par
              dossier, avec le jour du retour et le délai écoulé — le pendant
              exact de la bulle des marques retirées. */}
          {rendusOuverts && marquesRendues.length > 0 && (
            <div
              className="dvl-summary-bulk dvl-summary-marks dvl-marks-restored"
              id="dvl-marks-restored"
              title={t('dv.sumMarksRestoredHint')}
            >
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              <span className="dvl-summary-marks-head">
                <span>
                  {t('dv.sumMarksRestoredHead').replace('{n}', String(marquesRendues.length))}
                </span>
                <button
                  type="button"
                  className="dvl-mark-more"
                  title={t('dv.markSeeLess')}
                  onClick={() => setRendusOuverts(false)}
                >
                  <i className="ri-arrow-up-s-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('dv.markSeeLess')}</span>
                </button>
              </span>
              <span className="dvl-last-mark-rows dvl-count-mark-rows">
                {rendusVisibles.map(({ reference, at }) => (
                  /* Chaque ligne rendue est une porte : le dossier s'ouvre sur
                     sa page de suivi, avec sa référence déjà remplie — et la
                     même adresse se copie d'un clic, sans quitter la bulle. */
                  <span className="dvl-last-mark dvl-last-mark-row" key={reference}>
                    <Link
                      className="dvl-last-mark-link"
                      to={`/suivi?ref=${encodeURIComponent(reference)}`}
                      title={t('dv.followHint')}
                    >
                      <b>{reference}</b>
                      <span className="dvl-last-mark-when">
                        {t('dv.lastRestoredOn').replace('{date}', day(at))}
                      </span>
                      <span className="dvl-last-mark-ago">
                        {t('dv.lastRestoredAgo').replace('{n}', String(ageInDays(at)))}
                      </span>
                    </Link>
                    {/* Le lien de suivi de ce seul dossier, copié depuis sa
                        ligne : le collègue ouvre la page de suivi directement. */}
                    <CopyTextButton
                      build={() => suiviRefHref(reference, lang)}
                      label={t('dv.rowCopyFollow')}
                      hint={t('dv.rowCopyFollowHint').replace('{ref}', reference)}
                      className="dvl-mark-copy"
                    />
                  </span>
                ))}
                {rendusPlies && (
                  <button
                    type="button"
                    className="dvl-mark-more"
                    aria-expanded={rendusTous}
                    title={
                      rendusTous
                        ? t('dv.markSeeLess')
                        : t('dv.markSeeAll').replace('{n}', String(marquesRendues.length))
                    }
                    onClick={() => setRendusTous((prev) => !prev)}
                  >
                    <i
                      className={rendusTous ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {rendusTous
                        ? t('dv.markSeeLess')
                        : t('dv.markSeeAll').replace('{n}', String(marquesRendues.length))}
                    </span>
                  </button>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* The four states, as the last row before the list they narrow — with
          the export beside them, so the sheet carries the same reading. */}
      {!loading && !error && rows.length > 0 && (
        <div className="dvl-filterbar">
          <div className="dvl-filter" role="group" aria-label={t('dv.filterAria')}>
            {filterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="dvl-filter-btn"
                data-state={chip.key}
                aria-pressed={filtre === chip.key}
                onClick={() => choisir(chip.key)}
              >
                <i className={chip.icon} aria-hidden="true"></i>
                <span>{chip.label}</span>
                <b>{chip.n}</b>
              </button>
            ))}
            {/* The fifth chip is not a state: it keeps only the files still
                unanswered after a week, and combines with the state above. */}
            <button
              type="button"
              className="dvl-filter-btn"
              data-state="retard"
              aria-pressed={retard}
              title={t('dv.filterLateHint')}
              onClick={basculerRetard}
            >
              <i className="ri-alarm-warning-line" aria-hidden="true"></i>
              <span>{t('dv.filterLate')}</span>
              <b>{enRetard.length}</b>
            </button>
            {/* La sixième pastille : les dossiers déjà confiés à un collègue,
                pour ne voir que ce qui circule. */}
            <button
              type="button"
              className="dvl-filter-btn"
              data-state="partages"
              aria-pressed={partagesSeul}
              title={t('dv.filterSharedHint')}
              onClick={basculerPartages}
            >
              <i className="ri-share-forward-line" aria-hidden="true"></i>
              <span>{t('dv.filterShared')}</span>
              <b>{partagesCount}</b>
            </button>
            {/* La septième pastille, juste à côté des dossiers partagés :
                seulement ceux que le lot a rendus, pour lire d'un coup ce qui
                est vraiment revenu. */}
            {rendusCount > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="restaures"
                aria-pressed={rendusSeul}
                title={t('dv.filterRestoredHint')}
                onClick={basculerRendus}
              >
                <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                <span>{t('dv.filterRestored')}</span>
                <b>{rendusCount}</b>
              </button>
            )}
            {/* La huitième pastille, à la suite des deux lectures : les
                dossiers munis de leur adresse mais jamais transmis. Un clic
                garde ces seuls dossiers, comme les deux pastilles voisines. */}
            {adressesCount > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="adresses"
                aria-pressed={adressesSeul}
                title={t('dv.filterAddressedHint')}
                onClick={basculerAdresses}
              >
                <i className="ri-at-line" aria-hidden="true"></i>
                <span>{t('dv.filterAddressed')}</span>
                <b>{adressesCount}</b>
              </button>
            )}
            {/* La pastille des dossiers qui dorment, à la suite des trois
                lectures : seulement adressés, et en attente depuis plus d'une
                semaine. Un clic garde ces seuls dossiers. */}
            {endormisCount > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="endormis"
                aria-pressed={endormisSeul}
                title={t('dv.filterDormantHint')}
                onClick={basculerEndormis}
              >
                <i className="ri-moon-line" aria-hidden="true"></i>
                <span>{t('dv.filterDormant')}</span>
                <b>{endormisCount}</b>
              </button>
            )}
            {/* La pastille des endormis confirmés, juste à côté de celle des
                endormis : parmi ceux qui dorment, ceux dont le devis est déjà
                confirmé — le devis est prêt, il n'a jamais circulé. Un clic
                garde ces seuls dossiers, un second les relâche. */}
            {endormisConfirmes > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="endormis-confirmes"
                aria-pressed={endormisConfirmesSeul}
                title={t('dv.filterDormantConfirmedHint')}
                onClick={basculerEndormisConfirmes}
              >
                <i className="ri-check-double-line" aria-hidden="true"></i>
                <span>{t('dv.filterDormantConfirmed')}</span>
                <b>{endormisConfirmes}</b>
              </button>
            )}
            {/* La pastille des dossiers sans durée, à la suite des lectures :
                ceux ouverts avant que la durée retenue soit conservée. C'est la
                lecture que la porte de la bande des Offres ouvre d'un clic. */}
            {sansDureeCount > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="sans-duree"
                aria-pressed={sansDureeSeul}
                title={t('dv.filterNoDureeHint')}
                onClick={basculerSansDuree}
              >
                <i className="ri-calendar-close-line" aria-hidden="true"></i>
                <span>{t('dv.filterNoDuree')}</span>
                <b>{sansDureeCount}</b>
              </button>
            )}
            {/* La pastille des durées héritées, juste à côté de celle des
                dossiers sans durée : ceux dont la durée écrite ne correspond
                pas au rythme retenu sur cet appareil. C’est la lecture que la
                porte de la bande des Offres ouvre d’un clic. */}
            {rythmeHeriteCount > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="rythme-herite"
                aria-pressed={rythmeHeriteSeul}
                title={`${t('dv.filterRythmeHint')} — ${t('dv.lastRythmeDiffHint').replace(
                  '{duree}',
                  rythmeRetenuLabel,
                )}`}
                onClick={basculerRythmeHerite}
              >
                <i className="ri-calendar-2-line" aria-hidden="true"></i>
                <span>{t('dv.filterRythme')}</span>
                <b>{rythmeHeriteCount}</b>
              </button>
            )}
            {/* La pastille d’une durée exacte : elle apparaît quand le jeton
                d’une ligne a été pressé, et nomme le nombre de mois lu — le
                compteur dit combien de dossiers portent cette durée-là. */}
            {dureeSeule !== null && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="duree-exacte"
                aria-pressed
                title={t('dv.filterDureeExactHint').replace('{n}', String(dureeSeule))}
                onClick={() => basculerDuree(dureeSeule)}
              >
                <i className="ri-calendar-check-line" aria-hidden="true"></i>
                <span>{t('dv.filterDureeExact').replace('{n}', String(dureeSeule))}</span>
                <b>{dureeCount}</b>
              </button>
            )}
            {/* L'ordre de lecture : les dossiers qui viennent de circuler d'abord.
                Il ne cache rien, il ne fait que remonter — et il n'apparaît que
                s'il y a vraiment quelque chose à remonter. */}
            {remontesAffiches > 0 && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="recents"
                aria-pressed={triRecents}
                title={t('dv.sortRecentHint')}
                onClick={basculerTriRecents}
              >
                <i className="ri-sort-desc" aria-hidden="true"></i>
                <span>{t('dv.sortRecent')}</span>
                {/* Combien de dossiers cet ordre remonte : un compteur à côté
                    de la pastille, pour ne pas promettre un tri vide. */}
                <b>{remontesAffiches}</b>
              </button>
            )}
            {/* L'autre ordre de lecture : les dossiers consultés en dernier
                d'abord. Il ne cache rien non plus, et n'apparaît que s'il y a
                vraiment une visite à remonter. */}
            {(ouvertsConnus > 0 || triOuverts) && (
              <button
                type="button"
                className="dvl-filter-btn"
                data-state="ouverts"
                aria-pressed={triOuverts}
                title={t('dv.sortOpenedHint')}
                onClick={basculerTriOuverts}
              >
                <i className="ri-history-line" aria-hidden="true"></i>
                <span>{t('dv.sortOpened')}</span>
                {/* Combien de dossiers cet ordre remonte vraiment : le même
                    compteur que la pastille des partages, visite par visite. */}
                <b>{remontesOuverts}</b>
              </button>
            )}
          </div>
          <div className="dvl-filterbar-tools">
            {/* Les marques effacées ne sont jamais perdues : la trace du retrait
                les rend, chacune avec son jour de partage d'origine. */}
            {oubliCount > 0 && (
              <button
                type="button"
                className="ghost-btn dvl-restore-btn"
                title={t('dv.restoreSharesHint')}
                onClick={restaurerLesPartages}
              >
                <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                {t('dv.restoreShares').replace('{n}', String(oubliCount))}
              </button>
            )}
            {/* The share marks can be erased from here, one account at a time:
                the question is asked just below, never behind the reader. */}
            {shareCount > 0 && (
              <button
                type="button"
                className="ghost-btn dvl-forget-btn"
                title={t('dv.forgetSharesHint')}
                aria-expanded={oubliOuvert}
                onClick={() => {
                  setOubliNote('');
                  setOubliOuvert((prev) => !prev);
                }}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                {t('dv.forgetShares')}
              </button>
            )}
            {/* L'ordre « ouverture récente » se copie avec ses dates : le
                collègue lit le sens choisi et le jour de chaque visite, sans
                ouvrir la liste ni refaire le tri. */}
            {triOuverts && listeAffichee.length > 0 && (
              <CopyTextButton
                build={() => [
                  t('dv.sortOpenedCopyHead').replace('{n}', String(listeAffichee.length)),
                  ...listeAffichee.map((row, rang) => {
                    const vu = openedAt[row.reference];
                    return `${rang + 1}. ${row.reference} — ${
                      vu ? t('dv.rowOpenedOn').replace('{date}', day(vu)) : t('dv.sortOpenedCopyNever')
                    }`;
                  }),
                ].join('\n')}
                label={t('dv.sortOpenedCopy')}
                hint={t('dv.sortOpenedCopyHint')}
                className="ghost-btn dvl-opened-order-copy"
              />
            )}
            {/* The reading can leave the screen as an address: a colleague
                opens the same state, the same late face, the same lines. */}
            <CopyTextButton
              build={buildShareHref}
              label={t('dv.shareCta')}
              hint={t('dv.shareHint')}
              className="ghost-btn"
            />
            <CsvExportButton
              total={visibles.length}
              ghost
              unit={t('dv.xlsxCountUnit')}
              label={t('dv.xlsxCta')}
              doneLabel={t('dv.xlsxDone')}
              run={() => {
                /* La lecture ouverte part avec le classeur : sa Synthèse la
                   nomme, et son nom de fichier l'annonce. */
                const lecture = rendusSeul
                  ? 'restored'
                  : partagesSeul
                    ? 'shared'
                    : adressesSeul
                      ? 'addressed'
                      : endormisSeul
                        ? 'dormant'
                        : endormisConfirmesSeul
                          ? 'dormantConfirmed'
                          : null;
                downloadDevisWorkbook(
                  buildDevisWorkbook({
                    rows: listeAffichee,
                    lang,
                    t,
                    filtre,
                    late: retard,
                    shared: shares,
                    forgotten: oublies ?? {},
                    restored: retablis ?? {},
                    reading: lecture,
                    /* L'ordre choisi pour les jetons de la répartition part
                       avec le classeur : ses lignes de marché suivent la
                       lecture de l'écran, devise par devise. */
                    deviseOrder: { dormant: ordreEndormis, confirmed: ordreConfirmes },
                  }),
                  filtre,
                  retard,
                  false,
                  lecture,
                  /* Le montant cumulé part avec le nom du fichier : un classeur
                     des endormis dit, avant d'être ouvert, ce qu'ils pèsent — et
                     celui des endormis confirmés dit ce que pèsent les devis
                     déjà prêts. */
                  lecture === 'dormant' || lecture === 'dormantConfirmed'
                    ? montantCumule(listeAffichee)
                    : '',
                  /* Et sur combien de marchés ce lot s'étend : le nom du
                     fichier le pose juste après le montant cumulé, pour qu'un
                     total ne se prenne pas pour une seule devise. */
                  lecture === 'dormant' || lecture === 'dormantConfirmed'
                    ? repartitionParDevise(listeAffichee).length
                    : 0,
                  /* Et son délai moyen, juste après le nombre de marchés : le
                     nom du fichier dit, avant d'être ouvert, depuis combien de
                     temps ce lot attend — lu sur les mêmes lignes et la même
                     horloge que le compteur et la Synthèse. */
                  lecture === 'dormant' || lecture === 'dormantConfirmed'
                    ? moyenneJours(listeAffichee)
                    : null,
                  /* Et le délai du lot endormi, quand le classeur est celui des
                     endormis confirmés : le nom rapporte alors les deux
                     moyennes — « 18-j-sur-24-j » — dès qu'elles diffèrent,
                     pour que le fichier dise la même chose que la Synthèse. */
                  lecture === 'dormantConfirmed' ? endormisMoyenne : null,
                  /* Et la part de l'attente que ce lot tient, posée dans le
                     nom juste après son délai moyen : la feuille s'annonce
                     par son temps et par son poids. C'est la même part que
                     la Synthèse nomme — celle du lot, lue sur les mêmes
                     lignes. */
                  lecture === 'dormant'
                    ? endormisPart
                    : lecture === 'dormantConfirmed'
                      ? endormisConfirmesPart
                      : '',
                  /* Et la part de tout le lot endormi, quand le classeur est
                     celui des endormis confirmés : le nom rapporte alors les
                     deux parts l'une à l'autre — « 18-pct-sur-32-pct » — dès
                     qu'elles diffèrent, comme la Synthèse les compare. */
                  lecture === 'dormantConfirmed' ? endormisPart : '',
                );
              }}
            />
          </div>
        </div>
      )}

      {/* The question before erasing: the count is named, and only the « shared
          on … » marks go — the addresses of the dossiers stay whole. */}
      {!loading && !error && oubliOuvert && shareCount > 0 && (
        <div className="dvl-forget" role="group" aria-label={t('dv.forgetShares')}>
          <i className="ri-eraser-line" aria-hidden="true"></i>
          <p>{t('dv.forgetSharesText').replace('{n}', String(shareCount))}</p>
          <button type="button" className="dvl-forget-yes" onClick={oublierLesPartages}>
            <i className="ri-check-line" aria-hidden="true"></i>
            {t('dv.forgetSharesYes')}
          </button>
          <button type="button" className="ghost-btn" onClick={() => setOubliOuvert(false)}>
            {t('dv.forgetSharesNo')}
          </button>
        </div>
      )}
      {!loading && !error && !oubliOuvert && oubliNote && shareCount === 0 && (
        <p className="dvl-forget-note" role="status">
          <i className="ri-check-double-line" aria-hidden="true"></i>
          <span>{oubliNote}</span>
        </p>
      )}

      {/* The visit came from an address a colleague handed over: the line says
          so, and counts the quotes on screen — a reader who did not do the
          clicks still knows exactly what he is looking at. */}
      {!loading && !error && shared && rows.length > 0 && (
        <p className="dvl-share-note" role="status">
          <i className="ri-link" aria-hidden="true"></i>
          <span>
            {refLue
              ? t('dv.sharedRefNote').replace('{ref}', refLue)
              : partagesSeul
                ? t('dv.sharedSharedNote').replace('{n}', String(visibles.length))
                : adressesSeul
                  ? t('dv.sharedAddressedNote').replace('{n}', String(visibles.length))
                  : endormisSeul
                    ? t('dv.sharedDormantNote').replace('{n}', String(visibles.length))
                    : endormisConfirmesSeul
                      ? t('dv.sharedDormantConfirmedNote').replace(
                          '{n}',
                          String(visibles.length),
                        )
                      : sansDureeSeul
                        ? t('dv.sharedNoDureeNote').replace('{n}', String(visibles.length))
                        : rythmeHeriteSeul
                          ? t('dv.sharedRythmeNote').replace('{n}', String(visibles.length))
                          : dureeSeule !== null
                            ? t('dv.sharedDureeNote')
                                .replace('{n}', String(dureeSeule))
                                .replace('{m}', String(visibles.length))
                            : t('dv.sharedNote').replace('{n}', String(visibles.length))}
          </span>
          <button
            type="button"
            className="dvl-share-note-x"
            title={t('dv.sharedNoteOff')}
            aria-label={t('dv.sharedNoteOff')}
            onClick={() => {
              setShared(false);
              /* The single-file reading goes with the note: hiding the reminder
                 must not leave the colleague stuck on one dossier. */
              setRefLue(null);
            }}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </p>
      )}

      {/* The grouped recap only exists in the « En retard » reading: one e-mail
          for all the files ticked below, never one mail per dossier. */}
      {!loading && !error && retard && visibles.length > 0 && (
        <div className="dvl-bulk">
          <span className="dvl-bulk-ico" aria-hidden="true">
            <i className="ri-mail-send-line"></i>
          </span>
          <div className="dvl-bulk-txt">
            <b>{t('dv.bulkTitle')}</b>
            <span>{t('dv.bulkHint')}</span>
            {/* The counter opened this bar: the line says what it is about, so
                the ticks are never a mystery. */}
            {jamaisSeul && (
              <span className="dvl-bulk-never">
                <i className="ri-mail-line" aria-hidden="true"></i>
                {t('dv.sumBulkNeverBulk').replace('{n}', String(selection.length))}
              </span>
            )}
          </div>
          <label className="dvl-bulk-all">
            <input type="checkbox" checked={tousChoisis} onChange={basculerTous} />
            <span>{tousChoisis ? t('dv.bulkNone') : t('dv.bulkAll')}</span>
          </label>
          <span className="dvl-bulk-count" aria-live="polite">
            {selection.length} {t('dv.bulkSelected')}
          </span>
          <button
            type="button"
            className="dvl-bulk-send"
            disabled={!selection.length || bulkBusy}
            onClick={() => void envoyerGroupe()}
          >
            <i className={bulkBusy ? 'ri-loader-4-line is-spin' : 'ri-mail-send-line'} aria-hidden="true"></i>
            {bulkBusy ? t('dv.bulkSending') : t('dv.bulkSend')}
          </button>
          {bulkNote && (
            <p className="dvl-resend-note" data-ok={bulkNote.ok ? 'yes' : 'no'} role="status">
              <i
                className={bulkNote.ok ? 'ri-check-double-line' : 'ri-error-warning-line'}
                aria-hidden="true"
              ></i>
              <span>{bulkNote.text}</span>
            </p>
          )}
          {/* Just after the send, the trace of what has just left: the workbook
              holds those very files, named by the day of the send — one click,
              and the group send is kept outside the site. */}
          {bulkNote?.ok && bulkTrace && (
            <div className="dvl-bulk-trace">
              <CsvExportButton
                total={bulkTrace.rows.length}
                ghost
                unit={t('dv.xlsxCountUnit')}
                label={t('dv.bulkXlsxCta')}
                doneLabel={t('dv.xlsxDone')}
                run={() =>
                  downloadDevisWorkbook(
                    buildDevisWorkbook({
                      rows: bulkTrace.rows,
                      lang,
                      t,
                      filtre,
                      late: retard,
                      scopeLabel: t('dv.bulkXlsxScope')
                        .replace('{n}', String(bulkTrace.rows.length))
                        .replace('{date}', day(bulkTrace.at)),
                      /* The trace names the files that left, one by one: the
                         summary closes on the references of that very send. */
                      withRefs: true,
                      shared: shares,
                      forgotten: oublies ?? {},
                      restored: retablis ?? {},
                    }),
                    filtre,
                    retard,
                    true,
                  )
                }
              />
              <p className="dvl-bulk-trace-note">{t('dv.bulkXlsxNote')}</p>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="acct-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('dv.listLoading')}
        </p>
      ) : error ? (
        <div className="capp-error">
          <p className="auth-note">{error}</p>
          <button type="button" className="ghost-btn" onClick={() => void load()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t('dv.listRetry')}
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="capp-empty">
          <i className="ri-file-list-3-line" aria-hidden="true"></i>
          <p>{t('dv.listEmpty')}</p>
          <Link to="/offres/devis" className="ghost-btn">
            <i className="ri-add-line" aria-hidden="true"></i>
            {t('dv.listCompose')}
          </Link>
        </div>
      ) : (
        <>
          {visibles.length === 0 ? (
            <div className="capp-empty">
              <i
                className={
                  refLue
                    ? 'ri-link-unlink'
                    : retard
                      ? 'ri-alarm-warning-line'
                      : partagesSeul
                        ? 'ri-share-forward-line'
                        : rendusSeul
                          ? 'ri-arrow-go-back-line'
                          : adressesSeul
                            ? 'ri-at-line'
                            : endormisSeul
                              ? 'ri-moon-line'
                              : endormisConfirmesSeul
                                ? 'ri-check-double-line'
                                : sansDureeSeul
                                  ? 'ri-calendar-close-line'
                                  : rythmeHeriteSeul
                                    ? 'ri-calendar-2-line'
                                    : dureeSeule !== null
                                      ? 'ri-calendar-check-line'
                                      : groupeSeul
                          ? 'ri-mail-send-line'
                          : jamaisSeul
                            ? 'ri-mail-line'
                            : 'ri-filter-off-line'
                }
                aria-hidden="true"
              ></i>
              <p>
                {refLue
                  ? t('dv.sharedRefNone').replace('{ref}', refLue)
                  : retard
                    ? t('dv.filterLateNone')
                    : partagesSeul
                      ? t('dv.filterSharedNone')
                      : rendusSeul
                        ? t('dv.filterRestoredNone')
                        : adressesSeul
                          ? t('dv.filterAddressedNone')
                          : endormisSeul
                            ? t('dv.filterDormantNone')
                            : endormisConfirmesSeul
                              ? t('dv.filterDormantConfirmedNone')
                              : sansDureeSeul
                                ? t('dv.filterNoDureeNone')
                                : rythmeHeriteSeul
                                  ? t('dv.filterRythmeNone')
                                  : dureeSeule !== null
                                    ? t('dv.filterDureeExactNone').replace(
                                        '{n}',
                                        String(dureeSeule),
                                      )
                                    : groupeSeul
                      ? t('dv.sumBulkNone')
                      : jamaisSeul
                        ? t('dv.sumBulkNeverNone')
                        : t('dv.filterNone')}
              </p>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  if (refLue) setRefLue(null);
                  else if (retard) basculerRetard();
                  else if (partagesSeul) basculerPartages();
                  else if (rendusSeul) basculerRendus();
                  else if (adressesSeul) basculerAdresses();
                  else if (endormisSeul) basculerEndormis();
                  else if (endormisConfirmesSeul) basculerEndormisConfirmes();
                  else if (sansDureeSeul) basculerSansDuree();
                  else if (rythmeHeriteSeul) basculerRythmeHerite();
                  else if (dureeSeule !== null) basculerDuree(dureeSeule);
                  else if (groupeSeul) basculerGroupe();
                  else if (jamaisSeul) basculerJamais();
                  else choisir('tous');
                }}
              >
                <i className="ri-refresh-line" aria-hidden="true"></i>
                {refLue
                  ? t('dv.sharedRefSeeAll')
                  : retard
                    ? t('dv.filterLateOff')
                    : partagesSeul
                      ? t('dv.filterSharedOff')
                      : rendusSeul
                        ? t('dv.filterRestoredOff')
                        : adressesSeul
                          ? t('dv.filterAddressedOff')
                          : endormisSeul
                            ? t('dv.filterDormantOff')
                            : endormisConfirmesSeul
                              ? t('dv.filterDormantConfirmedOff')
                              : sansDureeSeul
                                ? t('dv.filterNoDureeOff')
                                : rythmeHeriteSeul
                                  ? t('dv.filterRythmeOff')
                                  : dureeSeule !== null
                                    ? t('dv.filterDureeExactOff')
                                    : groupeSeul
                      ? t('dv.sumBulkOnlyOff')
                      : jamaisSeul
                        ? t('dv.sumBulkNeverOnlyOff')
                        : t('dv.filterAll')}
              </button>
            </div>
          ) : (
          <ul
            className="dvl-list"
            ref={listRef}
            tabIndex={0}
            aria-label={t('dv.listTitle')}
            onKeyDown={onListKey}
          >
            {listeAffichee.map((row) => {
              const etat = statutDevis(row.statut);
              const note = notes[row.reference];
              const sending = busy === row.reference;
              /* The day this dossier was handed to a colleague, when it was: the
                 line says so without anyone opening the workbook. */
              const shareAt = shares?.[row.reference];
              /* Le jour où ce dossier est revenu après un retrait : la ligne
                 porte la même pastille que celle du partage, du côté du
                 retour. */
              const restoredAt = retablis?.[row.reference]?.restoredAt;
              /* Le jour de la dernière visite de ce dossier, quand il y en a
                 une : la ligne dit d'elle-même quand elle a été consultée. */
              const openedOn = openedAt[row.reference];
              /* A file still « Reçu » after a week is worth a word: the visitor
                 knows where it stands without counting the days himself. */
              const age = ageInDays(row.created_at);
              const late = etat === 'recu' && age >= LATE_DAYS;
              return (
                <li
                  key={row.reference}
                  className={`dvl-row${keyedRef === row.reference ? ' is-keyed' : ''}${focusRef === row.reference ? ' is-focus' : ''}`}
                  data-ref={row.reference}
                  data-state={etat}
                  aria-current={keyedRef === row.reference ? 'true' : undefined}
                >
                  {retard && (
                    /* A tick says which late files the grouped recap will carry. */
                    <label className="dvl-pick">
                      <input
                        type="checkbox"
                        checked={choisis.includes(row.reference)}
                        onChange={() => basculerChoix(row.reference)}
                        aria-label={t('dv.bulkPickOne').replace('{ref}', row.reference)}
                      />
                    </label>
                  )}
                  <div className="dvl-row-main">
                    {/* One click on the reference opens the tracking page with
                        it already written in the field. */}
                    <Link
                      to={`/suivi?ref=${encodeURIComponent(row.reference)}`}
                      className="dvl-ref dvl-ref-link"
                      title={t('dv.followHint')}
                      onClick={() => noterOuverture(row.reference)}
                    >
                      <i className="ri-hashtag" aria-hidden="true"></i>
                      {row.reference}
                    </Link>
                    <div className="dvl-tags">
                      <span className="dvl-badge" data-state={etat}>
                        {t(`dv.st.${etat}`)}
                      </span>
                      {/* A dossier already handed over keeps its day beside the
                          state: what circulates is read at a glance. */}
                      {shareAt && (
                        <span className="dvl-shared" title={t('dv.rowSharedHint')}>
                          <i className="ri-share-forward-line" aria-hidden="true"></i>
                          {t('dv.rowSharedOn').replace('{date}', day(shareAt))}
                          {/* Effacer la marque de ce seul dossier, sans toucher
                              aux autres : le bouton vit dans la pastille. */}
                          <button
                            type="button"
                            className="dvl-shared-x"
                            title={t('dv.rowForgetShareHint')}
                            aria-label={t('dv.rowForgetShareHint')}
                            onClick={() => oublierUnPartage(row.reference)}
                          >
                            <i className="ri-close-line" aria-hidden="true"></i>
                            <span>{t('dv.rowForgetShare')}</span>
                          </button>
                        </span>
                      )}
                      {/* Le pendant de la pastille du partage : un dossier
                          revenu après un retrait dit, sur sa propre ligne, le
                          jour de son retour — sans ouvrir le classeur. */}
                      {restoredAt && (
                        <span className="dvl-shared dvl-restored" title={t('dv.rowRestoredHint')}>
                          <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                          {t('dv.rowRestoredOn').replace('{date}', day(restoredAt))}
                        </span>
                      )}
                      {/* Le dossier déjà consulté le dit à voix basse, sur sa
                          propre ligne : le jour de la dernière visite, sans
                          ouvrir le dossier pour s'en souvenir. */}
                      {openedOn && (
                        <span className="dvl-opened-on" title={t('dv.rowOpenedHint')}>
                          <i className="ri-eye-line" aria-hidden="true"></i>
                          {t('dv.rowOpenedOn').replace('{date}', day(openedOn))}
                        </span>
                      )}
                    </div>
                    <h3 className="dvl-plan">
                      {row.formule || t('dv.acctTitle')}
                      {row.etablissements ? (
                        <em>
                          {row.etablissements} {t('dv.listSites')}
                        </em>
                      ) : null}
                    </h3>
                    <p className="dvl-meta">
                      {row.marche && (
                        <span>
                          <i className="ri-map-pin-line" aria-hidden="true"></i>
                          {row.marche}
                        </span>
                      )}
                      {row.rythme && (
                        <span>
                          <i className="ri-calendar-line" aria-hidden="true"></i>
                          {row.rythme}
                          {/* Le rythme exact qui a produit cette durée : la
                              ligne dit combien de mois ont été écrits, et
                              depuis quel réglage — sans ouvrir le dossier. */}
                          {estRythmeHerite(row) && (
                            <button
                              type="button"
                              className="dvl-rythme-herite dvl-rythme-herite-door"
                              aria-pressed={dureeSeule === moisDuRythme(row.rythme)}
                              title={`${t('dv.rowRythmeHeriteHint')
                                .replace('{n}', String(moisDuRythme(row.rythme) ?? 0))
                                .replace('{duree}', rythmeRetenuLabel)
                                .replace('{m}', String(moisRetenus))} — ${t(
                                'dv.rowRythmeHeriteDoorHint'
                              ).replace('{n}', String(moisDuRythme(row.rythme) ?? 0))}`}
                              onClick={() => {
                                const mois = moisDuRythme(row.rythme);
                                if (mois !== null) basculerDuree(mois);
                              }}
                            >
                              <i className="ri-history-line" aria-hidden="true"></i>
                              {t('dv.rowRythmeHerite').replace(
                                '{n}',
                                String(moisDuRythme(row.rythme) ?? 0),
                              )}
                            </button>
                          )}
                        </span>
                      )}
                      <span>
                        <i className="ri-send-plane-line" aria-hidden="true"></i>
                        {t('dv.listSentOn')} {day(row.created_at)}
                      </span>
                      {row.relance_envoyee_at && (
                        <span>
                          <i className="ri-notification-3-line" aria-hidden="true"></i>
                          {t('dv.relanceOn')} {day(row.relance_envoyee_at)}
                        </span>
                      )}
                      {/* The grouped recap that already carried this file: the
                          date it left, so the badge never means « maybe ». */}
                      {row.recap_groupe_at && (
                        <span className="dvl-recap" title={t('dv.recapGroupHint')}>
                          <i className="ri-mail-send-line" aria-hidden="true"></i>
                          {t('dv.recapGroupOn')} {day(row.recap_groupe_at)}
                        </span>
                      )}
                      {/* What the requester has already received: the date of the
                          last state message, and which state it announced. */}
                      <span className="dvl-notified" data-had={row.statut_notifie_at ? 'yes' : 'no'}>
                        <i
                          className={row.statut_notifie_at ? 'ri-mail-check-line' : 'ri-mail-line'}
                          aria-hidden="true"
                        ></i>
                        {row.statut_notifie_at
                          ? `${t('dv.notifiedOn')} ${day(row.statut_notifie_at)}${
                              row.statut_notifie
                                ? ` · ${t(`dv.st.${statutDevis(row.statut_notifie)}`)}`
                                : ''
                            }`
                          : t('dv.notifiedNone')}
                      </span>
                    </p>
                    {late && (
                      /* The remark is also the door: one click opens the very
                         file it talks about, on the tracking page. */
                      <Link
                        to={`/suivi?ref=${encodeURIComponent(row.reference)}`}
                        className="dvl-remind"
                        data-sent={row.relance_envoyee_at ? 'yes' : 'no'}
                        title={t('dv.remindOpen')}
                      >
                        <i
                          className={row.relance_envoyee_at ? 'ri-notification-3-line' : 'ri-alarm-warning-line'}
                          aria-hidden="true"
                        ></i>
                        <span>
                          {row.relance_envoyee_at
                            ? t('dv.remindSent').replace('{date}', day(row.relance_envoyee_at))
                            : t('dv.remindLate').replace('{days}', String(age))}
                        </span>
                        <i className="ri-arrow-right-line dvl-remind-go" aria-hidden="true"></i>
                      </Link>
                    )}
                  </div>
                  <div className="dvl-amount">
                    <span>{t('dv.listTotal')}</span>
                    <strong>{row.montant_total || row.montant_mensuel || '—'}</strong>
                    {row.montant_mensuel && row.montant_total !== row.montant_mensuel && (
                      <em>{row.montant_mensuel}</em>
                    )}
                  </div>
                  <div className="dvl-row-actions">
                    <button
                      type="button"
                      className="dvl-resend"
                      disabled={sending}
                      onClick={() => void renvoyer(row.reference)}
                    >
                      <i
                        className={sending ? 'ri-loader-4-line is-spin' : 'ri-mail-send-line'}
                        aria-hidden="true"
                      ></i>
                      {sending ? t('dv.resending') : t('dv.resend')}
                    </button>
                    <Link
                      to={`/suivi?ref=${encodeURIComponent(row.reference)}`}
                      className="dvl-resend dvl-follow"
                      title={t('dv.followHint')}
                      onClick={() => noterOuverture(row.reference)}
                    >
                      <i className="ri-route-line" aria-hidden="true"></i>
                      {t('dv.follow')}
                    </Link>
                    {/* One dossier handed over to a colleague: the address of
                        this very reading, narrowed to that one reference. */}
                    <CopyTextButton
                      build={() => shareHref(row.reference)}
                      label={t('dv.rowShare')}
                      hint={t('dv.rowShareHint').replace('{ref}', row.reference)}
                      className="dvl-resend dvl-share-row"
                      /* Only a copy that really reached the clipboard marks the
                         dossier: a failed one leaves the sheet untouched. */
                      onCopied={() => {
                        if (!user) return;
                        const key = shareKey(user.id);
                        setShares(markShared(key, row.reference));
                        /* Un dossier repartagé n'est plus un dossier rétabli :
                           la trace du retour s'efface avec la nouvelle marque. */
                        setRetablis(readRestored(key));
                        setOubliNote('');
                      }}
                    />
                    {note && (
                      <p className="dvl-resend-note" data-ok={note.ok ? 'yes' : 'no'} role="status">
                        <i
                          className={note.ok ? 'ri-check-double-line' : 'ri-error-warning-line'}
                          aria-hidden="true"
                        ></i>
                        <span>{note.text}</span>
                        {/* Une marque effacée peut revenir, avec le jour où ce
                            dossier avait été partagé — ce seul dossier. */}
                        {oublies?.[row.reference] && (
                          <button
                            type="button"
                            className="dvl-restore"
                            title={t('dv.rowRestoreShareHint')}
                            onClick={() => restaurerUnPartage(row.reference)}
                          >
                            <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                            {t('dv.rowRestoreShare')}
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          )}
          {listeAffichee.length > 1 && (
            <p className="doss-keyhint dvl-keyhint">
              <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
              {t('dv.listKey')}
            </p>
          )}
          {/* Combien de devis sont vraiment passés sous les flèches : le geste
              laisse une trace chiffrée au lieu d'un simple rappel — et le
              chiffre est une porte, qui rouvre la dernière fiche parcourue. */}
          {walked.length > 0 && (
            <button
              type="button"
              className="doss-keyhint dvl-keyhint dvl-walked"
              aria-live="polite"
              title={t('dv.keyWalkOpen').replace('{ref}', walked[walked.length - 1])}
              onClick={reopenLastWalked}
            >
              <i className="ri-footprint-line" aria-hidden="true"></i>
              <span>{t('dv.keyWalk').replace('{n}', String(walked.length))}</span>
              <i className="ri-arrow-right-line dvl-walked-go" aria-hidden="true"></i>
            </button>
          )}
          {/* Combien de dossiers ont été ouverts depuis que la fiche a été
              rappelée au clavier : la trace du rappel se lit, au lieu de
              rester un geste sans lendemain. */}
          {walkRecall && (
            <div className="dvl-opened-wrap">
              <p
                className="doss-keyhint dvl-keyhint dvl-opened"
                title={t('dv.keyOpenedHint').replace('{ref}', walkRecall)}
              >
                <i className="ri-route-line" aria-hidden="true"></i>
                <span>{t('dv.keyOpened').replace('{n}', String(walkOpened.length))}</span>
              </p>
              {/* Le compte se joint à un message : il se copie en texte, un
                  dossier par référence, pour l'envoyer à un collègue. */}
              <CopyTextButton
                build={() => [
                  t('dv.keyOpenedCopyHead')
                    .replace('{ref}', walkRecall)
                    .replace('{n}', String(walkOpened.length)),
                  ...walkOpened.map((ref) => `- ${ref}`),
                ].join('\n')}
                label={t('dv.keyOpenedCopy')}
                hint={t('dv.keyOpenedCopyHint').replace('{ref}', walkRecall)}
                className="dvl-opened-copy"
              />
            </div>
          )}
          <div className="dvl-foot">
            <div className="dvl-foot-notes">
              <p className="dvl-note">
                <i className="ri-information-line" aria-hidden="true"></i>
                <span>{t('dv.listNote')}</span>
              </p>
              <p className="dvl-note">
                <i className="ri-notification-3-line" aria-hidden="true"></i>
                <span>{t('dv.lastRelance')}</span>
              </p>
            </div>
            <Link to="/offres/devis" className="ghost-btn">
              <i className="ri-add-line" aria-hidden="true"></i>
              {t('dv.listCompose')}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}