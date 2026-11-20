import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import type { B2bObjectifEntry } from '@/lib/b2b';

/** The thresholds a workshop usually picks from, rather than a free number. */
const STEPS = [60, 70, 80, 90];

/** The wait thresholds offered: from a long weekend to a fortnight. */
const WAIT_STEPS = [3, 5, 7, 10, 14];

type Props = {
  /** The target saved for this workshop — null when it chose none. */
  objectif: number | null;
  /**
   * The wait threshold saved for this workshop, in whole days: above it, a
   * month is flagged in the strip, in the twelve-month table and in the sheet.
   * Saved on the very panel as the target, so the three surfaces read one
   * number instead of three copies of a week.
   */
  waitGoalDays: number;
  /** Closures of the month still running, and how many carry no reason. */
  monthTotal: number;
  monthMissing: number;
  /** Every recorded change of that threshold, oldest first. */
  history: B2bObjectifEntry[];
  saving: boolean;
  onSave: (value: number | null) => Promise<boolean>;
  /** Saved on the same panel, right under the target. */
  savingWait?: boolean;
  onSaveWait?: (value: number | null) => Promise<boolean>;
  /**
   * Asked from the threshold recall under the strip: the panel comes up already
   * unfolded on the wait setting, the number in force marked, and the cursor
   * on it — so the figure that counts and the figure that is changed are one
   * gesture apart. The nonce marks a fresh request.
   */
  focusWaitAsk?: number;
  /** Jumps to the « no reason » list, where the gaps can be filled. */
  onCatchUp: () => void;
};

/**
 * The trace quality of the month, held against a target the workshop set for
 * itself. Below it, the box says so plainly and points to the closures to fix —
 * the target is a warning, never a block: a closure without a reason stays a
 * closure.
 *
 * Under the banner sits the logbook of that threshold: when it moved, and to
 * what. A target is a decision, and a decision deserves a date.
 */
