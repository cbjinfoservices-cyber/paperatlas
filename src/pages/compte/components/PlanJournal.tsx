import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { dayStamp, monthLong } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { saveCsv } from '@/lib/csv';
import {
  JOURNAL_FILTERS,
  clearJournalFilter,
  clearJournalMonth,
  isJournalFilter,
  isMonthKey,
  peekJournalFilter,
  peekJournalMonth,
  type JournalFilter,
} from '@/lib/journalFilter';
import { useAuth } from '@/auth/AuthProvider';
import { planById } from '@/pages/offres/components/plans';
import {
  buildPlanJournalCsv,
  planJournalCsvFilename,
  type JournalRow,
} from './planJournalCsv';

type Row = JournalRow;

/** How many moves the short journal keeps on screen. */
const LIMIT = 8;

const TABLE = 'paperatlas_formules_journal';
const COLS = 'id, compte_id, nom, organisme, formule_avant, formule_apres, rythme, change_at';

/** The simple reads of the journal: everything, the climbs to Premium, the
 *  slides back to the Directory, the organisations that moved to Institutions,
 *  and whatever moved since the 1st. */
type Filter = JournalFilter;

const FILTERS = JOURNAL_FILTERS;

const FILTER_LABEL: Record<Filter, string> = {
  all: 'ofj.fAll',
  up: 'ofj.fUp',
  down: 'ofj.fDown',
  inst: 'ofj.fInst',
  month: 'ofj.fMonth',
};

const FILTER_TIP: Record<Filter, string | null> = {
  all: null,
  up: 'ofj.tipUp',
  down: 'ofj.tipDown',
  inst: 'ofj.tipInst',
  month: 'ofj.tipMonth',
};

/** The phrase shown when a filter leaves the list empty. */
const EMPTY_KEY: Record<Filter, string> = {
  all: 'ofj.empty',
  up: 'ofj.emptyFilter',
  down: 'ofj.emptyFilter',
  inst: 'ofj.emptyFilterInst',
  month: 'ofj.emptyFilterMonth',
};

/** The first instant of the month running now, and of the month after it, in
 *  the reader's own time. An explicit `2026-05` bucket narrows to that month. */
function monthBounds(key = ''): { start: string; end: string } {
  const [year, month] = key.split('-').map(Number);
  if (isMonthKey(key) && Number.isFinite(year) && Number.isFinite(month)) {
    return {
      start: new Date(year, month - 1, 1).toISOString(),
      end: new Date(year, month, 1).toISOString(),
    };
  }
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  };
}

/** The month running now, as a `2026-05` bucket. */
function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** The length shown beside a move, read from the value written on the line. */
const RYTHME_LABEL: Record<string, string> = {
  mois: 'ofj.rythmeMois',
  mensuel: 'ofj.rythmeMois',
  trimestriel: 'off.m2t',
  semestre: 'off.m3t',
  annee: 'ofj.rythmeAnnee',
};

/** How many moves the export is allowed to carry in one sheet. */
const EXPORT_LIMIT = 2000;

/** The journal, narrowed to one movement — the list and the export read the
 *  very same rows, so the sheet always matches the filter on screen. */
function journalQuery(which: Filter, month = '') {
  const base = supabase.from(TABLE).select(COLS);
  if (which === 'up') return base.eq('formule_apres', 'annee').neq('formule_avant', 'annee');
  if (which === 'down') return base.eq('formule_apres', 'mensuel').neq('formule_avant', 'mensuel');
  if (which === 'inst') return base.eq('formule_apres', 'institutions').neq('formule_avant', 'institutions');
  if (which === 'month') {
    const { start, end } = monthBounds(month);
    return base.gte('change_at', start).lt('change_at', end);
  }
  return base;
}

type Props = {
  /** Bumped right after a change, so the journal reads itself again. */
  refreshKey?: number;
};

/**
 * A short journal of the formula moves: who left the Directory for Premium (or
 * the other way), and when. Only the name, the workshop, the two plans and the
 * date travel — the entries are never the account rows themselves.
 *
 * The three simple filters sit above the list, each carrying its own count, so
 * a reader can see at a glance how many climbs, how many slides back, and how
 * much moved this month without reading every line.
 */
