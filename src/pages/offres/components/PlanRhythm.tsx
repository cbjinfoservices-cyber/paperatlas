import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { saveCsv } from '@/lib/csv';
import {
  clearJournalMonth,
  journalHref,
  keepJournalFilter,
  keepJournalMonth,
} from '@/lib/journalFilter';
import { supabase } from '@/lib/supabase';
import { planCardHref } from './plans';
import { buildRhythmCsv, rhythmCsvFilename, type RhythmMonth } from './planRhythmCsv';

type Rhythm = {
  /** Everything that climbed to Premium since the journal opened. */
  up: number;
  /** Only the climbs written since the 1st of the current month. */
  upMonth: number;
};

type MonthPoint = RhythmMonth;

/** The public, aggregate-only view of the journal: three numbers, no names. */
const VIEW = 'paperatlas_formules_rythme';
/** The same counters, one row per month over the last six months. */
const MONTH_VIEW = 'paperatlas_formules_rythme_mois';

/**
 * The pace of the climbs to Premium, on one public line, with the last six
 * months drawn underneath. The numbers come from the very same counters the
 * member journal uses, but read through an aggregate — a visitor sees how many,
 * never who.
 *
 * Two doors leave this block: the Premium card, and the member journal already
 * narrowed on this month, so the figure can be followed down to the lines it
 * counts. The six columns can also be taken away as a sheet.
 *
 * If the views cannot be read, the block simply stays away: it is a signal, not
 * the page.
 */
export default function PlanRhythm() {
  const { t, lang } = useLang();
  const [rhythm, setRhythm] = useState<Rhythm | null>(null);
  const [months, setMonths] = useState<MonthPoint[]>([]);
  const [csvDone, setCsvDone] = useState(false);
  const [csvFailed, setCsvFailed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;

    const readLine = async () => {
      try {
        const { data, error } = await supabase
          .from(VIEW)
          .select('vers_premium, vers_premium_mois')
          .maybeSingle();
        if (error) throw error;
        if (!alive) return;
        setRhythm({
          up: Number(data?.vers_premium ?? 0),
          upMonth: Number(data?.vers_premium_mois ?? 0),
        });
      } catch {
        if (alive) setRhythm(null);
      }
    };

    const readMonths = async () => {
      try {
        const { data, error } = await supabase
          .from(MONTH_VIEW)
          .select('mois, montee')
          .order('mois', { ascending: true });
        if (error) throw error;
        if (!alive) return;
        setMonths(
          (data ?? []).map((row) => ({
            mois: String(row.mois ?? ''),
            montee: Number(row.montee ?? 0),
          })),
        );
      } catch {
        if (alive) setMonths([]);
      }
    };

    void readLine();
    void readMonths();

    return () => {
      alive = false;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  if (!rhythm) return null;

  const quiet = rhythm.up === 0;
  const peak = months.reduce((top, point) => Math.max(top, point.montee), 0);
  const monthLabel = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { month: 'short' }).format(date);
  };

  /* The sheet is built from the six columns on screen, day after day the same
     way — nothing is asked of the network, so it cannot leave a stale file. */
  const runExport = () => {
    setCsvFailed(false);
    try {
      saveCsv(rhythmCsvFilename(), buildRhythmCsv({ months, lang, t }));
      setCsvDone(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCsvDone(false), 2600);
    } catch {
      setCsvFailed(true);
    }
  };

  return (
    <div className="of-rhythm-block">
      <div className="of-rhythm">
        <span className="of-rhythm-ico" aria-hidden="true">
          <i className="ri-line-chart-line"></i>
        </span>

        {quiet ? (
          <p className="of-rhythm-txt">{t('ofr.none')}</p>
        ) : (
          <p className="of-rhythm-txt">
            <b>{rhythm.upMonth}</b> <span>{t('ofr.upMonth')}</span>
            <span className="of-rhythm-sep" aria-hidden="true">·</span>
            <b>{rhythm.up}</b> <span>{t('ofr.upAll')}</span>
          </p>
        )}

        <div className="of-rhythm-actions">
          {/* The figure and the lines it counts, one click apart: the member
              journal opens already narrowed on this month. */}
          <Link
            className="of-rhythm-link"
            to={journalHref('month')}
            title={t('ofr.journalTip')}
            onClick={() => {
              keepJournalFilter('month');
              /* The plain door always leads to the month running now, never to
                 the one a chart column asked for earlier. */
              clearJournalMonth();
            }}
          >
            <i className="ri-book-open-line of-rhythm-link-lead" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ofr.journal')}</span>
          </Link>

          <Link className="of-rhythm-link" to={planCardHref('premium')}>
            <span className="whitespace-nowrap">{t('ofr.view')}</span>
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
        </div>
      </div>

      {months.length > 0 && (
        <div className="of-rhythm-chart">
          <span className="of-rhythm-chart-lab">{t('ofr.chartTitle')}</span>
          <ul className="of-bars" aria-label={t('ofr.chartAria')}>
            {months.map((point) => {
              /* The tallest month fills the column; a month with no move keeps a
                 thin base line so the row never looks broken. */
              const ratio = peak > 0 ? point.montee / peak : 0;
              const height = point.montee > 0 ? Math.max(14, Math.round(ratio * 100)) : 3;
              const label = monthLabel(point.mois);
              /* Each column is a door: it hands the journal its own month, not
                 the one running now, so the figure can be followed down to the
                 moves it counts. */
              const month = point.mois.slice(0, 7);
              return (
                <li key={point.mois || label}>
                  <Link
                    className={`of-bar${point.montee > 0 ? ' has-move' : ''}`}
                    to={journalHref('month', month)}
                    title={`${label} · ${point.montee} ${t('ofr.upUnit')} — ${t('ofr.barTip')}`}
                    aria-label={`${label} · ${point.montee} ${t('ofr.upUnit')} · ${t('ofr.barOpen')}`}
                    onClick={() => {
                      keepJournalFilter('month');
                      keepJournalMonth(month);
                    }}
                  >
                    <span className="of-bar-track">
                      <span className="of-bar-fill" style={{ height: `${height}%` }}></span>
                    </span>
                    <span className="of-bar-num">{point.montee}</span>
                    <span className="of-bar-month">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {peak === 0 && <p className="of-rhythm-chart-note">{t('ofr.chartQuiet')}</p>}

          <div className="of-rhythm-chart-foot">
            <p className="of-rhythm-chart-hint">
              <i className="ri-information-line" aria-hidden="true"></i>
              <span>{t('ofr.csvHint')}</span>
            </p>
            <button
              type="button"
              className={`ghost-btn of-rhythm-csv${csvDone ? ' is-ok' : ''}`}
              onClick={runExport}
              title={`${t('ofr.csvCta')} (${months.length})`}
            >
              <i className={csvDone ? 'ri-check-line' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
              <span className="whitespace-nowrap">
                {csvDone ? t('dirCsv.done') : `${t('ofr.csvCta')} (${months.length})`}
              </span>
            </button>
            {csvFailed && <p className="form-msg err of-rhythm-csv-err">{t('ofj.csvError')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}