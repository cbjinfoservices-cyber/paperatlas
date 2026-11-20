import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { openCv } from '@/lib/cv';
import { paysDe, tallyPays } from '@/lib/pays';
import PaysBadge from '@/components/feature/PaysBadge';
import PaysTally from '@/components/feature/PaysTally';
import CsvExportButton from '@/components/feature/CsvExportButton';
import CopyTextButton from '@/components/feature/CopyTextButton';
import AireCopyProfile from '@/components/feature/AireCopyProfile';
import { useApplications, useUnreadApplications } from '@/hooks/useMessaging';
import {
  isSettled,
  openConversation,
  sortApplications,
  type ApplicationSort,
  type Candidature,
  type CandidatureStatut,
} from '@/lib/messaging';
import './applications.css';
import {
  noteRelance, readRelanceFolds, readRelances, toggleRelanceFold,
} from './silentRelanceMemory';
import { buildApplicationsCsv, downloadApplicationsCsv } from './applicationsCsv';
import { buildApplicationsSummary } from './applicationsSummary';

const STATUS_KEY: Record<CandidatureStatut, string> = {
  envoyee: 'acct.appl.statusEnvoyee',
  vue: 'acct.appl.statusVue',
  retenue: 'acct.appl.statusRetenue',
  refusee: 'acct.appl.statusRefusee',
};

type Tab = 'sent' | 'received';

const DAY_MS = 24 * 60 * 60 * 1000;
/** A dossier sitting longer than this is worth calling out on its row. */
const LATE_DAYS = 7;
/** Une relance de moins d'une semaine est récente : son jeton peut se replier,
 *  la date restant lisible au survol. Au-delà, elle reste dépliée. */
const RELANCE_FOLD_DAYS = 7;

/* The face of the board, its search and its country travel in the address, so a
   selection can be reopened from a link. Keys stay apart from the deposits board
   above, which already owns « tab » and « period » on the same page. */
const TAB_PARAM = 'atab';
const QUERY_PARAM = 'q';
const PAYS_PARAM = 'pays';
/* L'offre dont on vient lire les candidatures : le jeton « non lues » de
   « Mes offres » ouvre le tableau déjà resserré sur elle. */
const OFFRE_PARAM = 'offre';

const stampOf = (iso: string) => {
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? time : 0;
};

/** Whole days between the sending and today, never negative. */
function ageInDays(iso: string) {
  const at = stampOf(iso);
  if (!at) return 0;
  return Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
}

/**
 * Un dossier reçu auquel rien n'a encore répondu — ni accusé de réception, ni
 * décision — depuis plus d'une semaine. Un simple retard n'est pas un silence :
 * il faut qu'aucun mot ne soit parti, et que le dossier attende encore.
 */
function isSilentDossier(row: Candidature) {
  if (isSettled(row.statut)) return false;
  if (row.accuse_at || row.decision_envoyee_at) return false;
  return ageInDays(row.created_at) >= LATE_DAYS;
}

/** First instant of the calendar month a date belongs to. */
const monthFloor = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getTime();

/**
 * The application board: what the candidate sent, and what an employer received.
 * Both faces share the same rows — only the point of view changes.
 */
