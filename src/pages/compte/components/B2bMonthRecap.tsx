import { useMemo } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { type B2bObjectifEntry, type DemandeB2b, clearedTimes, isStaleCorrection } from '@/lib/b2b';
import { detectMotif } from './b2bMotifs';
import { goalForMonth, monthKeyOf } from './b2bObjectif';

type Props = {
  rows: DemandeB2b[];
  /** The target as it stands today — the fallback when nothing was changed yet. */
  objectif: number | null;
  /** Every change of that target, so the month is judged against its own. */
  objectifHistory: B2bObjectifEntry[];
  /** Jumps to last month's « no reason » list, where the gaps can be filled. */
  onCatchUp: () => void;
  /** Opens the inbox on the closures whose reason was caught up in bulk. */
  onOpenLot: () => void;
  /** Opens the inbox on the catch-ups erased afterwards, to read them one by one. */
  onOpenCleared: () => void;
  /** Opens every correction, whatever the month: the reverse reading of the line. */
  onOpenAllCleared: () => void;
  /** Opens the fiches truly ploughed: reworked more than twice, any month. */
  onOpenRework: () => void;
  /** Opens the fiches corrected, then left in peace for over a month. */
  onOpenStale: () => void;
  /**
   * Pre-fills the chart comparison with the month just ended and the one before
   * it: the duel of the review, standing without clicking two thin bars.
   */
  onCompare?: (months: string[]) => void;
  /**
   * How many fiches the whole account has left without a correction for over
   * thirty days — the very number the account strip shows. Counted on every
   * row server-side, it can be larger than what the loaded rows carry, and the
   * door must not disappear just because the box only holds two hundred.
   */
  staleTotal?: number;
};

/** The closures of one month, and how many of them carry no reason at all. */
function readMonth(rows: DemandeB2b[], start: Date) {
  const key = monthKeyOf(start);
  const closed = rows.filter((row) => {
    if (row.statut !== 'traitee' || !row.traitee_at) return false;
    const date = new Date(row.traitee_at);
    if (Number.isNaN(date.getTime())) return false;
    return monthKeyOf(date) === key;
  });
  const total = closed.length;
  const missing = closed.filter((row) => detectMotif(row.motif) === null).length;
  /* Reasons rebuilt afterwards: part of the documented share, but of a
     different nature — the trace was caught up in bulk, not given on closing. */
  const lot = closed.filter(
    (row) => row.motif_lot_at && detectMotif(row.motif) !== null,
  ).length;
  return { key, total, missing, lot };
}

/**
 * The month that just ended, read back once: did the workshop hold its target
 * for documented closures, and how many gaps did it leave behind.
 *
 * The month is judged against the threshold that was in force back then — a
 * target raised today does not retroactively fail last month. It is also read
 * against the month before it: a share on its own says nothing about whether
 * the trace got better or worse. With no closure at all, nothing is reported.
 */