export default function PlanJournal({ refreshKey = 0 }: Props) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  /* A public page can hand the journal over already narrowed — « ce mois-ci »
     from the pace line on « Offres », for instance. The wanted cut is read from
     the address, then from the one-shot memory that survives the sign-in
     detour. After that, the tabs alone decide. */
  const [params] = useSearchParams();
  const asked = params.get('journal');
  /* A column of the six-month chart on « Offres » asks for one exact month,
     carried as `jm=2026-05` — or through the one-shot memory that survives
     the sign-in detour. Without one, the tab follows the month running now. */
  const askedMonth = params.get('jm');
  /* The cut opens on what the address names, else on what the previous page
     kept for this one arrival, else on the whole journal. */
  const [filter, setFilter] = useState<Filter>(() => {
    if (isJournalFilter(asked)) return asked;
    return peekJournalFilter() ?? 'all';
  });
  const [focusMonth, setFocusMonth] = useState<string>(() => {
    if (isMonthKey(askedMonth)) return askedMonth;
    return peekJournalMonth() ?? '';
  });
  /* Whether the reader came here asking for a cut: it decides if the block is
     walked to, so an arrival from another page does not land at the top. */
  const [landed] = useState(
    () => isJournalFilter(asked) || peekJournalFilter() !== null
      || isMonthKey(askedMonth) || peekJournalMonth() !== null,
  );
  const sectionRef = useRef<HTMLElement | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Record<Filter, number | null>>({
    all: null,
    up: null,
    down: null,
    inst: null,
    month: null,
  });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvFailed, setCsvFailed] = useState(false);

  /* The list follows the chosen filter, and only that filter. The month tab
     reads the month on screen: the running one, or the one a chart column
     handed over. */
  const loadRows = useCallback(async (which: Filter, month: string) => {
    setLoading(true);
    setFailed(false);
    try {
      const { data, error } = await journalQuery(which, month)
        .order('change_at', { ascending: false })
        .limit(LIMIT);
      if (error) throw error;
      setRows((data ?? []) as Row[]);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  /* The counts are read once, apart from the list: they describe the whole
     journal, not the eight lines currently on screen. */
  const loadCounts = useCallback(async (monthKeyWanted: string) => {
    const bounds = monthBounds(monthKeyWanted);
    try {
      const [all, up, down, inst, monthCount] = await Promise.all([
        supabase.from(TABLE).select('id', { count: 'exact', head: true }),
        supabase
          .from(TABLE)
          .select('id', { count: 'exact', head: true })
          .eq('formule_apres', 'annee')
          .neq('formule_avant', 'annee'),
        supabase
          .from(TABLE)
          .select('id', { count: 'exact', head: true })
          .eq('formule_apres', 'mensuel')
          .neq('formule_avant', 'mensuel'),
        supabase
          .from(TABLE)
          .select('id', { count: 'exact', head: true })
          .eq('formule_apres', 'institutions')
          .neq('formule_avant', 'institutions'),
        supabase
          .from(TABLE)
          .select('id', { count: 'exact', head: true })
          .gte('change_at', bounds.start)
          .lt('change_at', bounds.end),
      ]);
      setCounts({
        all: all.count ?? null,
        up: up.count ?? null,
        down: down.count ?? null,
        inst: inst.count ?? null,
        month: monthCount.count ?? null,
      });
    } catch {
      /* The counts are a help, not the point: the lines still read without them. */
    }
  }, []);

  useEffect(() => {
    void loadRows(filter, focusMonth);
  }, [loadRows, filter, focusMonth, nonce, refreshKey]);

  useEffect(() => {
    void loadCounts(focusMonth);
  }, [loadCounts, focusMonth, nonce, refreshKey]);

  /* The kept cut is forgotten once the journal has opened on it: the next
     visit through « Mon compte » starts on the whole journal again. */
  useEffect(() => {
    clearJournalFilter();
    clearJournalMonth();
  }, []);

  /* A reader who arrived here from another page lands on the journal itself,
     not at the top of the account. The block is walked to once it is drawn. */
  useEffect(() => {
    if (!landed) return;
    const jump = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 220);
    return () => window.clearTimeout(jump);
  }, [landed, asked, askedMonth]);

  /* The export asks the same filter for every row it holds, not just the eight
     on screen: a move that scrolled out of the list still lands in the sheet. */
  const runExport = async () => {
    setCsvBusy(true);
    setCsvFailed(false);
    try {
      const { data, error } = await journalQuery(filter, focusMonth)
        .order('change_at', { ascending: false })
        .limit(EXPORT_LIMIT);
      if (error) throw error;
      saveCsv(
        planJournalCsvFilename(),
        buildPlanJournalCsv({ rows: (data ?? []) as Row[], lang, t }),
      );
    } catch {
      setCsvFailed(true);
    } finally {
      setCsvBusy(false);
    }
  };

  const emptyKey = filter === 'month' && focusMonth ? 'ofj.emptyMonthOn' : EMPTY_KEY[filter];
  const exportTotal = counts[filter] ?? 0;
  /* A month handed over by a chart column names itself on the tab, so the cut
     on screen never reads as the month running now. */
  const focusLabel = focusMonth ? monthLong(focusMonth, localeFor(lang)) : '';
  const backToNow = Boolean(focusMonth) && focusMonth !== currentMonthKey();

  return (
    <section className="pro-card of-journal" id="journal-formules" ref={sectionRef}>
      <h2 className="pro-h">{t('ofj.title')}</h2>
      <p className="auth-note">{t('ofj.sub')}</p>

      <div className="of-journal-tabs" role="group" aria-label={t('ofj.filterAria')}>
        {FILTERS.map((key) => {
          const on = filter === key;
          const tip = key === 'month' && focusMonth ? 'ofj.tipMonthExact' : FILTER_TIP[key];
          const num = counts[key];
          const label = key === 'month' && focusLabel ? focusLabel : t(FILTER_LABEL[key]);
          return (
            <button
              key={key}
              type="button"
              className={`of-journal-tab${on ? ' is-on' : ''}`}
              aria-pressed={on}
              onClick={() => setFilter(key)}
              title={tip ? t(tip) : undefined}
            >
              <span>{label}</span>
              <span className="of-journal-tab-num" aria-hidden={num === null}>
                {num === null ? '–' : num}
              </span>
            </button>
          );
        })}
      </div>

      {focusLabel && (
        <p className="of-journal-month">
          <i className="ri-calendar-event-line" aria-hidden="true"></i>
          <span>{t('ofj.monthOn')} <b>{focusLabel}</b></span>
          {backToNow && (
            <button
              type="button"
              className="of-journal-month-x"
              onClick={() => setFocusMonth('')}
            >
              <i className="ri-close-circle-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofj.monthReset')}</span>
            </button>
          )}
        </p>
      )}

      {loading && (
        <p className="acct-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('ofj.loading')}
        </p>
      )}

      {!loading && failed && (
        <>
          <p className="form-msg err">{t('ofj.error')}</p>
          <button type="button" className="ghost-btn" onClick={() => setNonce((n) => n + 1)}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t('ofj.retry')}
          </button>
        </>
      )}

      {!loading && !failed && rows.length === 0 && <p className="auth-note">{t(emptyKey)}</p>}

      {!loading && !failed && rows.length > 0 && (
        <ul className="of-journal-list">
          {rows.map((row) => {
            const to = planById(row.formule_apres);
            const from = planById(row.formule_avant);
            const mine = Boolean(user?.id) && row.compte_id === user?.id;
            return (
              <li key={row.id} className={`of-journal-row${mine ? ' is-mine' : ''}`}>
                <span className="of-journal-icon" aria-hidden="true">
                  <i className={to?.icon ?? 'ri-arrow-right-line'}></i>
                </span>
                <span className="of-journal-body">
                  <span className="of-journal-who">
                    <b>{row.organisme || row.nom || '—'}</b>
                    {mine && <em>{t('ofj.you')}</em>}
                  </span>
                  <span className="of-journal-move">
                    <span className="of-journal-plan">{from ? t(from.name) : t('ofj.first')}</span>
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    <span className="of-journal-plan is-to">
                      {to ? t(to.name) : row.formule_apres}
                    </span>
                    {/* The length retained at the move, when the line carries
                        one: the journal says which length is paid, not only
                        that a subscription was opened. */}
                    {row.rythme && (
                      <em
                        className={`of-journal-rhy${row.rythme === 'annee' ? ' is-year' : ''}`}
                        title={t('ofj.rythmeTip')}
                      >
                        <i
                          className={row.rythme === 'annee' ? 'ri-gift-2-line' : 'ri-calendar-line'}
                          aria-hidden="true"
                        ></i>
                        {t(RYTHME_LABEL[row.rythme] ?? 'ofj.rythmeMois')}
                      </em>
                    )}
                  </span>
                </span>
                <time className="of-journal-date" dateTime={row.change_at}>
                  {dayStamp(row.change_at, localeFor(lang))}
                </time>
              </li>
            );
          })}
        </ul>
      )}

      {!failed && exportTotal > 0 && (
        <div className="of-journal-foot">
          <p className="of-journal-hint">
            <i className="ri-information-line" aria-hidden="true"></i>
            <span>{t('ofj.csvHint')}</span>
          </p>
          <button
            type="button"
            className="ghost-btn of-journal-csv"
            onClick={() => void runExport()}
            disabled={csvBusy}
            title={`${t('csv.cta')} (${exportTotal})`}
          >
            <i className={csvBusy ? 'ri-loader-4-line is-spin' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('csv.cta')} ({exportTotal})</span>
          </button>
          {csvFailed && <p className="form-msg err of-journal-csv-err">{t('ofj.csvError')}</p>}
        </div>
      )}
    </section>
  );
}