export default function MyApplications() {
  const { t, lang } = useLang();
  const { user, compte } = useAuth();
  const { sent, received, loading, error, reload, setStatut } = useApplications();
  const { unseenIds, markSeen } = useUnreadApplications();
  const unseenKey = unseenIds.join(',');
  /* Kept for the length of the visit so the « new » dot does not vanish the
     instant the badge is cleared. */
  const [freshIds, setFreshIds] = useState<string[]>([]);
  /* Le jour de la dernière relance tentée, dossier par dossier : le geste
     d'ouvrir la conversation d'un muet est daté, pour que le tri puisse le
     rappeler sans qu'on compte les jours soi-même. */
  const [relances, setRelances] = useState<Record<string, string>>(() => readRelances());
  /* Les relances récentes repliées d'un clic : la ligne muette reste courte,
     la date se lit toujours au survol du jeton. Le repli se garde sur
     l'appareil, comme le tri et les filtres : la visite suivante retrouve la
     même ligne, courte ou dépliée. */
  const [foldedRelances, setFoldedRelances] = useState<string[]>(() => readRelanceFolds());
  const navigate = useNavigate();

  const [params, setParams] = useSearchParams();
  /* A link that carries a received search or a country opens on the received
     face, so the selection it describes is actually on screen. */
  const [tab, setTab] = useState<Tab>(() => (
    params.get(TAB_PARAM) === 'sent'
      ? 'sent'
      : params.get(TAB_PARAM) === 'received'
        || params.has(QUERY_PARAM) || params.has(PAYS_PARAM) || params.has(OFFRE_PARAM)
        ? 'received'
        : 'sent'
  ));
  const [onlyTodo, setOnlyTodo] = useState(false);
  /* « Plus d’une semaine »: only the dossiers still waiting after a full week. */
  const [onlyLate, setOnlyLate] = useState(false);
  /* « Sans réponse » : les seuls dossiers muets — ni accusé, ni décision. */
  const [onlySilent, setOnlySilent] = useState(false);
  const [query, setQuery] = useState(() => params.get(QUERY_PARAM) ?? '');
  /* Country of the candidate, read from the profile: it narrows the received
     pile exactly like the counter above it. */
  const [pays, setPays] = useState(() => params.get(PAYS_PARAM) ?? '');
  /* L'offre lue seule : le titre voyage avec la sélection pour être nommé. */
  const [offre, setOffre] = useState(() => (params.get(OFFRE_PARAM) ?? '').trim());
  const [sort, setSort] = useState<ApplicationSort>('recent');
  /* The applicant about to be shortlisted, and the word typed for them. */
  const [noteFor, setNoteFor] = useState<Candidature | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [failure, setFailure] = useState('');

  const list = tab === 'sent' ? sent : received;
  /**
   * Les candidatures reçues, resserrées sur une offre quand le jeton « non
   * lues » de « Mes offres » a ouvert cette face : la liste, les compteurs de
   * filtre et le pays se lisent alors sur cette seule offre.
   */
  const receivedList = useMemo(
    () => (offre ? received.filter((row) => row.offre_id === offre) : received),
    [received, offre],
  );
  /**
   * Les accusés de réception, côté candidat : une candidature est tenue pour
   * accusée quand le courriel d'accusé est réellement parti — sa date est
   * écrite sur la ligne par la fonction d'envoi. Le compte et la plus ancienne
   * attente se lisent sur les mêmes lignes que la liste.
   */
  const acked = useMemo(() => sent.filter((row) => Boolean(row.accuse_at)).length, [sent]);
  const pendingAck = sent.length - acked;
  const oldestPending = useMemo(
    () => sent
      .filter((row) => !row.accuse_at)
      .reduce((oldest, row) => {
        const at = stampOf(row.created_at);
        return at && (!oldest || at < oldest) ? at : oldest;
      }, 0),
    [sent],
  );
  const pendingDays = oldestPending
    ? Math.max(0, Math.floor((Date.now() - oldestPending) / DAY_MS))
    : 0;
  /* « À traiter »: the applications that have not been opened yet. */
  const todo = receivedList.filter((row) => row.statut === 'envoyee');
  /* « Plus d’une semaine »: an undecided dossier sitting for over a week. */
  const lateRows = useMemo(
    () => receivedList.filter((row) => ageInDays(row.created_at) >= LATE_DAYS && !isSettled(row.statut)),
    [receivedList],
  );
  /* Les dossiers qu'aucune réponse n'a touchés : ni accusé, ni décision. */
  const silentRows = useMemo(() => receivedList.filter(isSilentDossier), [receivedList]);
  /* Le plus ancien de ces dossiers : la porte du tri « silence le plus long »
     ouvre directement sa conversation, sans repasser par la liste. */
  const oldestSilent = useMemo(() => (
    silentRows.length
      ? silentRows.reduce((oldest, row) => (
        stampOf(row.created_at) < stampOf(oldest.created_at) ? row : oldest
      ))
      : null
  ), [silentRows]);
  /* Le titre de l'offre lue, pour nommer le filtre sans le chercher ailleurs. */
  const offreTitre = useMemo(() => {
    if (!offre) return '';
    const row = received.find((item) => item.offre_id === offre);
    return (row?.offre_titre || '').trim();
  }, [received, offre]);
  const needle = query.trim().toLowerCase();
  /* The employer searches the pile by the candidate's name (or e-mail). */
  const matches = (row: Candidature) => {
    if (!needle) return true;
    const nom = (row.candidat_nom || '').toLowerCase();
    const mail = (row.candidat_email || '').toLowerCase();
    return nom.includes(needle) || mail.includes(needle);
  };
  const base = tab === 'received'
    ? (onlyTodo ? todo : onlyLate ? lateRows : onlySilent ? silentRows : receivedList)
    : list;
  const filtered = tab === 'received' ? base.filter(matches) : base;
  /* The counter reads the search and the « to handle » cut, never the country
     itself: picking a country must not erase the map it was picked from. */
  const tally = useMemo(
    () => tallyPays(filtered.map((row) => ({ pays: row.candidat_pays }))),
    [filtered],
  );
  const tallyTotal = useMemo(
    () => tally.reduce((sum, row) => sum + row.count, 0),
    [tally],
  );
  const scoped = tab === 'received' && pays
    ? filtered.filter((row) => paysDe({ pays: row.candidat_pays }) === pays)
    : filtered;
  const shown = tab === 'received' ? sortApplications(scoped, sort, localeFor(lang)) : filtered;
  /**
   * The applicants of the last two months, whatever the filter in place: the
   * received pile answers « more or fewer than last month » on its own.
   */
  const monthCompare = useMemo(() => {
    const now = new Date();
    const thisStart = monthFloor(now);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    let current = 0;
    let before = 0;
    received.forEach((row) => {
      const at = stampOf(row.created_at);
      if (!at) return;
      if (at >= thisStart) current += 1;
      else if (at >= prevStart) before += 1;
    });
    return { now: current, before, delta: current - before };
  }, [received]);
  const searching = tab === 'received' && Boolean(needle);
  /* What is narrowing the received pile right now: chip, search, country, ordering. */
  const activeFilters = (onlyTodo || onlyLate || onlySilent ? 1 : 0) + (needle ? 1 : 0)
    + (pays ? 1 : 0) + (offre ? 1 : 0) + (sort === 'recent' ? 0 : 1);
  const resetFilters = () => {
    setOnlyTodo(false);
    setOnlyLate(false);
    setOnlySilent(false);
    setQuery('');
    setPays('');
    setOffre('');
    setSort('recent');
  };

  /**
   * La porte du silence : le compte des dossiers muets n'est pas qu'un relevé.
   * Un clic resserre la liste sur eux et mène droit aux lignes, là où la
   * réponse s'écrit — un second clic rend le tableau entier.
   */
  const showSilent = () => {
    const next = !onlySilent;
    setOnlyTodo(false);
    setOnlyLate(false);
    setOnlySilent(next);
    setFailure('');
    if (!next) return;
    window.setTimeout(() => {
      document.getElementById('capp-silent-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 70);
  };

  /** The address keeps the received selection, so a link reopens it as it is. */
  const linkRead = useRef(false);
  useEffect(() => {
    if (linkRead.current) return;
    linkRead.current = true;
    const rawTab = params.get(TAB_PARAM) ?? '';
    const rawQuery = (params.get(QUERY_PARAM) ?? '').trim();
    const rawPays = params.get(PAYS_PARAM) ?? '';
    const rawOffre = (params.get(OFFRE_PARAM) ?? '').trim();
    if (rawTab === 'sent' || rawTab === 'received') setTab(rawTab);
    if (rawQuery) setQuery(rawQuery);
    if (rawPays) setPays(rawPays);
    if (rawOffre) setOffre(rawOffre);
  }, [params]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (tab === 'sent') next.delete(TAB_PARAM);
    else next.set(TAB_PARAM, tab);
    const shownQuery = tab === 'received' ? query.trim() : '';
    if (shownQuery) next.set(QUERY_PARAM, shownQuery);
    else next.delete(QUERY_PARAM);
    if (tab === 'received' && pays) next.set(PAYS_PARAM, pays);
    else next.delete(PAYS_PARAM);
    if (tab === 'received' && offre) next.set(OFFRE_PARAM, offre);
    else next.delete(OFFRE_PARAM);
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [tab, query, pays, offre, params, setParams]);

  /* The navigation badge links straight to /compte#mes-candidatures. */
  useEffect(() => {
    if (window.location.hash !== '#mes-candidatures') return;
    const node = document.getElementById('mes-candidatures');
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* Escape closes the shortlist note without saving it. */
  useEffect(() => {
    if (!noteFor) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNoteFor(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [noteFor]);

  /* The candidate is now looking at the board: their badge can drop. */
  useEffect(() => {
    if (tab !== 'sent' || !unseenKey) return;
    setFreshIds(unseenKey.split(','));
    void markSeen(unseenKey.split(','));
  }, [tab, unseenKey, markSeen]);

  const day = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(date);
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    if (next === 'sent') {
      setOnlyTodo(false);
      setOnlyLate(false);
      setOnlySilent(false);
      setQuery('');
      setPays('');
      setOffre('');
      setSort('recent');
    }
    setNoteFor(null);
    setNotice('');
    setFailure('');
  };

  /** The person on the other end of this application. */
  const otherOf = (row: Candidature) => {
    if (tab === 'received') {
      return { id: row.user_id, nom: (row.candidat_nom || row.candidat_email || '').trim() };
    }
    return { id: row.entreprise_user_id ?? '', nom: row.entreprise };
  };

  /** Opens — or reopens — the thread attached to this application. */
  const reply = async (row: Candidature) => {
    const other = otherOf(row);
    if (!user || !other.id || other.id === user.id) {
      setFailure(t('acct.appl.errNoThread'));
      return;
    }
    setBusyId(row.id);
    setFailure('');
    setNotice('');
    try {
      const conversationId = await openConversation({
        meId: user.id,
        meNom: (compte?.nom || user.email || '').trim(),
        otherId: other.id,
        otherNom: other.nom,
        sujet: row.offre_titre,
        kind: 'candidature',
        offreId: row.offre_id,
        candidatureId: row.id,
      });
      /* Opening a received application means the employer has read it. */
      if (tab === 'received' && row.statut === 'envoyee') {
        await setStatut(row.id, 'vue');
      }
      /* La conversation s'ouvre sur un dossier reçu : c'est une relance
         tentée, et son jour se retient pour la ligne du tri. */
      if (tab === 'received') setRelances(noteRelance(row.id));
      navigate(`/messages?c=${conversationId}`);
    } catch {
      setFailure(t('acct.appl.errThread'));
    } finally {
      setBusyId('');
    }
  };

  /** The CV is a private file: the employer gets a short-lived signed link. */
  const openApplicationCv = async (row: Candidature) => {
    setFailure('');
    if (row.cv_path) {
      const opened = await openCv(row.cv_path);
      if (!opened) setFailure(t('cv.errOpen'));
      return;
    }
    if (row.cv_url) window.open(row.cv_url, '_blank', 'noopener,noreferrer');
  };

  const move = async (row: Candidature, statut: CandidatureStatut, note?: string) => {
    setBusyId(row.id);
    setFailure('');
    setNotice('');
    const ok = await setStatut(row.id, statut, note);
    setBusyId('');
    if (!ok) {
      setFailure(t('acct.appl.errUpdate'));
      return;
    }
    setNotice(t('acct.appl.updated'));
    /* Shortlisted or declined: the candidate hears about it by e-mail.
       A failed mail never undoes the status change. */
    if (isSettled(statut)) {
      try {
        const { data } = await supabase.functions.invoke('notifier-statut-candidature', {
          body: { candidatureId: row.id, statut, note: (note ?? '').trim() },
        });
        /* Le courriel date son départ dans le dossier : la ligne dit alors le
           jour réel de l'envoi, et non celui de la décision. */
        const answer = (data ?? {}) as { sent?: boolean };
        if (answer.sent) void reload();
      } catch {
        /* silent: the board already shows the new state */
      }
    }
  };

  /** Opens the note box before shortlisting, pre-filled with the previous note. */
  const openNote = (row: Candidature) => {
    setNoteFor(row);
    setNoteDraft(row.note_employeur ?? '');
    setFailure('');
    setNotice('');
  };

  const confirmShortlist = async () => {
    const row = noteFor;
    if (!row) return;
    setNoteFor(null);
    await move(row, 'retenue', noteDraft);
  };

  return (
    <section className="pro-card capp" id="mes-candidatures">
      <div className="capp-head">
        <div>
          <h2 className="page-h2">{t('acct.appl.title')}</h2>
          <p className="auth-note capp-sub">{t('acct.appl.sub')}</p>
          {tab === 'received' && activeFilters > 0 && (
            <p className="capp-active">
              <i className="ri-filter-3-line" aria-hidden="true"></i>
              <strong>{activeFilters}</strong>
              <span>
                {activeFilters > 1
                  ? t('acct.appl.filtersActivePlural')
                  : t('acct.appl.filtersActiveOne')}
              </span>
              <span className="capp-active-sep" aria-hidden="true">·</span>
              <button type="button" className="capp-active-reset" onClick={resetFilters}>
                {t('acct.appl.filtersReset')}
              </button>
            </p>
          )}
        </div>
        <div className="capp-head-tools">
        <div className="segmented capp-tabs" role="group" aria-label={t('acct.appl.title')}>
          <button
            type="button"
            className={tab === 'sent' ? 'is-on' : ''}
            aria-pressed={tab === 'sent'}
            onClick={() => switchTab('sent')}
          >
            <i className="ri-send-plane-line" aria-hidden="true"></i>
            {t('acct.appl.sentTab')}
            <span className="capp-n">{sent.length}</span>
          </button>
          <button
            type="button"
            className={tab === 'received' ? 'is-on' : ''}
            aria-pressed={tab === 'received'}
            onClick={() => switchTab('received')}
          >
            {/* Deux faces, deux signes : l'envoi reste à la candidature partie,
                et les dossiers reçus prennent la fiche du candidat — le même
                signe que la porte « Mes candidatures » de la barre. */}
            <i className="ri-file-user-line" aria-hidden="true"></i>
            {t('acct.appl.receivedTab')}
            <span className="capp-n">{received.length}</span>
          </button>
        </div>
        {tab === 'received' && (
          <CsvExportButton
            total={shown.length}
            ghost
            run={() => downloadApplicationsCsv(buildApplicationsCsv({
              rows: shown,
              lang,
              t,
              filters: { query, pays },
            }))}
          />
        )}
        {tab === 'received' && (
          <CopyTextButton
            label={t('acct.appl.summaryCopy')}
            hint={t('acct.appl.summaryNote')}
            className="ghost-btn"
            build={() => buildApplicationsSummary({
              lang,
              t,
              received: received.length,
              todo: todo.length,
              late: lateRows.length,
              compare: monthCompare,
              pays: tally,
              filters: { query, pays },
              shown: shown.length,
            })}
          />
        )}
        </div>
      </div>

      {notice && <p className="form-msg ok">{notice}</p>}
      {failure && <p className="form-msg err">{failure}</p>}

      {/* Les accusés de réception d'une candidature envoyée : combien sont
          revenus, combien attendent encore, et depuis quand le plus ancien. */}
      {tab === 'sent' && sent.length > 0 && (
        <div className="capp-ack" aria-live="polite">
          <span className="capp-ack-cell is-done">
            <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
            <b>{acked}</b>
            <span>{t('acct.appl.ackDone')}</span>
          </span>
          <span className="capp-ack-cell" data-wait={pendingAck > 0 ? 'yes' : 'no'}>
            <i className={pendingAck > 0 ? 'ri-time-line' : 'ri-check-double-line'} aria-hidden="true"></i>
            <b>{pendingAck}</b>
            <span>{t('acct.appl.ackWaiting')}</span>
          </span>
          {pendingAck > 0 && (
            <span className="capp-ack-oldest">
              <i className="ri-hourglass-line" aria-hidden="true"></i>
              {pendingDays === 0
                ? t('acct.appl.ackOldestToday')
                : t('acct.appl.ackOldest').replace('{n}', String(pendingDays))}
            </span>
          )}
        </div>
      )}

      {tab === 'received' && (
        <div className="capp-toolbar">
        <div className="capp-filter" role="group" aria-label={t('acct.appl.filterLabel')}>
          {/* L'offre lue seule : le jeton la nomme et la retire d'un clic. */}
          {offre && (
            <button
              type="button"
              className="capp-chip capp-chip-offer is-on"
              aria-pressed
              onClick={() => setOffre('')}
              title={t('acct.appl.offerChipClear')}
            >
              <i className="ri-briefcase-line" aria-hidden="true"></i>
              <span className="capp-chip-offer-name">
                {t('acct.appl.offerChip').replace('{titre}', offreTitre || t('acct.appl.offerUntitled'))}
              </span>
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          )}
          <button
            type="button"
            className={`capp-chip${onlyTodo || onlyLate || onlySilent ? '' : ' is-on'}`}
            aria-pressed={!onlyTodo && !onlyLate && !onlySilent}
            onClick={() => {
              setOnlyTodo(false);
              setOnlyLate(false);
              setOnlySilent(false);
            }}
          >
            <i className="ri-list-check-2" aria-hidden="true"></i>
            {t('acct.appl.filterAll')}
            <span className="capp-n">{received.length}</span>
          </button>
          <button
            type="button"
            className={`capp-chip${onlyTodo ? ' is-on' : ''}`}
            aria-pressed={onlyTodo}
            onClick={() => {
              setOnlyLate(false);
              setOnlySilent(false);
              setOnlyTodo(true);
            }}
          >
            <i className="ri-inbox-unarchive-line" aria-hidden="true"></i>
            {t('acct.appl.filterTodo')}
            <span className="capp-n">{todo.length}</span>
          </button>
          {lateRows.length > 0 && (
            <button
              type="button"
              className={`capp-chip${onlyLate ? ' is-on' : ''}`}
              aria-pressed={onlyLate}
              onClick={() => {
                setOnlyTodo(false);
                setOnlySilent(false);
                setOnlyLate(!onlyLate);
              }}
              title={t('acct.appl.filterLateNote')}
            >
              <i className="ri-alarm-warning-line" aria-hidden="true"></i>
              {t('acct.appl.filterLate')}
              <span className="capp-n">{lateRows.length}</span>
            </button>
          )}
          {/* Les dossiers muets : ni accusé de réception, ni décision. Le
              filtre les garde seuls à l'écran, la réponse à portée de main. */}
          {silentRows.length > 0 && (
            <button
              type="button"
              className={`capp-chip${onlySilent ? ' is-on' : ''}`}
              aria-pressed={onlySilent}
              onClick={() => {
                setOnlyTodo(false);
                setOnlyLate(false);
                setOnlySilent(!onlySilent);
              }}
              title={t('acct.appl.filterSilentNote')}
            >
              <i className="ri-mail-forbid-line" aria-hidden="true"></i>
              {t('acct.appl.filterSilent')}
              <span className="capp-n">{silentRows.length}</span>
            </button>
          )}
        </div>

        <div className="capp-search">
          <i className="ri-search-line" aria-hidden="true"></i>
          <input
            type="search"
            id="capp-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('acct.appl.searchPh')}
            aria-label={t('acct.appl.searchLabel')}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="capp-search-clear"
              onClick={() => setQuery('')}
              aria-label={t('acct.appl.searchClear')}
              title={t('acct.appl.searchClear')}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          )}
        </div>

        <label className="capp-sort" htmlFor="capp-sort">
          <i className="ri-sort-desc" aria-hidden="true"></i>
          <select
            id="capp-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ApplicationSort)}
            aria-label={t('acct.appl.sortLabel')}
            title={t('acct.appl.sortLabel')}
          >
            <option value="recent">{t('acct.appl.sortRecent')}</option>
            <option value="name">{t('acct.appl.sortName')}</option>
            <option value="status">{t('acct.appl.sortStatus')}</option>
            <option value="pays">{t('acct.appl.sortPays')}</option>
            <option value="silent">{t('acct.appl.sortSilent')}</option>
          </select>
          <i className="ri-arrow-down-s-line capp-sort-caret" aria-hidden="true"></i>
        </label>
        </div>
      )}

      {/* L'ordre « silence le plus long » se dit sous la barre : combien de
          dossiers muets il remonte, et depuis combien de jours le plus ancien. */}
      {tab === 'received' && sort === 'silent' && (
        <p className="capp-silent-sort" title={t('acct.appl.sortSilentHint')}>
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          <span>
            {silentRows.length > 0
              ? t('acct.appl.sortSilentNote')
                .replace('{n}', String(silentRows.length))
                .replace('{days}', String(Math.max(
                  0,
                  ...silentRows.map((row) => ageInDays(row.created_at)),
                )))
                /* Le plus ancien dossier muet se nomme : son âge en jours et
                   le candidat concerné, pour mesurer avant d'écrire. */
                .replace('{nom}', (
                  oldestSilent?.candidat_nom
                  || oldestSilent?.candidat_email
                  || t('acct.appl.applicant')
                ).trim())
              : t('acct.appl.sortSilentNone')}
          </span>
          {oldestSilent && (
            <button
              type="button"
              className="capp-silent-sort-write"
              onClick={() => void reply(oldestSilent)}
              disabled={busyId === oldestSilent.id}
              title={t('acct.appl.sortSilentWriteHint').replace(
                '{nom}',
                (oldestSilent.candidat_nom || oldestSilent.candidat_email || t('acct.appl.applicant')).trim(),
              )}
            >
              <i className="ri-reply-line" aria-hidden="true"></i>
              {busyId === oldestSilent.id ? t('acct.appl.opening') : t('acct.appl.sortSilentWrite')}
              {/* Ce qui attend derrière le premier dossier : la file se mesure
                  avant de l'ouvrir, sans quitter la ligne du tri. */}
              {silentRows.length > 1 && (
                <span
                  className="capp-silent-sort-rest"
                  title={t('acct.appl.sortSilentWriteRestHint')
                    .replace('{n}', String(silentRows.length - 1))}
                >
                  {t('acct.appl.sortSilentWriteRest').replace('{n}', String(silentRows.length - 1))}
                </span>
              )}
            </button>
          )}
          {/* Le dossier ouvert, la relance datée : le tri dit le jour du
              dernier mot essayé, pour ne pas relancer deux fois de suite. */}
          {oldestSilent && relances[oldestSilent.id] && (
            <span
              className="capp-silent-sort-relance"
              title={t('acct.appl.sortSilentRelanceHint')}
            >
              <i className="ri-repeat-line" aria-hidden="true"></i>
              {t('acct.appl.sortSilentRelance').replace(
                '{date}',
                day(relances[oldestSilent.id]),
              )}
            </span>
          )}
          <button type="button" className="capp-silent-sort-clear" onClick={() => setSort('recent')}>
            <i className="ri-close-line" aria-hidden="true"></i>
            {t('acct.appl.sortSilentClear')}
          </button>
        </p>
      )}

      {/* Les dossiers reçus qu'aucune réponse n'a encore touchés, depuis plus
          d'une semaine : le silence se compte avant la liste, et le compte
          ouvre le filtre qui les garde seuls — la réponse est juste après. */}
      {tab === 'received' && !loading && !error && silentRows.length > 0 && (
        <button
          type="button"
          className={`capp-silent${onlySilent ? ' is-on' : ''}`}
          aria-pressed={onlySilent}
          title={onlySilent ? t('acct.appl.silentDoorOff') : t('acct.appl.silentDoor')}
          onClick={showSilent}
        >
          <i className="ri-mail-forbid-line" aria-hidden="true"></i>
          <span>{t('acct.appl.silentTotal').replace('{n}', String(silentRows.length))}</span>
          <i className={onlySilent ? 'ri-close-line' : 'ri-arrow-right-line'} aria-hidden="true"></i>
        </button>
      )}

      {tab === 'received' && (monthCompare.now > 0 || monthCompare.before > 0) && (
        <div className="mine-cmp" aria-live="polite" title={t('acct.appl.cmpNote')}>
          <span className="mine-cmp-label">
            <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
            {t('acct.appl.cmpLabel')}
          </span>
          <span className="mine-cmp-cell">
            <small>{t('acct.appl.cmpPrev')}</small>
            <b>{monthCompare.before}</b>
          </span>
          <span className="mine-cmp-cell is-now">
            <small>{t('acct.appl.cmpNow')}</small>
            <b>{monthCompare.now}</b>
          </span>
          <span
            className={`mine-cmp-delta${monthCompare.delta > 0 ? ' is-up' : monthCompare.delta < 0 ? ' is-down' : ' is-flat'}`}
          >
            <i
              className={monthCompare.delta > 0
                ? 'ri-arrow-up-line'
                : monthCompare.delta < 0 ? 'ri-arrow-down-line' : 'ri-subtract-line'}
              aria-hidden="true"
            ></i>
            <b>
              {monthCompare.delta > 0
                ? `+${monthCompare.delta}`
                : monthCompare.delta < 0 ? `\u2212${Math.abs(monthCompare.delta)}` : '\u00b10'}
            </b>
            <span>
              {monthCompare.delta > 0
                ? t('acct.appl.cmpUp')
                : monthCompare.delta < 0 ? t('acct.appl.cmpDown') : t('acct.appl.cmpFlat')}
            </span>
          </span>
        </div>
      )}

      {tab === 'received' && tallyTotal > 0 && (
        <PaysTally
          counts={tally}
          total={tallyTotal}
          active={pays}
          onPick={(code) => setPays(code === pays ? '' : code)}
          share={false}
          paysSort={{
            active: sort === 'pays',
            onToggle: () => setSort(sort === 'pays' ? 'recent' : 'pays'),
          }}
        />
      )}

      {loading ? (
        <p className="acct-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('acct.appl.loading')}
        </p>
      ) : error ? (
        <div className="capp-error">
          <p className="auth-note">{t('acct.appl.error')}</p>
          <button type="button" className="ghost-btn" onClick={() => void reload()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t('acct.appl.retry')}
          </button>
        </div>
      ) : shown.length === 0 ? (
        <div className="capp-empty">
          <i
            className={tab === 'sent'
              ? 'ri-file-list-3-line'
              : searching
                ? 'ri-search-line'
                : pays ? 'ri-global-line' : offre ? 'ri-briefcase-line' : onlyLate ? 'ri-alarm-warning-line' : onlySilent ? 'ri-mail-forbid-line' : 'ri-inbox-line'}
            aria-hidden="true"
          ></i>
          <p>
            {tab === 'sent'
              ? t('acct.appl.emptySent')
              : searching
                ? t('acct.appl.searchEmpty')
                : pays
                  ? t('acct.appl.emptyPays')
                  : offre
                    ? t('acct.appl.emptyOffre')
                    : onlyLate
                      ? t('acct.appl.emptyLate')
                      : onlySilent
                        ? t('acct.appl.emptySilent')
                        : onlyTodo
                          ? t('acct.appl.emptyTodo')
                          : t('acct.appl.emptyReceived')}
          </p>
          {tab === 'sent' && (
            <Link to="/emplois" className="ghost-btn">
              {t('acct.applyShortcut')}
            </Link>
          )}
          {tab === 'received' && searching && (
            <button type="button" className="ghost-btn" onClick={() => setQuery('')}>
              <i className="ri-close-line" aria-hidden="true"></i>
              {t('acct.appl.searchClear')}
            </button>
          )}
          {tab === 'received' && !searching && onlyTodo && (
            <button type="button" className="ghost-btn" onClick={() => setOnlyTodo(false)}>
              {t('acct.appl.filterAll')}
            </button>
          )}
          {tab === 'received' && !searching && onlyLate && (
            <button type="button" className="ghost-btn" onClick={() => setOnlyLate(false)}>
              {t('acct.appl.filterAll')}
            </button>
          )}
          {tab === 'received' && !searching && onlySilent && (
            <button type="button" className="ghost-btn" onClick={() => setOnlySilent(false)}>
              {t('acct.appl.filterAll')}
            </button>
          )}
          {tab === 'received' && !searching && pays && (
            <button type="button" className="ghost-btn" onClick={() => setPays('')}>
              <i className="ri-global-line" aria-hidden="true"></i>
              {t('pays.all')}
            </button>
          )}
          {tab === 'received' && offre && (
            <button type="button" className="ghost-btn" onClick={() => setOffre('')}>
              <i className="ri-briefcase-line" aria-hidden="true"></i>
              {t('acct.appl.offerChipClear')}
            </button>
          )}
        </div>
      ) : (
        <ul className="capp-list" id="capp-silent-list">
          {shown.map((row) => {
            const other = otherOf(row);
            const busy = busyId === row.id;
            const age = ageInDays(row.created_at);
            /* An old dossier already decided is not late: only the ones still
               waiting on the employer carry the warning after a week. */
            const late = age >= LATE_DAYS && !isSettled(row.statut);
            /* Rien n'est encore parti au candidat : c'est un silence, non
               seulement un retard — la ligne le dit à sa manière. */
            const silent = tab === 'received' && isSilentDossier(row);
            /* La relance tentée sur ce dossier : récente, elle se replie d'un
               clic ; plus ancienne, elle reste dépliée, la date sous les yeux. */
            const relanceAt = relances[row.id] ?? '';
            const relanceRecent = Boolean(relanceAt)
              && Date.now() - stampOf(relanceAt) < RELANCE_FOLD_DAYS * DAY_MS;
            const relanceFolded = relanceRecent && foldedRelances.includes(row.id);
            return (
              <li key={row.id} className="capp-row" data-state={row.statut}>
                <div className="capp-top">
                  <span
                    className="capp-badge"
                    data-state={row.statut}
                    data-fresh={tab === 'sent' && freshIds.includes(row.id) ? 'yes' : undefined}
                    title={tab === 'sent' && freshIds.includes(row.id) ? t('acct.appl.freshStatus') : undefined}
                  >
                    {t(STATUS_KEY[row.statut])}
                  </span>
                  <h3 className="capp-title">{row.offre_titre}</h3>
                  <span className="capp-date">
                    {t('acct.appl.sentOn')} {day(row.created_at)}
                  </span>
                  {tab === 'received' && (
                    <span
                      className={`capp-age${silent ? ' is-silent' : late ? ' is-late' : ''}`}
                      title={silent
                        ? t('acct.appl.silentRowHint')
                        : late ? t('acct.appl.ageLateNote') : t('acct.appl.ageNote')}
                    >
                      <i
                        className={silent ? 'ri-mail-forbid-line' : late ? 'ri-alarm-warning-line' : 'ri-timer-line'}
                        aria-hidden="true"
                      ></i>
                      {silent
                        ? `${t('acct.appl.silentSince')} ${age} ${t(age > 1 ? 'acct.mine.dayMany' : 'acct.mine.dayOne')}`
                        : age === 0
                          ? t('acct.appl.ageToday')
                          : `${t('acct.appl.ageSince')} ${age} ${t(age > 1 ? 'acct.mine.dayMany' : 'acct.mine.dayOne')}`}
                    </span>
                  )}
                  {/* Sur une ligne muette, la dernière relance tentée se lit
                      sans passer par le tri : on sait si le mot est parti
                      aujourd’hui ou il y a cinq jours. Une relance récente se
                      replie d’un clic, la date restant au survol. */}
                  {silent && relanceAt && (
                    relanceRecent ? (
                      <button
                        type="button"
                        className={`capp-relance is-door${relanceFolded ? ' is-folded' : ''}`}
                        aria-expanded={!relanceFolded}
                        title={relanceFolded
                          ? `${t('acct.appl.rowRelance').replace('{date}', day(relanceAt))} · ${t('acct.appl.rowRelanceUnfold')} · ${t('acct.appl.rowRelanceKept')}`
                          : `${t('acct.appl.rowRelanceFold')} ${t('acct.appl.rowRelanceKept')}`}
                        onClick={() => setFoldedRelances((current) => toggleRelanceFold(row.id, current))}
                      >
                        <i className="ri-repeat-line" aria-hidden="true"></i>
                        {relanceFolded
                          ? t('acct.appl.rowRelanceShort')
                          : t('acct.appl.rowRelance').replace('{date}', day(relanceAt))}
                        <i
                          className={relanceFolded
                            ? 'ri-arrow-down-s-line capp-relance-caret'
                            : 'ri-arrow-up-s-line capp-relance-caret'}
                          aria-hidden="true"
                        ></i>
                      </button>
                    ) : (
                      <span className="capp-relance" title={t('acct.appl.rowRelanceHint')}>
                        <i className="ri-repeat-line" aria-hidden="true"></i>
                        {t('acct.appl.rowRelance').replace('{date}', day(relanceAt))}
                      </span>
                    )
                  )}
                </div>

                <p className="capp-meta">
                  {tab === 'received' ? (
                    <span>
                      <i className="ri-user-line" aria-hidden="true"></i>
                      {other.nom || t('acct.appl.applicant')}
                    </span>
                  ) : (
                    <span>
                      <i className="ri-building-2-line" aria-hidden="true"></i>
                      {row.entreprise}
                    </span>
                  )}
                  {tab === 'received' && <PaysBadge code={row.candidat_pays} />}
                  {row.telephone && (
                    <span>
                      <i className="ri-phone-line" aria-hidden="true"></i>
                      <a href={`tel:${row.telephone}`}>{row.telephone}</a>
                    </span>
                  )}
                  {(row.cv_path || row.cv_url) && (
                    <span>
                      <i className="ri-file-text-line" aria-hidden="true"></i>
                      <button
                        type="button"
                        className="capp-cv-btn"
                        onClick={() => void openApplicationCv(row)}
                      >
                        {t('acct.appl.cv')}
                      </button>
                    </span>
                  )}
                  {tab === 'received' && row.candidat_email && (
                    <span>
                      <i className="ri-mail-line" aria-hidden="true"></i>
                      <a href={`mailto:${row.candidat_email}`}>{row.candidat_email}</a>
                    </span>
                  )}
                </p>

                <p className="capp-body">
                  <i className="ri-chat-quote-line" aria-hidden="true"></i>
                  {row.message}
                </p>

                {row.note_employeur && (
                  <p className="capp-note">
                    <i className="ri-quill-pen-line" aria-hidden="true"></i>
                    <span>
                      <strong>
                        {tab === 'received'
                          ? t('acct.appl.noteSentLabel')
                          : t('acct.appl.noteFromEmployer')}
                        {' '}
                      </strong>
                      {row.note_employeur}
                    </span>
                  </p>
                )}

                {/* Ce qui est déjà parti au candidat — côté employeur —, et ce
                    que PaperAtlas a envoyé au candidat — côté candidat. Dans
                    les deux cas : l'accusé de réception et le courriel de
                    décision, chacun avec sa date réelle. Une date n'est écrite
                    que si l'envoi a eu lieu ; sinon la ligne dit ce qui manque. */}
                <p className="capp-sent">
                  <i className="ri-mail-check-line" aria-hidden="true"></i>
                  <span>
                    <strong>
                      {tab === 'received'
                        ? t('acct.appl.trailTitle')
                        : t('acct.appl.trailMineTitle')}
                    </strong>
                    <span className="capp-sent-item" title={t('acct.appl.trailAckHint')}>
                      <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
                      {t('acct.appl.trailAck')}
                      {' · '}
                      <b>{row.accuse_at ? day(row.accuse_at) : t('acct.appl.trailAckNone')}</b>
                    </span>
                    <span className="capp-sent-item" title={t('acct.appl.trailDecisionHint')}>
                      <i className="ri-send-plane-line" aria-hidden="true"></i>
                      {t('acct.appl.trailDecision')}
                      {' · '}
                      <b>
                        {row.decision_envoyee_at
                          ? day(row.decision_envoyee_at)
                          : isSettled(row.statut)
                            ? t('acct.appl.trailDecisionNoMail')
                            : t('acct.appl.trailDecisionNone')}
                      </b>
                    </span>
                  </span>
                </p>

                <div className="capp-actions">
                  <Link to={`/emplois/${row.offre_id}`} className="ad-btn">
                    <i className="ri-external-link-line" aria-hidden="true"></i>
                    {t('acct.appl.viewOffer')}
                  </Link>
                  {tab === 'received' && row.user_id && (
                    <Link to={`/candidats/${row.user_id}`} className="ad-btn">
                      <i className="ri-user-search-line" aria-hidden="true"></i>
                      {t('acct.appl.viewProfile')}
                    </Link>
                  )}
                  {/* Le geste court de l'aire, sur le profil du candidat reçu :
                      la carte d'une candidature l'annonce comme celle du vivier,
                      sans passer par la fiche. */}
                  {tab === 'received' && (
                    <AireCopyProfile
                      pays={row.candidat_pays}
                      nom={(row.candidat_nom || row.candidat_email || '').trim()}
                      kind="candidat"
                    />
                  )}
                  <button type="button" className="ad-btn ad-btn--solid" onClick={() => void reply(row)} disabled={busy}>
                    <i className="ri-reply-line" aria-hidden="true"></i>
                    {busy ? t('acct.appl.opening') : t('acct.appl.reply')}
                  </button>

                  {tab === 'received' && (
                    <>
                      {row.statut === 'envoyee' && (
                        <button type="button" className="ad-btn" onClick={() => void move(row, 'vue')} disabled={busy}>
                          <i className="ri-eye-line" aria-hidden="true"></i>
                          {t('acct.appl.markVue')}
                        </button>
                      )}
                      {row.statut !== 'retenue' && (
                        <button type="button" className="ad-btn" onClick={() => openNote(row)} disabled={busy}>
                          <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
                          {t('acct.appl.accept')}
                        </button>
                      )}
                      {row.statut !== 'refusee' && (
                        <button type="button" className="ad-btn" onClick={() => void move(row, 'refusee')} disabled={busy}>
                          <i className="ri-close-circle-line" aria-hidden="true"></i>
                          {t('acct.appl.refuse')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {noteFor && (
        <div
          className="capp-modal-backdrop"
          role="presentation"
          onClick={() => setNoteFor(null)}
        >
          <div
            className="capp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="capp-note-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="capp-modal-head">
              <div>
                <h3 className="capp-modal-title" id="capp-note-title">
                  {t('acct.appl.noteTitle')}
                </h3>
                <p className="auth-note capp-modal-sub">
                  {noteFor.candidat_nom || noteFor.candidat_email || t('acct.appl.applicant')}
                </p>
              </div>
              <button
                type="button"
                className="capp-modal-close"
                onClick={() => setNoteFor(null)}
                aria-label={t('acct.appl.noteCancel')}
                title={t('acct.appl.noteCancel')}
              >
                <i className="ri-close-line" aria-hidden="true"></i>
              </button>
            </div>

            <p className="auth-note capp-modal-intro">{t('acct.appl.noteIntro')}</p>

            <textarea
              className="capp-note-field"
              value={noteDraft}
              maxLength={400}
              rows={4}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder={t('acct.appl.notePh')}
              aria-label={t('acct.appl.noteTitle')}
            />
            <p className="capp-note-count">
              {/* The two numbers stay one run: on a right-to-left page a bare
                  « 400 / 0 » would otherwise read backwards. */}
              <span className="capp-note-num">{noteDraft.length} / 400</span>
              <span className="capp-note-hint">{t('acct.appl.noteOptional')}</span>
            </p>

            <div className="capp-modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setNoteFor(null)}>
                {t('acct.appl.noteCancel')}
              </button>
              <button type="button" className="ad-btn ad-btn--solid" onClick={() => void confirmShortlist()}>
                <i className="ri-send-plane-line" aria-hidden="true"></i>
                {t('acct.appl.noteSend')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}