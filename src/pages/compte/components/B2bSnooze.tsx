import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import type { DemandeB2b } from '@/lib/b2b';

type Props = {
  row: DemandeB2b;
  busy: boolean;
  onSnooze: (until: string | null) => Promise<boolean>;
  onNotice: (message: string) => void;
};

/** Local calendar day, the format a date input expects. */
const toDay = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const inDays = (count: number) => {
  const date = new Date();
  date.setDate(date.getDate() + count);
  return toDay(date);
};

/**
 * « Rappeler plus tard »: the workshop picks the day it wants to look at this
 * request again. Until then it stops counting as late and stops being chased —
 * and it comes back on its own, no bookmark needed.
 */
export default function B2bSnooze({ row, busy, onSnooze, onNotice }: Props) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState('');

  const until = row.snooze_at ? new Date(row.snooze_at) : null;
  const snoozed = Boolean(until && until.getTime() > Date.now());
  const snoozeLabel = until && snoozed
    ? new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(until)
    : '';

  const save = async (value: string | null) => {
    const ok = await onSnooze(value);
    if (ok) {
      setOpen(false);
      setDay('');
      onNotice(value ? t('acct.b2b.snoozeSaved') : t('acct.b2b.snoozeCleared'));
    }
  };

  return (
    <>
      {snoozed && !open && (
        <p className="b2br-sleep">
          <i className="ri-time-line" aria-hidden="true"></i>
          {t('acct.b2b.snoozedUntil')} {snoozeLabel}
          <button
            type="button"
            className="b2br-sleep-clear"
            onClick={() => void save(null)}
            disabled={busy}
          >
            {t('acct.b2b.snoozeClear')}
          </button>
        </p>
      )}

      {open ? (
        <div className="b2br-snooze">
          <label className="b2br-snooze-label" htmlFor={`snz-${row.id}`}>
            {t('acct.b2b.snoozePick')}
          </label>
          <input
            id={`snz-${row.id}`}
            className="b2br-snooze-date"
            type="date"
            min={toDay(new Date())}
            value={day}
            onChange={(event) => setDay(event.target.value)}
          />
          <div className="b2br-snooze-quick">
            {[3, 7, 14].map((count) => (
              <button key={count} type="button" className="b2br-snooze-chip" onClick={() => setDay(inDays(count))}>
                {count} {t('acct.b2b.snoozeDays')}
              </button>
            ))}
          </div>
          <div className="b2br-snooze-actions">
            <button
              type="button"
              className="ad-btn ad-btn--solid"
              disabled={!day || busy}
              onClick={() => void save(day)}
            >
              <i className={busy ? 'ri-loader-4-line is-spin' : 'ri-alarm-line'} aria-hidden="true"></i>
              {busy ? t('acct.b2b.snoozeSaving') : t('acct.b2b.snoozeSave')}
            </button>
            <button type="button" className="ad-btn" onClick={() => setOpen(false)} disabled={busy}>
              {t('acct.b2b.snoozeCancel')}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="ad-btn" onClick={() => setOpen(true)} disabled={busy}>
          <i className="ri-time-line" aria-hidden="true"></i>
          {snoozed ? t('acct.b2b.snoozeChange') : t('acct.b2b.snooze')}
        </button>
      )}
    </>
  );
}