export default function B2bMonthRecap({
  rows,
  objectif,
  objectifHistory,
  onCatchUp,
  onOpenLot,
  onOpenCleared,
  onOpenAllCleared,
  onOpenRework,
  onOpenStale,
  onCompare,
  staleTotal = 0,
}: Props) {
  const { t, lang } = useLang();

  const recap = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const before = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const current = readMonth(rows, start);
    const previous = readMonth(rows, before);

    /* Corrections of that month: catch-ups that were erased afterwards. Read
       on every row, not only the closures — a request reopened since then was
       still corrected that month, and that fact does not expire. */
    const cleared = rows.filter((row) => {
      if (!row.motif_lot_clear_at) return false;
      const date = new Date(row.motif_lot_clear_at);
      if (Number.isNaN(date.getTime())) return false;
      return monthKeyOf(date) === current.key;
    }).length;

    /* The fiches taken back over twice, every month together: the hardest cut
       of the correction family, and the one no month can hide. */
    const rework = rows.filter((row) => clearedTimes(row) > 2).length;

    /* The other end of the same family: fiches already corrected, then left in
       peace for over a month. The correction was made and nobody came back, so
       the trace quietly fell out of sight — the month review is where that has
       to be visible, not only in the reason bar. */
    const stale = rows.filter((row) => isStaleCorrection(row)).length;

    const shareOf = (total: number, missing: number) =>
      total > 0 ? Math.round(((total - missing) / total) * 100) : null;

    return {
      start,
      before,
      /* The two month keys, so the duel can be pre-filled with them. */
      key: current.key,
      prevKey: previous.key,
      total: current.total,
      missing: current.missing,
      lot: current.lot,
      cleared,
      rework,
      stale,
      share: shareOf(current.total, current.missing),
      goal: goalForMonth(objectifHistory, current.key, objectif),
      prevTotal: previous.total,
      prevMissing: previous.missing,
      prevShare: shareOf(previous.total, previous.missing),
    };
  }, [rows, objectif, objectifHistory]);

  /* A month with no closure has no share to judge: saying nothing is honest. */
  if (recap.total === 0) return null;

  const share = recap.share ?? 0;
  /* The rebuilt part, read against the closures that do carry a reason: it is
     a slice of the documented share, not of the whole month. */
  const documented = recap.total - recap.missing;
  const lotShare =
    recap.lot > 0 && documented > 0 ? Math.round((recap.lot / documented) * 100) : 0;
  const reached = recap.goal === null ? null : share >= recap.goal;
  const monthName = (date: Date) => {
    const raw = new Intl.DateTimeFormat(localeFor(lang), {
      month: 'long',
      year: 'numeric',
    }).format(date);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };
  const monthLabel = monthName(recap.start);

  const body =
    recap.goal === null
      ? t('acct.b2b.recapNoGoal')
          .replace('{now}', String(share))
          .replace('{n}', String(recap.total))
      : t('acct.b2b.recapText')
          .replace('{now}', String(share))
          .replace('{goal}', String(recap.goal))
          .replace('{n}', String(recap.total));

  /* Month against month: points of share, then gaps to catch up. */
  const comparable = recap.prevShare !== null;
  const pointDelta = comparable ? share - (recap.prevShare ?? 0) : 0;
  const gapDelta = comparable ? recap.missing - recap.prevMissing : 0;
  const prevLabel = monthName(recap.before);

  const dirOf = (value: number) => (value > 0 ? 'up' : value < 0 ? 'down' : 'flat');
  const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

  /* The forgotten traces, read on the widest basis we have: the strip counts
     the whole account, the rows only what is loaded — the larger of the two is
     the truth, and the door opens on that very cut either way. */
  const staleDoor = Math.max(recap.stale, staleTotal);

  const pointText = !comparable
    ? ''
    : pointDelta === 0
      ? t('acct.b2b.recapDeltaSame').replace('{month}', prevLabel)
      : t('acct.b2b.recapDeltaPts')
          .replace('{sign}', signed(pointDelta))
          .replace('{n}', String(Math.abs(pointDelta)))
          .replace('{month}', prevLabel);

  const gapText = !comparable
    ? ''
    : gapDelta === 0
      ? t('acct.b2b.recapGapSame')
      : gapDelta < 0
        ? t('acct.b2b.recapGapDown').replace('{n}', String(Math.abs(gapDelta)))
        : t('acct.b2b.recapGapUp').replace('{n}', String(gapDelta));

  return (
    <div className="b2br-recap" data-state={reached === null ? 'none' : reached ? 'ok' : 'missed'}>
      <div className="b2br-recap-head">
        <span className="b2br-recap-ico" aria-hidden="true">
          <i className={reached === false ? 'ri-error-warning-line' : 'ri-calendar-check-line'}></i>
        </span>
        <div className="b2br-recap-txt">
          <strong>{t('acct.b2b.recapTitle').replace('{month}', monthLabel)}</strong>
          <p>{body}</p>
        </div>
        {reached !== null && (
          <span className="b2br-recap-state" data-state={reached ? 'ok' : 'missed'}>
            <i className={reached ? 'ri-check-line' : 'ri-arrow-down-line'} aria-hidden="true"></i>
            {reached ? t('acct.b2b.recapReached') : t('acct.b2b.recapMissed')}
          </span>
        )}
      </div>

      {comparable ? (
        <p className="b2br-recap-delta">
          <span className="b2br-recap-delta-pts" data-dir={dirOf(pointDelta)}>
            <i
              className={
                pointDelta > 0
                  ? 'ri-arrow-up-line'
                  : pointDelta < 0
                    ? 'ri-arrow-down-line'
                    : 'ri-subtract-line'
              }
              aria-hidden="true"
            ></i>
            {pointText}
          </span>
          <span className="b2br-recap-delta-gap" data-dir={dirOf(-gapDelta)}>
            <i
              className={
                gapDelta < 0
                  ? 'ri-arrow-down-line'
                  : gapDelta > 0
                    ? 'ri-arrow-up-line'
                    : 'ri-subtract-line'
              }
              aria-hidden="true"
            ></i>
            {gapText}
          </span>
        </p>
      ) : (
        <p className="b2br-recap-delta" data-dir="flat">
          <span className="b2br-recap-delta-note">
            <i className="ri-information-line" aria-hidden="true"></i>
            {t('acct.b2b.recapDeltaNoPrev').replace('{month}', prevLabel)}
          </span>
        </p>
      )}

      {/* The review opens the duel already set: the month just ended and the
          one before it, side by side on the chart, with no bar to hunt. */}
      {onCompare && (
        <button
          type="button"
          className="b2br-recap-duel"
          title={t('acct.b2b.recapDuelHint')}
          aria-label={t('acct.b2b.recapDuelHint')}
          onClick={() => onCompare([recap.prevKey, recap.key])}
        >
          <i className="ri-contrast-line" aria-hidden="true"></i>
          <span>
            {t('acct.b2b.recapDuel')
              .replace('{a}', prevLabel)
              .replace('{b}', monthLabel)}
          </span>
          <i className="ri-arrow-right-line b2br-recap-lot-go" aria-hidden="true"></i>
        </button>
      )}

      {/* What part of that trace was rebuilt after the fact: a month can hold
          its target and still owe part of it to a bulk catch-up. */}
      {recap.lot > 0 && (
        <button
          type="button"
          className="b2br-recap-lot b2br-recap-lot--btn"
          title={t('acct.b2b.recapLotHint')}
          aria-label={t('acct.b2b.recapLotOpen')}
          onClick={onOpenLot}
        >
          <i className="ri-stack-line" aria-hidden="true"></i>
          <span>
            {t('acct.b2b.recapLot')
              .replace('{n}', String(recap.lot))
              .replace('{share}', String(lotShare))}
          </span>
          <i className="ri-arrow-right-line b2br-recap-lot-go" aria-hidden="true"></i>
        </button>
      )}

      {/* The corrections of that month: catch-ups erased after they were made.
          Counting them is what makes the trace auditable rather than silent.
          The line is a door: it lists exactly those closures. */}
      {(recap.cleared > 0 || recap.rework > 0 || staleDoor > 0) && (
        <div className="b2br-recap-doors">
          {recap.cleared > 0 && (
            <button
              type="button"
              className="b2br-recap-cleared b2br-recap-cleared--btn"
              title={t('acct.b2b.recapClearedHint')}
              aria-label={t('acct.b2b.recapClearedOpen')}
              onClick={onOpenCleared}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              <span>{t('acct.b2b.recapCleared').replace('{n}', String(recap.cleared))}</span>
              <i className="ri-arrow-right-line b2br-recap-lot-go" aria-hidden="true"></i>
            </button>
          )}
          {/* The same count, read the other way round: every correction of the
              account, not only this month's — the chip of the reason bar, here
              as well, so the month does not hide the rest. */}
          {recap.cleared > 0 && (
            <button
              type="button"
              className="b2br-recap-chip"
              title={t('acct.b2b.recapClearedAllHint')}
              aria-label={t('acct.b2b.recapClearedAllHint')}
              onClick={onOpenAllCleared}
            >
              <i className="ri-filter-3-line" aria-hidden="true"></i>
              <span>{t('acct.b2b.recapClearedAll').replace('{n}', String(recap.cleared))}</span>
            </button>
          )}
          {/* The hardest cut of the same family: past two corrections the fiche
              was ploughed, not adjusted. Next to the corrections, so the worst
              of them is one click away from the month that spotted it. */}
          {recap.rework > 0 && (
            <button
              type="button"
              className="b2br-recap-chip b2br-recap-chip--rework"
              title={t('acct.b2b.recapReworkHint')}
              aria-label={t('acct.b2b.recapReworkHint')}
              onClick={onOpenRework}
            >
              <i className="ri-fire-line" aria-hidden="true"></i>
              <span>{t('acct.b2b.recapRework').replace('{n}', String(recap.rework))}</span>
            </button>
          )}
          {/* The same family read backwards: the correction was made, then the
              fiche was left alone for over a month. One click from the review,
              so the forgotten traces are not only reachable from the bar. */}
          {staleDoor > 0 && (
            <button
              type="button"
              className="b2br-recap-chip b2br-recap-chip--stale"
              title={t('acct.b2b.recapStaleHint')}
              aria-label={t('acct.b2b.recapStaleHint')}
              onClick={onOpenStale}
            >
              <i className="ri-time-line" aria-hidden="true"></i>
              <span>{t('acct.b2b.recapStale').replace('{n}', String(staleDoor))}</span>
            </button>
          )}
        </div>
      )}

      {recap.missing > 0 ? (
        <p className="b2br-recap-gap">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.recapMissing').replace('{n}', String(recap.missing))}</span>
          <button type="button" className="b2br-recap-cta" onClick={onCatchUp}>
            {t('acct.b2b.recapCta')}
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </button>
        </p>
      ) : (
        <p className="b2br-recap-gap" data-state="done">
          <i className="ri-check-double-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.recapDone')}</span>
        </p>
      )}
    </div>
  );
}