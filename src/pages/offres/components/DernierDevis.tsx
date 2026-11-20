import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { supabase } from '@/lib/supabase';
import { statutDevis } from '@/lib/devis';
import {
  deviseDeLigne,
  montantCumule,
  partMontantCumule,
  partPreteParDevise,
  repartitionParDevise,
} from '@/lib/devisMontant';
import { readDevisFiltre, saveDevisFiltre, type DevisFiltre } from '@/lib/devisFiltre';
import { bulkKey, saveLastBulk } from '@/pages/compte/components/devisBulkMemory';
import {
  forgetShared,
  markShared,
  readForgotten,
  readRestored,
  readShares,
  restoreShared,
  shareKey,
  type ForgottenMarks,
  type RestoredMarks,
  type ShareMarks,
} from '@/pages/compte/components/devisShareMemory';
import { readSortRecent, saveSortRecent, sortRecentKey } from '@/pages/compte/components/devisViewMemory';
import {
  devisAccountHref,
  devisAddressedHref,
  devisDormantConfirmedHref,
  devisDormantHref,
  devisNoDureeHref,
  devisRestoredHref,
  devisRowHref,
  devisRythmeHeriteHref,
  devisSharedHref,
} from '@/lib/b2bLinks';
import { useFacturation } from '@/hooks/useFacturation';
import CopyTextButton from '@/components/feature/CopyTextButton';
import DormantDeviseSplit from '@/pages/compte/components/DormantDeviseSplit';
import '@/styles/devis.css';

/** One file as the strip reads it: enough to recognise it, nothing more. */
type Dernier = {
  reference: string;
  formule: string | null;
  etablissements: number | null;
  marche: string | null;
  /** La durée retenue, écrite au moment de l'envoi : « Semestre · 6 mois ». */
  rythme: string | null;
  montant_total: string | null;
  montant_mensuel: string | null;
  /** La devise écrite avec le montant : le cumul des endormis la garde. */
  devise: string | null;
  statut: string | null;
  created_at: string;
  relance_envoyee_at: string | null;
  /** The day the last grouped recap carried this file — null when none did. */
  recap_groupe_at: string | null;
};

const HIDDEN_KEY = 'paperatlas:devis-last-hidden';
/** The same week as the account list and the automatic reminder. */
const LATE_DAYS = 7;
/** A grouped recap sent inside this window is still fresh: the button offers
 *  a resend instead of a first send. */
const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

function ageInDays(iso: string) {
  const at = new Date(iso).getTime();
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((Date.now() - at) / (24 * 60 * 60 * 1000)));
}

/** Le délai écoulé depuis un jour donné : la bulle des marques retirées situe
 *  ainsi chaque retrait, sans ouvrir le classeur. */
function daysSince(iso: string) {
  return ageInDays(iso);
}

const readHidden = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(HIDDEN_KEY) ?? '';
  } catch {
    return '';
  }
};

/**
 * The discreet strip at the top of « Offres »: a signed-in visitor who has
 * already sent a quote sees which one, for how much, and where it stands —
 * without having to open « Mon compte » to remember. No session, no strip.
 *
 * The strip can be read through one state at a time: the chips narrow it to
 * the newest file still received, under review, confirmed or expired, and the
 * same choice is kept for « Mon compte ».
 */