export default function B2bMotifGoal({
  objectif,
  waitGoalDays,
  monthTotal,
  monthMissing,
  history,
  saving,
  onSave,
  savingWait = false,
  onSaveWait,
  focusWaitAsk = 0,
  onCatchUp,
}: Props) {
  const { t, lang } = useLang();
  /** Nothing is asked for: the logbook stays shut until someone wants it. */
  const [openHistory, setOpenHistory] = useState(false);
  /** The wait block was just asked for: it flashes so the eye finds it. */
  const [waitFlash, setWaitFlash] = useState(false);
  /** The wait setting itself, and the chip the cursor should land on. */
  const waitBox = useRef<HTMLDivElement | null>(null);
  const waitChip = useRef<HTMLButtonElement | null>(null);
  const firstWaitChip = useRef<HTMLButtonElement | null>(null);

  /* The strip’s recall is a door of its own: it does not open a list, it brings
     this panel up already unfolded on the wait threshold, and puts the cursor
     on the number in force — the setting can be read and changed without a
     single extra click. */
  useEffect(() => {
    if (!focusWaitAsk) return undefined;
    setWaitFlash(true);
    const walk = window.setTimeout(() => {
      waitBox.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (waitChip.current ?? firstWaitChip.current)?.focus({ preventScroll: true });
    }, 150);
    const quiet = window.setTimeout(() => setWaitFlash(false), 4600);
    return () => {
      window.clearTimeout(walk);
      window.clearTimeout(quiet);
    };
  }, [focusWaitAsk]);

  const documented = monthTotal - monthMissing;
  const rate = monthTotal > 0 ? Math.round((documented / monthTotal) * 100) : null;
  const below = objectif !== null && rate !== null && rate < objectif;

  /** Newest first: the last move is the one being questioned. */
  const entries = useMemo(
    () =>
      history
        .map((entry) => ({ ...entry, at: new Date(entry.changedAt).getTime() }))
        .filter((entry) => Number.isFinite(entry.at))
        .sort((a, b) => b.at - a.at),
    [history],
  );

  const stamp = (time: number) =>
    new Intl.DateTimeFormat(localeFor(lang), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(time));

  return (
    <div className="b2br-goal" id="b2br-goal" data-state={below ? 'below' : 'ok'}>
      <div className="b2br-goal-head">
        <span className="b2br-goal-ico" aria-hidden="true">
          <i className={below ? 'ri-flag-line' : 'ri-flag-2-line'}></i>
        </span>
        <div className="b2br-goal-txt">
          <strong>{t('acct.b2b.goalTitle')}</strong>
          <p>{t('acct.b2b.goalText')}</p>
        </div>
        {objectif !== null && (
          <span className="b2br-goal-state" data-state={below ? 'below' : 'ok'}>
            <i className={below ? 'ri-arrow-down-line' : 'ri-check-line'} aria-hidden="true"></i>
            {rate === null
              ? t('acct.b2b.goalEmpty')
              : t('acct.b2b.goalStatus')
                  .replace('{now}', String(rate))
                  .replace('{goal}', String(objectif))}
          </span>
        )}
      </div>

      <div className="b2br-goal-chips" role="group" aria-label={t('acct.b2b.goalTitle')}>
        {STEPS.map((step) => (
          <button
            key={step}
            type="button"
            className={`b2br-goal-chip${objectif === step ? ' is-on' : ''}`}
            aria-pressed={objectif === step}
            disabled={saving}
            onClick={() => void onSave(step)}
          >
            {step} %
          </button>
        ))}
        {objectif !== null && (
          <button
            type="button"
            className="b2br-goal-clear"
            disabled={saving}
            onClick={() => void onSave(null)}
          >
            {t('acct.b2b.goalClear')}
          </button>
        )}
      </div>

      {below && (
        <p className="b2br-goal-warn">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          <span>
            {t('acct.b2b.goalWarn')
              .replace('{goal}', String(objectif ?? 0))
              .replace('{now}', String(rate ?? 0))
              .replace('{n}', String(monthMissing))}
          </span>
          {monthMissing > 0 && (
            <button type="button" className="b2br-goal-cta" onClick={onCatchUp}>
              {t('acct.b2b.goalCta')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </button>
          )}
        </p>
      )}

      {/* The second threshold of the workshop, on the very same panel: the
          target judges the trace, this one judges the wait. Saved next to the
          objective, so the strip, the twelve-month table and the export can
          never count two different numbers of days. */}
      {onSaveWait && (
        <div
          className={`b2br-goal-wait${waitFlash ? ' is-focus' : ''}`}
          id="b2br-goal-wait"
          ref={waitBox}
          data-focus={waitFlash ? 'yes' : 'no'}
        >
          <div className="b2br-goal-head">
            <span className="b2br-goal-ico b2br-goal-ico--wait" aria-hidden="true">
              <i className="ri-hourglass-line"></i>
            </span>
            <div className="b2br-goal-txt">
              <strong>{t('acct.b2b.waitGoalTitle')}</strong>
              <p>{t('acct.b2b.waitGoalText')}</p>
            </div>
            <span className="b2br-goal-state b2br-goal-state--wait" data-state="ok">
              <i className="ri-calendar-check-line" aria-hidden="true"></i>
              {t('acct.b2b.waitGoalCurrent').replace('{n}', String(waitGoalDays))}
            </span>
          </div>

          <div
            className="b2br-goal-chips"
            role="group"
            aria-label={t('acct.b2b.waitGoalTitle')}
          >
            {WAIT_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                ref={(node) => {
                  /* The number in force takes the cursor; on a threshold the
                     chips do not carry (an older account), the first chip does,
                     so the door never lands on nothing. */
                  if (step === waitGoalDays) waitChip.current = node;
                  if (step === WAIT_STEPS[0]) firstWaitChip.current = node;
                }}
                className={`b2br-goal-chip b2br-goal-chip--wait${
                  waitGoalDays === step ? ' is-on' : ''
                }`}
                aria-pressed={waitGoalDays === step}
                disabled={savingWait}
                onClick={() => void onSaveWait(step)}
              >
                {step} {t('acct.b2b.waitGoalUnit')}
              </button>
            ))}
            {/* The workshop can put the default week back without guessing
                which chip that is today. */}
            {waitGoalDays !== 7 && (
              <button
                type="button"
                className="b2br-goal-clear"
                disabled={savingWait}
                onClick={() => void onSaveWait(null)}
              >
                {t('acct.b2b.waitGoalDefault')}
              </button>
            )}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="b2br-goal-hist">
          <button
            type="button"
            className={`b2br-goal-hist-toggle${openHistory ? ' is-on' : ''}`}
            aria-expanded={openHistory}
            onClick={() => setOpenHistory((prev) => !prev)}
          >
            <i className="ri-history-line" aria-hidden="true"></i>
            {openHistory
              ? t('acct.b2b.goalHistHide')
              : t('acct.b2b.goalHistShow').replace('{n}', String(entries.length))}
          </button>

          {openHistory && (
            <ol className="b2br-goal-hist-list">
              {entries.map((entry) => (
                <li
                  key={`${entry.changedAt}-${entry.objectif ?? 'none'}`}
                  className="b2br-goal-hist-item"
                >
                  <span className="b2br-goal-hist-date">{stamp(entry.at)}</span>
                  <span className="b2br-goal-hist-val" data-state={entry.objectif === null ? 'off' : 'on'}>
                    {entry.objectif === null
                      ? t('acct.b2b.goalHistNone')
                      : `${entry.objectif} %`}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}