export default function DernierDevis() {
  const { user, loading } = useAuth();
  const { t, lang } = useLang();
  /* Le rythme retenu sur cet appareil : la bande y rapporte les durées écrites
     dans les dossiers, pour repérer d'un regard celles qui viennent d'un
     réglage plus ancien. */
  const { facturation } = useFacturation();
  const [rows, setRows] = useState<Dernier[]>([]);
  /* Les dossiers de ce rappel déjà confiés à un collègue, lus dans la mémoire
     du compte : la bande dit d'un coup d'œil ce qui circule déjà. */
  const [shares, setShares] = useState<ShareMarks>();
  /* Les marques de ce compte qui ont été retirées : la bande les rappelle et
     propose de les rendre, sans ouvrir la liste. */
  const [oublies, setOublies] = useState<ForgottenMarks>();
  /* Les dossiers revenus après un retrait : le même rappel que du côté des
     marques retirées, mais avec le jour du dernier retour. */
  const [rendus, setRendus] = useState<RestoredMarks>();
  /* L'ordre « partagé récemment », lu dans la mémoire du compte : la bande et
     la liste des devis s'ouvrent dans le même sens. */
  const [triRecents, setTriRecents] = useState(false);
  const [filtre, setFiltre] = useState<DevisFiltre>(readDevisFiltre);
  const [hidden, setHidden] = useState(readHidden);
  /* The grouped recap can leave from the strip itself: one e-mail for every
     file left unanswered past a week, without opening the account. */
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkNote, setBulkNote] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setRows([]);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('devis-abonnement', {
          body: { action: 'latest' },
        });
        if (error) return;
        const answer = data as { ok?: boolean; devis?: Dernier | null; recent?: Dernier[] } | null;
        if (!alive || !answer?.ok) return;
        if (Array.isArray(answer.recent)) setRows(answer.recent);
        else if (answer.devis) setRows([answer.devis]);
        else setRows([]);
      } catch {
        /* silent: a strip that fails simply does not appear */
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [user]);

  /* La mémoire des partages suit le compte : elle se relit à chaque changement
     de membre, jamais une fois pour toutes. */
  useEffect(() => {
    setShares(user ? readShares(shareKey(user.id)) : {});
    setOublies(user ? readForgotten(shareKey(user.id)) : {});
    setRendus(user ? readRestored(shareKey(user.id)) : {});
    /* L'ordre suit le compte, comme dans « Mon compte » : un membre qui a trié
       sa liste retrouve la bande dans le même ordre. */
    setTriRecents(user ? readSortRecent(sortRecentKey(user.id)) : false);
  }, [user]);

  const choisir = (next: DevisFiltre) => {
    setFiltre(next);
    saveDevisFiltre(next);
  };

  /* L'ordre « partagé récemment » se choisit aussi d'ici : la bande et la liste
     lisent la même mémoire, donc elles s'ouvrent dans le même sens. */
  const basculerTri = () => {
    if (!user) return;
    const next = !triRecents;
    setTriRecents(next);
    saveSortRecent(sortRecentKey(user.id), next);
  };

  const masquer = () => {
    const newest = rows[0];
    if (!newest) return;
    setHidden(newest.reference);
    try {
      window.localStorage.setItem(HIDDEN_KEY, newest.reference);
    } catch {
      /* storage unavailable — the strip is simply hidden for this visit */
    }
  };

  const day = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(date);
  };

  /* The counters are counted on the rows this strip received, never elsewhere:
     a chip can never promise a file it cannot show. */
  const tally: Record<DevisFiltre, number> = {
    tous: rows.length,
    recu: 0,
    en_etude: 0,
    confirme: 0,
    expire: 0,
  };
  rows.forEach((entry) => {
    const etat = statutDevis(entry.statut);
    if (etat === 'recu' || etat === 'en_etude' || etat === 'confirme' || etat === 'expire') {
      tally[etat] += 1;
    }
  });

  const chips: Array<{ key: DevisFiltre; label: string }> = [
    { key: 'tous', label: t('dv.filterAll') },
    { key: 'recu', label: t('dv.st.recu') },
    { key: 'en_etude', label: t('dv.st.en_etude') },
    { key: 'confirme', label: t('dv.st.confirme') },
    { key: 'expire', label: t('dv.st.expire') },
  ];

  /* Le même ordre que la liste : les dossiers qui viennent de circuler d'abord,
     du partage le plus récent au plus ancien. La bande et « Mon compte »
     désignent donc le même dernier devis. */
  const ordonnees = triRecents
    ? [...rows].sort((a, b) => {
        const at = shares?.[a.reference];
        const bt = shares?.[b.reference];
        if (at && bt) return new Date(bt).getTime() - new Date(at).getTime();
        if (at) return -1;
        if (bt) return 1;
        return 0;
      })
    : rows;

  /* One state at a time: « Tous » keeps the newest file, the others take the
     newest file still in that state. */
  const row =
    filtre === 'tous'
      ? ordonnees[0] ?? null
      : ordonnees.find((entry) => statutDevis(entry.statut) === filtre) ?? null;

  /* Late files, read on every row the strip received: the grouped recap is
     about the whole wait, not only the state on screen. */
  const enRetard = rows.filter(
    (entry) => statutDevis(entry.statut) === 'recu' && ageInDays(entry.created_at) >= LATE_DAYS,
  );

  /* The most recent grouped recap that already carried one of these late files.
     Inside the last week it turns the button into a resend, so the same summary
     is never sent twice without the reader knowing. */
  const dernierGroupe = enRetard.reduce((latest, entry) => {
    if (!entry.recap_groupe_at) return latest;
    const at = new Date(entry.recap_groupe_at).getTime();
    return Number.isFinite(at) && at > latest ? at : latest;
  }, 0);
  const recapRecent = dernierGroupe > 0 && Date.now() - dernierGroupe < RECENT_MS;

  /* Late files no grouped recap has ever carried: the wait is not only long,
     nobody has ever gathered them in one message. That is worth saying before
     the button is pressed, not after. */
  const jamaisGroupe = enRetard.filter((entry) => !entry.recap_groupe_at);

  /* Les dossiers de ce rappel ouverts avant que la durée retenue soit
     conservée : la bande les compte d'un seul regard, sans ouvrir chaque
     devis pour découvrir lequel n'a rien écrit à cet endroit. */
  const sansDureeRows = rows.filter((entry) => !entry.rythme);
  const sansDureeCount = sansDureeRows.length;

  /* Ce que la lecture « sans durée » emporte quand elle se copie : son compte,
     puis chaque dossier avec l’adresse qui l’ouvre — le collègue reçoit la
     lecture entière, sans avoir à ouvrir la liste ni à refaire le filtre. */
  const sansDureeTexte = () =>
    [
      t('dv.lastNoDureeCopyLead')
        .replace('{n}', String(sansDureeCount))
        .replace('{total}', String(rows.length)),
      ...sansDureeRows.map((entry) =>
        t('dv.lastNoDureeCopyRow')
          .replace('{ref}', entry.reference)
          .replace('{lien}', devisRowHref(entry.reference, lang)),
      ),
      t('dv.lastNoDureeCopyNote'),
    ].join('\n');

  /* Ce que chaque durée enregistrée retient : « Semestre · 6 mois » porte son
     nombre de mois. C'est ce nombre qui se compare au rythme de l'appareil, et
     non le mot de la formule, écrit dans la langue du jour de l'envoi. */
  const moisDuRythme = (rythme: string | null): number | null => {
    if (!rythme) return null;
    const trouve = rythme.match(/(\d+)/);
    if (!trouve) return null;
    const mois = Number(trouve[1]);
    return Number.isFinite(mois) && mois > 0 ? mois : null;
  };
  const moisRetenus = facturation === 'annee' ? 12 : 1;
  const rythmeHeriteRows = rows.filter((entry) => {
    const mois = moisDuRythme(entry.rythme);
    return mois !== null && mois !== moisRetenus;
  });
  const rythmeHeriteCount = rythmeHeriteRows.length;
  const rythmeRetenuLabel =
    facturation === 'annee' ? t('ofj.rythmeAnnee') : t('ofj.rythmeMois');

  /* Ce que la lecture des durées héritées emporte quand elle se copie : son
     compte, puis chaque dossier avec le nombre de mois qui l’a produit et
     l’adresse qui l’ouvre — le collègue reçoit la lecture entière, sans ouvrir
     la liste ni refaire le filtre. */
  const rythmeHeriteTexte = () =>
    [
      t('dv.lastRythmeDiffCopyLead')
        .replace('{n}', String(rythmeHeriteCount))
        .replace('{total}', String(rows.length)),
      ...rythmeHeriteRows.map((entry) =>
        t('dv.lastRythmeDiffCopyRow')
          .replace('{ref}', entry.reference)
          .replace('{mois}', String(moisDuRythme(entry.rythme) ?? 0))
          .replace('{lien}', devisRowHref(entry.reference, lang)),
      ),
      t('dv.lastRythmeDiffCopyNote').replace('{duree}', rythmeRetenuLabel),
    ].join('\n');

  /* Les dossiers de ce rappel déjà transmis à un collègue : comptés sur les
     mêmes lignes que celles affichées, jamais ailleurs. */
  const partagesCount = rows.filter((entry) => Boolean(shares?.[entry.reference])).length;

  /* Le même compte, mais pour la seule lecture « jamais repris » : ses propres
     dossiers partagés, donc un nombre distinct de celui de toute la bande.
     C'est ce nombre-là que son adresse emporte, pour que les deux lectures ne
     s'annoncent jamais l'une à la place de l'autre. */
  const jamaisPartagesCount = rows.filter(
    (entry) => !entry.recap_groupe_at && Boolean(shares?.[entry.reference]),
  ).length;

  /* Les dossiers partagés qui n'ont jamais été retirés : la pastille des
     partages ne compte plus qu'eux. Les dossiers revenus après un retrait ont
     leur propre pastille, donc les deux nombres ne se recoupent jamais — la
     bande n'annonce pas deux fois le même dossier. */
  const partagesSimplesCount = rows.filter(
    (entry) => Boolean(shares?.[entry.reference]) && !rendus?.[entry.reference],
  ).length;

  /* Le jour du dernier partage parmi ces seuls dossiers-là : la date de la
     pastille parle du même lot que son compteur. */
  const dernierPartageSimpleAt = rows.reduce<string | null>((latest, entry) => {
    if (!shares?.[entry.reference] || rendus?.[entry.reference]) return latest;
    const at = shares[entry.reference];
    if (!latest) return at;
    return new Date(at).getTime() > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Les dossiers de ce rappel dont la marque a été retirée : la trace du
     retrait est la preuve du partage, et le jour qu'elle porte est celui qui
     revient. Comptés sur les mêmes lignes que le compteur des partages. */
  const refsOubliees = rows
    .filter((entry) => Boolean(oublies?.[entry.reference]))
    .map((entry) => entry.reference);
  const oubliesCount = refsOubliees.length;

  /* Chaque marque retirée de ce rappel, avec le jour de son retrait et le délai
     écoulé depuis : la bulle les nomme une par une, et ne promet rien d'autre
     que ce qu'elle montre. */
  const marquesRetirees = refsOubliees.reduce<Array<{ reference: string; retrait: string }>>(
    (kept, reference) => {
      const trace = oublies?.[reference];
      if (trace) kept.push({ reference, retrait: trace.forgottenAt });
      return kept;
    },
    [],
  );

  /* Les dossiers de ce rappel dont la marque est encore posée : le geste
     inverse de « Rétablir » s'appuie sur les mêmes lignes. */
  const refsPartagees = rows
    .filter((entry) => Boolean(shares?.[entry.reference]))
    .map((entry) => entry.reference);

  /* Les dossiers de ce rappel revenus après un retrait : la bande compte les
     mêmes lignes que la liste, et ne promet rien d'autre que ce qu'elle montre. */
  const rendusCount = rows.filter((entry) => Boolean(rendus?.[entry.reference])).length;

  /* Le troisième compte, celui qui ferme la ventilation : les dossiers munis de
     leur adresse mais jamais transmis. Comme dans le classeur, les trois se
     lisent côte à côte sans se recouper — ni partagé, ni rendu. */
  const adressesCount = rows.filter(
    (entry) => !shares?.[entry.reference] && !rendus?.[entry.reference],
  ).length;

  /* Les dossiers que la lecture « seulement adressés » emporte : les mêmes
     lignes que son compteur, et rien d'autre. */
  const adressesRows = rows.filter(
    (entry) => !shares?.[entry.reference] && !rendus?.[entry.reference],
  );

  /* Ce qu'elle emporte quand elle se copie : son compte, puis chaque dossier
     avec l'adresse qui l'ouvre — le collègue reçoit la lecture entière, sans
     ouvrir la liste ni refaire le filtre. Rien ne se copie quand le lot est
     vide, puisque la gélule ne paraît pas. */
  const adressesTexte = () =>
    [
      t('dv.lastAddressedCopyLead')
        .replace('{n}', String(adressesCount))
        .replace('{total}', String(rows.length)),
      ...adressesRows.map((entry) =>
        t('dv.lastAddressedCountCopyRow')
          .replace('{ref}', entry.reference)
          .replace('{lien}', devisRowHref(entry.reference, lang)),
      ),
      t('dv.lastAddressedCountCopyNote'),
    ].join('\n');

  /* Ceux qui dorment, comptés sur les mêmes lignes : seulement adressés, et en
     attente depuis plus d'une semaine. Leur lecture se copie d'ici, à côté de
     celle des seuls adressés — le collègue ouvre ces dossiers-là. */
  const endormisRows = rows.filter(
    (entry) =>
      !shares?.[entry.reference] &&
      !rendus?.[entry.reference] &&
      ageInDays(entry.created_at) > LATE_DAYS,
  );
  const endormisCount = endormisRows.length;

  /* Le montant cumulé des devis encore endormis, posé à côté de leur compteur :
     la bande dit combien dorment, et ce que ces devis pèsent ensemble. */
  const endormisMontant = montantCumule(endormisRows);

  /* Et la part de l'attente entière que ces devis portent : le même
     pourcentage que la pastille de l'en-tête de « Mon compte », pour que les
     deux écrans lisent la même proportion. Il ne s'écrit que si les deux côtés
     parlent d'une seule et même devise. */
  const endormisPart = partMontantCumule(endormisRows, rows);

  /* Le plus ancien des dossiers qui dorment : la date où l'attente la plus
     longue a commencé. La pastille la pose à côté de son compteur, comme celle
     de l'en-tête — depuis quand cela dort se lit sans ouvrir la liste. */  const endormisOldestAt = rows.reduce<string | null>((oldest, entry) => {
    if (shares?.[entry.reference] || rendus?.[entry.reference]) return oldest;
    if (ageInDays(entry.created_at) <= LATE_DAYS) return oldest;
    if (!oldest) return entry.created_at;
    return new Date(entry.created_at).getTime() < new Date(oldest).getTime()
      ? entry.created_at
      : oldest;
  }, null);

  /* La répartition du lot endormi par marché, et le délai moyen de chacun : la
     bande nomme, à côté de la moyenne du lot, le marché qui attend le plus
     longtemps — la même lecture que la Synthèse de « Mon compte ». Un marché
     sans délai lisible n'entre pas dans la comparaison. */
  const endormisRepartition = repartitionParDevise(endormisRows);
  const delaisEndormis = (() => {
    const map = new Map<string, { somme: number; n: number }>();
    endormisRows.forEach((entry) => {
      const devise = deviseDeLigne(entry);
      if (!devise) return;
      const garde = map.get(devise) ?? { somme: 0, n: 0 };
      map.set(devise, { somme: garde.somme + ageInDays(entry.created_at), n: garde.n + 1 });
    });
    return map;
  })();
  const marcheEndormiPlusLong = endormisRepartition.reduce<{
    devise: string;
    jours: number;
  } | null>((plusLong, entry) => {
    const garde = delaisEndormis.get(entry.devise);
    if (!garde || garde.n <= 0) return plusLong;
    const jours = Math.round(garde.somme / garde.n);
    if (!plusLong || jours > plusLong.jours) return { devise: entry.devise, jours };
    return plusLong;
  }, null);

  /* Parmi ces dossiers qui dorment, ceux dont le devis est déjà confirmé : le
     devis est prêt, l'envoi manque. Comptés sur les mêmes lignes que la
     pastille des endormis, juste à côté d'elle. */
  const endormisConfirmesRows = rows.filter(
    (entry) =>
      !shares?.[entry.reference] &&
      !rendus?.[entry.reference] &&
      ageInDays(entry.created_at) > LATE_DAYS &&
      statutDevis(entry.statut) === 'confirme',
  );
  const endormisConfirmesCount = endormisConfirmesRows.length;

  /* Ce que ces devis-là pèsent, pour la comparaison posée à côté de leur délai
     moyen : le montant est lu sur ces seules lignes, jamais sur une
     estimation — et il n'est comparé qu'à un montant vraiment lisible. */
  const endormisConfirmesMontant = montantCumule(endormisConfirmesRows);

  /* Et la part que ces devis prêts tiennent dans toute la liste de devis,
     rapportée à celle du lot endormi : les deux pourcentages parlent du même
     tout, donc ils se comparent — « 18 % sur 32 % ». Rien ne s'écrit quand
     l'un des deux côtés ne parle pas d'une seule et même devise. */
  const endormisConfirmesPartListe = partMontantCumule(endormisConfirmesRows, rows);

  /* Et la part déjà prête de chaque marché, sous la pastille : parmi les dossiers
     endormis d'une devise, ceux dont le devis est déjà tranché. C'est exactement
     la répartition que la Synthèse de « Mon compte » déroule sous sa ligne —
     les deux écrans lisent donc le même détail, marché par marché. Rien ne
     s'écrit quand le lot ne mêle qu'une devise. */
  const endormisConfirmesParDevise = partPreteParDevise(
    endormisConfirmesRows,
    endormisRows,
  );

  /* Le délai moyen de chaque marché, lu sur les lignes de ce marché-là
     seulement : la même clé et la même horloge que la Synthèse de « Mon
     compte », donc les trois écrans disent le même temps — marché par marché.
     Rien ne s'écrit pour un marché dont aucun montant n'est lisible. */
  const delaisConfirmes = (() => {
    const map = new Map<string, { somme: number; n: number }>();
    endormisConfirmesRows.forEach((entry) => {
      const devise = deviseDeLigne(entry);
      if (!devise) return;
      const garde = map.get(devise) ?? { somme: 0, n: 0 };
      map.set(devise, { somme: garde.somme + ageInDays(entry.created_at), n: garde.n + 1 });
    });
    return map;
  })();
  const delaiDuMarche = (devise: string): number | null => {
    const garde = delaisConfirmes.get(devise);
    if (!garde || garde.n <= 0) return null;
    return Math.round(garde.somme / garde.n);
  };

  /* Le délai moyen de ces dossiers-là, posé à côté de leur compteur : le nombre
     dit combien dorment avec un devis déjà prêt, la moyenne dit depuis combien
     de temps. Rien n'est écrit quand il n'y en a aucun. */
  const endormisConfirmesMoyenne =
    endormisConfirmesCount > 0
      ? Math.round(
          endormisConfirmesRows.reduce(
            (total, entry) => total + ageInDays(entry.created_at),
            0,
          ) / endormisConfirmesCount,
        )
      : null;

  /* Et la moyenne de toute l'attente, lue sur les mêmes lignes : la bande
     rapporte le délai des devis prêts à celui de tous les endormis, comme
     elle rapporte déjà leur montant au leur. Rien ne s'écrit quand le lot est
     vide — une moyenne sans dossier ne dirait rien. */
  const endormisMoyenne =
    endormisCount > 0
      ? Math.round(
          endormisRows.reduce((total, entry) => total + ageInDays(entry.created_at), 0) /
            endormisCount,
        )
      : null;

  /* Le jour du dernier retour de ce rappel : la pastille le pose à côté du
     compteur, pour que le nombre dise combien et la date dise quand. */
  const dernierRetourAt = rows.reduce<string | null>((latest, entry) => {
    const at = rendus?.[entry.reference]?.restoredAt;
    if (!at) return latest;
    if (!latest) return at;
    return new Date(at).getTime() > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Le jour du dernier dossier resté seulement adressé : celui de son entrée
     dans le lot, puisque son adresse n'a jamais été confiée à personne. La
     pastille le pose à côté de son compteur, comme celles des partages et des
     retours. */
  const dernierAdresseAt = rows.reduce<string | null>((latest, entry) => {
    if (shares?.[entry.reference] || rendus?.[entry.reference]) return latest;
    const at = entry.created_at;
    if (!at) return latest;
    if (!latest) return at;
    return new Date(at).getTime() > new Date(latest).getTime() ? at : latest;
  }, null);

  /* Rendre ces marques-là, chacune avec le jour où son dossier avait été
     partagé — jamais celui du jour. */
  const restaurerOublies = () => {
    if (!user || refsOubliees.length === 0) return;
    const key = shareKey(user.id);
    refsOubliees.forEach((reference) => {
      restoreShared(key, reference);
    });
    setShares(readShares(key));
    setOublies(readForgotten(key));
    /* Les marques rendues sont relues tout de suite : le rappel des dossiers
       rendus et sa date suivent le geste, sans recharger la page. */
    setRendus(readRestored(key));
  };

  /* Le geste inverse de « Rétablir » : retirer la marque des dossiers de ce
     rappel qui circulent déjà. La trace du retrait est écrite, donc la Synthèse
     du classeur compte ces lignes à côté des rétablies. */
  const oublierPartages = () => {
    if (!user || refsPartagees.length === 0) return;
    const key = shareKey(user.id);
    refsPartagees.forEach((reference) => {
      forgetShared(key, reference);
    });
    const restant = readShares(key);
    setShares(restant);
    setOublies(readForgotten(key));
    setRendus(readRestored(key));
    /* Plus rien ne circule dans ce rappel : l'ordre n'a plus rien à remonter. */
    if (Object.keys(restant).length === 0 && triRecents) {
      setTriRecents(false);
      saveSortRecent(sortRecentKey(user.id), false);
    }
  };

  /* Its exact mirror, counted on the very same late files: those a grouped recap
     has already carried. The two faces of one counter, read side by side — a
     late file is either carried or not, never both. */
  const dejaGroupe = enRetard.filter((entry) => Boolean(entry.recap_groupe_at));

  const envoyerGroupe = async () => {
    if (enRetard.length === 0) return;
    const references = enRetard.map((entry) => entry.reference);
    setBulkBusy(true);
    setBulkNote(null);
    try {
      const { data, error } = await supabase.functions.invoke('devis-abonnement', {
        body: { action: 'resend-bulk', references },
      });
      const answer = data as {
        ok?: boolean;
        emailed?: boolean;
        count?: number;
        sentAt?: string | null;
      } | null;
      if (error || !answer?.ok || !answer.emailed) {
        setBulkNote({ ok: false, text: t('dv.lastBulkErr') });
        return;
      }
      /* The badge follows the mail that really left: a send with no written
         date marks nothing. */
      if (answer.sentAt) {
        const stamp = answer.sentAt;
        /* The day is kept for the account too: the B2B workbook closes its
           summary on the very same date, wherever the send came from. */
        saveLastBulk(user ? bulkKey(user.id) : '', stamp, references.length);
        setRows((prev) =>
          prev.map((item) =>
            references.includes(item.reference) ? { ...item, recap_groupe_at: stamp } : item,
          ),
        );
      }
      setBulkNote({
        ok: true,
        text: t('dv.lastBulkOk').replace('{n}', String(answer.count ?? references.length)),
      });
    } catch {
      setBulkNote({ ok: false, text: t('dv.lastBulkErr') });
    } finally {
      setBulkBusy(false);
    }
  };

  if (loading || !user || rows.length === 0 || hidden === rows[0].reference) return null;

  const etat = row ? statutDevis(row.statut) : 'recu';

  return (
    <aside className="dvl-last" aria-label={t('dv.lastStamp')}>
      {/* The four states, as a small row above the file itself. */}
      <div className="dvl-last-filter" role="group" aria-label={t('dv.lastFilterAria')}>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className="dvl-last-chip"
            data-state={chip.key}
            aria-pressed={filtre === chip.key}
            onClick={() => choisir(chip.key)}
          >
            <span>{chip.label}</span>
            <b>{tally[chip.key]}</b>
          </button>
        ))}
      </div>

      {row ? (
        <>
          {/* La ligne garde sa porte de suivi, mais par sa référence et sa
              flèche : la pastille des dossiers rendus, elle, ouvre sa propre
              lecture — une porte ne s'ouvre pas à l'intérieur d'une autre. */}
          <div className="dvl-last-hit">
            <span className="dvl-last-ico" aria-hidden="true">
              <i className="ri-file-list-3-line"></i>
            </span>
            <div className="dvl-last-main">
              <p className="dvl-last-stamp">
                {t('dv.lastStamp')}
                {day(row.created_at) && <em>· {day(row.created_at)}</em>}
                {/* La durée retenue, dans la ligne du récapitulatif elle-même :
                    « Votre dernier devis » dit d'emblée sur quelle longueur il
                    a été composé, avant le montant. */}
                {row.rythme ? (
                  <span className="dvl-last-stamp-rhy" title={t('dv.dureeRetenue')}>
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    {t('dv.dureeRetenue')} · {row.rythme}
                  </span>
                ) : (
                  /* Un ancien dossier n'a pas écrit sa durée : la bande le dit
                     au lieu de laisser un blanc, sans rien inventer. */
                  <span
                    className="dvl-last-stamp-rhy is-missing"
                    title={t('dv.dureeMissingHint')}
                  >
                    <i className="ri-error-warning-line" aria-hidden="true"></i>
                    {t('dv.dureeMissing')}
                  </span>
                )}
                {/* The reminder that already left for this file, right next to
                    the date it was sent: no need to open the account to know. */}
                {row.relance_envoyee_at && (
                  <span className="dvl-last-relance" title={t('dv.lastRelanceHint')}>
                    <i className="ri-notification-3-line" aria-hidden="true"></i>
                    {t('dv.relanceOn')} {day(row.relance_envoyee_at)}
                  </span>
                )}
                {/* The grouped recap that already carried this file. */}
                {row.recap_groupe_at && (
                  <span className="dvl-last-relance" title={t('dv.recapGroupHint')}>
                    <i className="ri-mail-send-line" aria-hidden="true"></i>
                    {t('dv.recapGroupOn')} {day(row.recap_groupe_at)}
                  </span>
                )}
              </p>
              <p className="dvl-last-line">
                <Link
                  to={`/suivi?ref=${encodeURIComponent(row.reference)}`}
                  className="dvl-last-ref dvl-last-ref-link"
                  title={t('dv.lastOpen').replace('{ref}', row.reference)}
                >
                  {row.reference}
                </Link>
                <span className="dvl-badge" data-state={etat}>
                  {t(`dv.st.${etat}`)}
                </span>
                {row.marche && (
                  <span className="dvl-last-meta">
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    {row.marche}
                  </span>
                )}
                <span className="dvl-last-amount">
                  {row.montant_total || row.montant_mensuel || '—'}
                </span>
                {/* Combien de dossiers de la bande n'ont pas écrit leur durée :
                    un ancien dossier se repère donc ici, d'un seul regard,
                    sans ouvrir chaque devis l'un après l'autre. Et le compteur
                    est une porte : un clic ouvre la liste réduite à ces seules
                    lignes, donc celles qu'il annonce. */}
                {sansDureeCount > 0 && (
                  <>
                    <Link
                      to={devisNoDureeHref(lang)}
                      className="dvl-last-noduree dvl-last-noduree-filter"
                      title={t('dv.lastNoDureeFilterHint')}
                    >
                      <i className="ri-calendar-close-line" aria-hidden="true"></i>
                      {t('dv.lastNoDuree').replace('{n}', String(sansDureeCount))}
                    </Link>
                    {/* Et la lecture se copie depuis son compteur : le compte,
                        puis chaque dossier avec son adresse — le collègue
                        reçoit la lecture entière, sans ouvrir la liste. */}
                    <CopyTextButton
                      build={sansDureeTexte}
                      label={t('dv.lastNoDureeCopy')}
                      hint={t('dv.lastNoDureeCopyHint')}
                      className="dvl-last-noduree-copy"
                    />
                  </>
                )}
                {/* Et celles dont la durée ne correspond pas au rythme retenu
                    sur cet appareil : ce sont les durées héritées d'un réglage
                    plus ancien. Le compteur est une porte à son tour — la bulle
                    nomme le rythme auquel il les rapporte, et un clic ouvre la
                    liste réduite à ces seules lignes. */}
                {rythmeHeriteCount > 0 && (
                  <>
                    <Link
                      to={devisRythmeHeriteHref(lang)}
                      className="dvl-last-rhydiff dvl-last-rhydiff-filter"
                      title={`${t('dv.lastRythmeDiffHint').replace(
                        '{duree}',
                        rythmeRetenuLabel,
                      )} — ${t('dv.lastRythmeDiffFilterHint')}`}
                    >
                      <i className="ri-calendar-2-line" aria-hidden="true"></i>
                      {t('dv.lastRythmeDiff').replace('{n}', String(rythmeHeriteCount))}
                    </Link>
                    {/* Et la lecture se copie depuis son compteur, comme celle
                        des dossiers sans durée : le compte, puis le rythme
                        exact de chaque dossier avec l’adresse qui l’ouvre. */}
                    <CopyTextButton
                      build={rythmeHeriteTexte}
                      label={t('dv.lastRythmeDiffCopy')}
                      hint={t('dv.lastRythmeDiffCopyHint')}
                      className="dvl-last-noduree-copy dvl-last-rhydiff-copy"
                    />
                  </>
                )}
                {/* Le rappel des dossiers qui circulent déjà, à côté du dernier
                    devis : la bande et la liste comptent la même chose. Le
                    compte laisse de côté les dossiers revenus, qui ont leur
                    propre pastille juste après. */}
                {partagesSimplesCount > 0 && (
                  <span
                    className="dvl-last-shared"
                    title={
                      dernierPartageSimpleAt
                        ? `${t('dv.lastSharedHint')} — ${t('dv.listSharedLast').replace('{date}', day(dernierPartageSimpleAt))}`
                        : t('dv.lastSharedHint')
                    }
                  >
                    <i className="ri-share-forward-line" aria-hidden="true"></i>
                    {partagesSimplesCount} {t('dv.listSharedCount')}
                    {/* Le jour du dernier partage, dans la même pastille : le
                        compteur dit combien, la date dit quand. */}
                    {dernierPartageSimpleAt && (
                      <em className="dvl-last-when">
                        {t('dv.listSharedLast').replace('{date}', day(dernierPartageSimpleAt))}
                      </em>
                    )}
                  </span>
                )}
                {/* Le troisième compte de la même ventilation : les dossiers
                    seulement adressés, donc ni partagés ni rendus. Comme la
                    pastille des retours, c'est une porte : un clic ouvre la
                    liste réduite à ces seuls dossiers, avec le jour du dernier
                    d'entre eux posé à côté du nombre. */}
                {adressesCount > 0 && (
                  <>
                    <Link
                      to={devisAddressedHref(lang)}
                      className="dvl-last-addressed dvl-last-addressed-filter"
                      title={t('dv.lastAddressedPillHint')}
                    >
                      <i className="ri-at-line" aria-hidden="true"></i>
                      {adressesCount} {t('dv.listAddressedCount')}
                      {dernierAdresseAt && (
                        <em className="dvl-last-when">
                          {t('dv.listAddressedLast').replace('{date}', day(dernierAdresseAt))}
                        </em>
                      )}
                    </Link>
                    {/* Et la lecture se copie depuis son compteur, comme celle
                        des dossiers sans durée : le pointillé la distingue de
                        la pastille pleine, qui, elle, filtre. */}
                    <CopyTextButton
                      build={adressesTexte}
                      label={t('dv.lastAddressedCountCopy')}
                      hint={t('dv.lastAddressedCountCopyHint')}
                      className="dvl-last-noduree-copy dvl-last-addressed-count-copy"
                    />
                  </>
                )}
                {/* Ceux qui dorment ont leur propre pastille, à la suite de
                    celle des adressés : elle compte ces dossiers-là et ouvre
                    leur lecture, comme sa voisine l'adresse des dossiers sans
                    transmission. La date du plus ancien dit depuis quand
                    l'attente la plus longue court. */}
                {endormisCount > 0 && (
                  <Link
                    to={devisDormantHref(lang)}
                    className="dvl-last-addressed dvl-last-addressed-filter dvl-last-dormant"
                    title={t('dv.lastDormantPillHint')}
                  >
                    <i className="ri-moon-line" aria-hidden="true"></i>
                    {endormisCount} {t('dv.listDormantCount')}
                    {/* Le montant cumulé, juste après le compteur : le nombre
                        dit combien dorment, le montant dit ce qu'ils pèsent. */}
                    {endormisMontant && (
                      <em className="dvl-last-amount-cumul" title={t('dv.listDormantAmountHint')}>
                        {endormisMontant}
                      </em>
                    )}
                    {/* Et la part que ce montant tient dans l'ensemble des
                        devis : un jeton à part, comme dans l'en-tête, pour que
                        le pourcentage ne se lise pas comme un second montant. */}
                    {endormisPart && (
                      <em className="dvl-last-share" title={t('dv.listDormantShareHint')}>
                        {endormisPart}
                      </em>
                    )}
                    {/* Et le délai moyen du lot, juste après sa part de
                        l'attente : la pastille de l'en-tête de « Mon compte »
                        le porte déjà, la bande lit donc le même temps sur les
                        mêmes lignes. Rien ne s'écrit quand le lot est vide —
                        une moyenne sans dossier ne dirait rien. */}
                    {endormisMoyenne !== null && (
                      <em className="dvl-last-when" title={t('dv.listDormantAvgHint')}>
                        {t('dv.listDormantAvg').replace('{n}', String(endormisMoyenne))}
                      </em>
                    )}
                    {/* Et, juste après la moyenne du lot, le marché qui attend
                        le plus longtemps : le jeton le nomme avec son propre
                        délai, calculé sur ses seules lignes — la bande repère
                        l'attente la plus longue sans additionner deux devises.
                        Rien ne s'écrit quand le lot ne mêle qu'un marché. */}
                    {marcheEndormiPlusLong && endormisRepartition.length > 1 && (
                      <em
                        className="dvl-last-when dvl-last-longest"
                        title={t('dv.sumDormantMarketsLongestHint')}
                      >
                        {t('dv.sumDormantMarketsLongest')
                          .replace('{devise}', marcheEndormiPlusLong.devise)
                          .replace('{n}', String(marcheEndormiPlusLong.jours))}
                      </em>
                    )}
                    {endormisOldestAt && (
                      <em className="dvl-last-when">
                        {t('dv.listDormantOldest').replace('{date}', day(endormisOldestAt))}
                      </em>
                    )}
                  </Link>
                )}
                {/* Les endormis confirmés, juste à côté de ceux qui dorment :
                    parmi eux, ceux dont le devis est déjà prêt. La pastille les
                    compte et ouvre leur lecture d'un seul clic. */}
                {endormisConfirmesCount > 0 && (
                  <span className="dvl-last-pill-pair">
                    <Link
                      to={devisDormantConfirmedHref(lang)}
                      className="dvl-last-addressed dvl-last-addressed-filter dvl-last-dormant dvl-last-dormant-confirmed"
                      title={t('dv.lastDormantConfirmedPillHint')}
                    >
                      <i className="ri-check-double-line" aria-hidden="true"></i>
                      {endormisConfirmesCount} {t('dv.listDormantConfirmedCount')}
                      {/* Le délai moyen de ces dossiers, juste après le
                          compteur : combien ils sont, et depuis combien de
                          temps ils attendent en moyenne. */}
                      {endormisConfirmesMoyenne !== null && (
                        <em className="dvl-last-when">
                          {t('dv.listDormantConfirmedAvg').replace(
                            '{n}',
                            String(endormisConfirmesMoyenne),
                          )}
                        </em>
                      )}
                      {/* Et ce délai-là rapporté à celui de toute l'attente :
                          « 18 j sur 24 j » — la même comparaison que dans
                          « Mon compte » et dans la Synthèse du classeur. */}
                      {endormisConfirmesMoyenne !== null && endormisMoyenne !== null && (
                        <em
                          className="dvl-last-when"
                          title={t('dv.listDormantConfirmedAvgCompareHint')}
                        >
                          {t('dv.sumDormantConfirmedAvgOf')
                            .replace('{a}', String(endormisConfirmesMoyenne))
                            .replace('{b}', String(endormisMoyenne))}
                        </em>
                      )}
                      {/* Et juste après le délai, la même comparaison que
                          dans l'en-tête et la Synthèse : ce que pèsent ces
                          devis, rapporté à toute l'attente. Rien ne s'écrit
                          quand l'un des deux montants manque. */}
                      {endormisConfirmesMontant && endormisMontant && (
                        <em
                          className="dvl-last-amount-cumul dvl-last-dormant-confirmed-compare"
                          title={t('dv.listDormantConfirmedCompareHint')}
                        >
                          {t('dv.sumDormantConfirmedAmountOf')
                            .replace('{a}', endormisConfirmesMontant)
                            .replace('{b}', endormisMontant)}
                        </em>
                      )}
                      {/* Et les deux parts de l'attente, l'une rapportée à
                          l'autre : celle des devis prêts et celle de tout le
                          lot endormi, prises sur le même ensemble de devis —
                          « 18 % sur 32 % ». La bande lit ainsi les deux lots
                          sur la même échelle, et pas seulement leur montant. */}
                      {endormisConfirmesPartListe && endormisPart && (
                        <em
                          className="dvl-last-share"
                          title={t('dv.listDormantConfirmedShareOfHint')}
                        >
                          {t('dv.sumDormantShareOf')
                            .replace('{a}', endormisConfirmesPartListe)
                            .replace('{b}', endormisPart)}
                        </em>
                      )}
                    </Link>
                    {/* Et le lien de cette lecture se copie juste à côté du
                        délai moyen, dans la même pastille : le collègue
                        reçoit l'adresse de ces seuls dossiers, sans que la
                        liste soit ouverte ici. */}
                    <CopyTextButton
                      build={() => devisDormantConfirmedHref(lang)}
                      label={t('dv.sumDormantCopy')}
                      hint={t('dv.lastDormantConfirmedCopyHint')}
                      className="dvl-last-pill-copy dvl-last-dormant-confirmed-inline"
                    />
                    {/* Et sous la pastille, la part déjà prête de chaque
                        marché : la même répartition que la Synthèse de « Mon
                        compte », dans sa propre teinte. Chaque marché garde son
                        total, et sa part se rapporte à lui — deux marchés ne
                        s'additionnent jamais pour en tirer un pourcentage. Une
                        seule devise n'a rien à répartir, donc rien ne s'écrit. */}
                    <DormantDeviseSplit
                      entries={endormisConfirmesParDevise.map((entry) => {
                        const moyenne = delaiDuMarche(entry.devise);
                        return {
                          devise: entry.devise,
                          montant: entry.montant,
                          part: entry.part,
                          /* Le nombre de devis de ce marché : le jeton l'annonce
                             comme celui de la Synthèse, et sa copie l'emporte. */
                          count: t('dv.sumDormantConfirmedCountOf')
                            .replace('{a}', String(entry.prets))
                            .replace('{b}', String(entry.total)),
                          /* Et le même délai, en jours : c'est lui qui ordonne
                             les jetons quand le lecteur le demande. */
                          avgDays: moyenne,
                          avg:
                            moyenne !== null
                              ? t('dv.listDormantAvg').replace('{n}', String(moyenne))
                              : undefined,
                          title: `${t('dv.sumDormantConfirmedCountOf')
                            .replace('{a}', String(entry.prets))
                            .replace('{b}', String(entry.total))} · ${t(
                            'dv.sumDormantConfirmedByDevisePart'
                          )}`,
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
                      copyAllLabel={t('dv.sumDeviseCopyAll')}
                      copyAllHint={t('dv.sumDeviseCopyAllHint')}
                      ready
                      layout="strip"
                    />
                  </span>
                )}
                {/* Le rappel des dossiers rendus, à côté de celui des partages :
                    combien sont revenus après un retrait, et le jour du dernier
                    retour — la même pastille que dans l'en-tête de la liste.
                    Et c'est aussi une porte : un clic ouvre la liste réduite à
                    ces seuls dossiers, donc les lignes que le compteur annonce. */}
                {rendusCount > 0 && (
                  <Link
                    to={devisRestoredHref(lang)}
                    className="dvl-last-restored dvl-last-restored-filter"
                    title={t('dv.lastRestoredPillHint')}
                  >
                    <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                    {rendusCount} {t('dv.listRestoredCount')}
                    {dernierRetourAt && (
                      <em className="dvl-last-when">
                        {t('dv.sumMarksRestoredOn').replace('{date}', day(dernierRetourAt))}
                      </em>
                    )}
                  </Link>
                )}
              </p>
            </div>
            <Link
              to={`/suivi?ref=${encodeURIComponent(row.reference)}`}
              className="dvl-last-go"
              title={t('dv.lastOpen').replace('{ref}', row.reference)}
              aria-label={t('dv.lastOpen').replace('{ref}', row.reference)}
            >
              <i className="ri-route-line" aria-hidden="true"></i>
            </Link>
          </div>
          <div className="dvl-last-actions">
            {/* Le geste inverse de « Rétablir » : retirer les marques des
                dossiers de ce rappel, d'un seul clic, sans toucher au reste. */}
            {partagesCount > 0 && (
              <span className="dvl-last-forgot" title={t('dv.lastForgetHint')}>
                <i className="ri-share-forward-line" aria-hidden="true"></i>
                {t(partagesCount > 1 ? 'dv.lastForgetMany' : 'dv.lastForgetOne').replace(
                  '{n}',
                  String(partagesCount),
                )}
                <button
                  type="button"
                  className="dvl-last-restore dvl-last-eraser"
                  title={t('dv.forgetSharesHint')}
                  onClick={oublierPartages}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('dv.rowForgetShare')}</span>
                </button>
              </span>
            )}
            {/* Le rappel des marques retirées, posé juste à côté du compteur :
                « Rétablir » les rend avec leur jour d'origine, sans ouvrir la
                liste. */}
            {oubliesCount > 0 && (
              <span className="dvl-last-forgot dvl-last-forgot-marks" title={t('dv.lastForgotHint')}>
                <span className="dvl-last-forgot-head">
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                  {t(oubliesCount > 1 ? 'dv.lastForgotMany' : 'dv.lastForgotOne').replace(
                    '{n}',
                    String(oubliesCount),
                  )}
                  <button
                    type="button"
                    className="dvl-last-restore"
                    title={t('dv.restoreSharesHint')}
                    onClick={restaurerOublies}
                  >
                    <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('dv.rowRestoreShare')}</span>
                  </button>
                </span>
                {/* Le jour de chaque retrait, et le délai écoulé depuis : la
                    bulle situe le geste, dossier par dossier. */}
                <span className="dvl-last-mark-rows">
                  {marquesRetirees.map(({ reference, retrait }) => (
                    <span className="dvl-last-mark" key={reference}>
                      <b>{reference}</b>
                      <span className="dvl-last-mark-when">
                        {t('dv.lastForgotOn').replace('{date}', day(retrait))}
                      </span>
                      <span className="dvl-last-mark-ago">
                        {t('dv.lastForgotAgo').replace('{n}', String(daysSince(retrait)))}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
            )}
            <Link
              to={`/suivi?ref=${encodeURIComponent(row.reference)}`}
              className="dvl-last-link"
              title={t('dv.followHint')}
            >
              <span className="whitespace-nowrap">{t('dv.lastFollow')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
            {/* One dossier handed over on its own: the address of that very
                line in the account list — no need to open the list to share
                it with a colleague. */}
            <CopyTextButton
              build={() => devisRowHref(row.reference, lang)}
              label={t('dv.lastShareOne')}
              hint={t('dv.rowShareHint').replace('{ref}', row.reference)}
              className="dvl-last-link dvl-last-share-one"
              /* The share is written down for this account: the workbook marks
                 that dossier as already circulating. */
              onCopied={() => {
                if (user) setShares(markShared(shareKey(user.id), row.reference));
              }}
            />
            {/* La lecture « Déjà partagés » se copie d'ici, sans ouvrir la
                liste : le collègue reçoit l'adresse de cette lecture-là.
                Le lien suit la même lecture que le compteur : les dossiers
                partagés hors dossiers rendus, jamais ceux qui ont la leur.
                Le nombre emporté est donc celui de la pastille, et non
                celui de toutes les marques du rappel. */}
            {partagesSimplesCount > 0 && (
              <CopyTextButton
                build={() => devisSharedHref(lang, triRecents, partagesSimplesCount)}
                label={t('dv.lastSharedCopy')}
                hint={t('dv.lastSharedCopyHint')}
                className="dvl-last-link dvl-last-shared-copy"
              />
            )}
            {/* L'ordre « partagé récemment », réglé depuis la bande : les deux
                lectures s'ouvrent alors dans le même sens. */}
            {partagesCount > 0 && (
              <button
                type="button"
                className="dvl-last-link dvl-last-sort"
                data-on={triRecents ? 'yes' : 'no'}
                aria-pressed={triRecents}
                title={triRecents ? t('dv.lastSortOn') : t('dv.lastSortOff')}
                onClick={basculerTri}
              >
                <i className="ri-sort-desc" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('dv.sortRecent')}</span>
                {/* Combien de dossiers cet ordre remonte, dans un compteur à
                    côté de la pastille : le tri dit ce qu'il a à remonter. */}
                <span className="text-[10px] font-semibold leading-none tabular-nums opacity-80">
                  {partagesCount}
                </span>
              </button>
            )}
            {/* The other face of the same count: the files a grouped recap has
                already carried, opened straight in the account, filtered. */}
            <Link
              to={
                triRecents
                  ? '/compte?devis=groupe&tri=recents#mes-devis'
                  : '/compte?devis=groupe#mes-devis'
              }
              className="dvl-last-link dvl-last-group"
              title={t('dv.sumGroupHint')}
            >
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('dv.lastGroupSee')}</span>
            </Link>
            <Link
              to={triRecents ? '/compte?tri=recents#mes-devis' : '/compte#mes-devis'}
              className="dvl-last-link dvl-last-account"
            >
              <span className="whitespace-nowrap">{t('dv.lastSee')}</span>
            </Link>
            {/* Le rappel des dossiers rendus est aussi une porte : la liste
                s'ouvre déjà réduite à ce qui est revenu après un retrait. */}
            {rendusCount > 0 && (
              <Link
                to={devisRestoredHref(lang)}
                className="dvl-last-link dvl-last-restored-see"
                title={t('dv.lastRestoredHint')}
              >
                <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('dv.lastRestoredSee')}</span>
              </Link>
            )}
            {/* Le même lien se copie d'ici, sans ouvrir la liste : le
                collègue reçoit l'adresse de la lecture réduite aux dossiers
                rendus — exactement les lignes que la pastille annonce. */}
            {rendusCount > 0 && (
              <CopyTextButton
                build={() => devisRestoredHref(lang)}
                label={t('dv.listRestoredCopy')}
                hint={t('dv.listRestoredCopyHint')}
                className="dvl-last-link dvl-last-restored-copy"
              />
            )}
            {/* La troisième lecture de la ventilation se copie de la même
                façon : le collègue reçoit l'adresse des dossiers seulement
                adressés, sans que la liste soit ouverte ici. */}
            {adressesCount > 0 && (
              <CopyTextButton
                build={() => devisAddressedHref(lang)}
                label={t('dv.lastAddressedCopy')}
                hint={t('dv.lastAddressedCopyHint')}
                className="dvl-last-link dvl-last-addressed-copy"
              />
            )}
            {/* Et ceux qui dorment se copient juste à côté : un seul geste de
                plus, sans ouvrir la liste ni refaire les filtres. */}
            {endormisCount > 0 && (
              <CopyTextButton
                build={() => devisDormantHref(lang)}
                label={t('dv.lastDormantCopy')}
                hint={t('dv.lastDormantCopyHint')}
                className="dvl-last-link dvl-last-addressed-copy dvl-last-dormant-copy"
              />
            )}
            {/* Le lien des endormis confirmés se copie depuis la pastille
                elle-même, juste à côté de leur délai moyen : une seule
                maison par geste, rien n'est annoncé deux fois. */}
            <button
              type="button"
              className="dvl-last-hide"
              aria-label={t('dv.lastHide')}
              title={t('dv.lastHide')}
              onClick={masquer}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          </div>
        </>
      ) : (
        /* A state with nothing in it is said plainly, with the way back. */
        <div className="dvl-last-none">
          <p>
            <i className="ri-filter-off-line" aria-hidden="true"></i>
            <span>{t('dv.lastNone')}</span>
          </p>
          <Link
            to={triRecents ? '/compte?tri=recents#mes-devis' : '/compte#mes-devis'}
            className="dvl-last-link dvl-last-account"
          >
            <span className="whitespace-nowrap">{t('dv.lastSee')}</span>
          </Link>
          <button type="button" className="dvl-last-hide" onClick={masquer} aria-label={t('dv.lastHide')} title={t('dv.lastHide')}>
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>
      )}

      {/* The wait is readable straight from the strip: when files have slept
          past a week, one button sends their grouped recap, no detour. */}
      {enRetard.length > 0 && (
        <div className="dvl-last-bulk">
          <span className="dvl-last-bulk-ico" aria-hidden="true">
            <i className="ri-alarm-warning-line"></i>
          </span>
          <p className="dvl-last-bulk-txt">
            <b>{t('dv.lastBulkTitle')}</b>
            <span>{t('dv.lastBulkText').replace('{n}', String(enRetard.length))}</span>
            {/* A recap already left for these files: said plainly, with the day
                it went, so a second send is a decision and not a mistake. */}
            {/* The two faces of the same counter: what no group send has ever
                gathered, and what a recap has already carried. Side by side, the
                reader sees at once whether the wait is whole or partly handled. */}
            <span className="dvl-last-bulk-faces">
              <span
                className="dvl-last-bulk-when dvl-last-bulk-never"
                data-on={jamaisGroupe.length > 0 ? 'yes' : 'no'}
              >
                <i className="ri-error-warning-line" aria-hidden="true"></i>
                {t('dv.lastBulkNever').replace('{n}', String(jamaisGroupe.length))}
              </span>
              <span
                className="dvl-last-bulk-when dvl-last-bulk-done"
                data-on={dejaGroupe.length > 0 ? 'yes' : 'no'}
              >
                <i className="ri-mail-check-line" aria-hidden="true"></i>
                {t('dv.lastBulkGroup').replace('{n}', String(dejaGroupe.length))}
              </span>
            </span>
            {recapRecent && (
              <span className="dvl-last-bulk-when">
                <i className="ri-mail-check-line" aria-hidden="true"></i>
                {t('dv.lastBulkRecent').replace(
                  '{date}',
                  day(new Date(dernierGroupe).toISOString()),
                )}
              </span>
            )}
            {/* The strip is also a door: the account opens already narrowed to
                the files no grouped recap has ever carried, the late ones
                ticked for the send — no detour through the filters. */}
            <Link
              to={
                triRecents
                  ? '/compte?devis=jamais&tri=recents#mes-devis'
                  : '/compte?devis=jamais#mes-devis'
              }
              className="dvl-last-bulk-more"
            >
              <i className="ri-mail-line" aria-hidden="true"></i>
              <span>{t('dv.lastBulkNeverSee')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
            {/* The same reading, handed over instead of opened here: the address
                of that very filtered list, copied for a colleague — the mirror
                of the share button that sits above the account list. */}
            <CopyTextButton
              build={() => devisAccountHref('jamais', lang, triRecents, jamaisPartagesCount)}
              label={t('dv.lastBulkShare')}
              hint={t('dv.shareHint')}
              className="dvl-last-bulk-share"
            />
          </p>
          <button
            type="button"
            className="dvl-last-bulk-send"
            disabled={bulkBusy}
            onClick={() => void envoyerGroupe()}
          >
            <i
              className={bulkBusy ? 'ri-loader-4-line is-spin' : 'ri-mail-send-line'}
              aria-hidden="true"
            ></i>
            {bulkBusy
              ? t('dv.lastBulkSending')
              : recapRecent
                ? t('dv.lastBulkResend')
                : t('dv.lastBulkSend')}
          </button>
          {bulkNote && (
            <p className="dvl-last-bulk-note" data-ok={bulkNote.ok ? 'yes' : 'no'} role="status">
              <i
                className={bulkNote.ok ? 'ri-check-double-line' : 'ri-error-warning-line'}
                aria-hidden="true"
              ></i>
              <span>{bulkNote.text}</span>
            </p>
          )}
        </div>
      )}
    </aside>
  );
}