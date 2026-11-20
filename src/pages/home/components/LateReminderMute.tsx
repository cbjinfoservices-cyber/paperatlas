import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useSpokenMark } from '@/hooks/useSpokenMark';
import {
  clearLateMute,
  muteLateToday,
  onLateMute,
  readLateMute,
  type LateMute,
} from '@/lib/b2bLateMute';

/**
 * The reminder can be hushed for the day, from the panel as well as from the
 * phone sheet. Once hushed, the very line that says so carries the trace of the
 * deferral — when it was asked, until when it holds — and the way back: silence
 * must never be mistaken for « nothing was waiting ».
 */
export default function LateReminderMute({ surface }: { surface: 'panel' | 'sheet' }) {
  const { t, lang } = useLang();
  const [mute, setMute] = useState<LateMute | null>(readLateMute);

  /* The bar, the panel and the sheet all write the same silence: whichever one
     is used, the other two show it at once. */
  useEffect(() => {
    const off = onLateMute(() => setMute(readLateMute()));
    return off;
  }, []);

  /* The hour it was asked, in the reading language — never a technical stamp. */
  const askedAt = (() => {
    if (!mute) return '';
    const date = new Date(mute.at);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  })();

  /* La trace de la sourdine se dit une fois par silence demandé — l'heure où il
     a été demandé nomme l'occasion —, et non une fois par surface : rouvrir le
     panneau, puis la feuille, ne doit pas répéter la même phrase. Une sourdine
     levée puis redemandée plus tard porte une autre heure : elle reparle. */
  const trace = `${t('navm.muteTrace')}${askedAt ? ` · ${t('navm.muteSince').replace('{time}', askedAt)}` : ''}`;
  const muteSaid = useSpokenMark(mute ? `b2b-mute:${mute.at}` : '', trace);

  if (!mute) {
    return (
      <button
        type="button"
        className={`nav-late-mute nav-late-mute--${surface}`}
        title={t('navm.muteHint')}
        onClick={() => setMute(muteLateToday())}
      >
        <i className="ri-notification-off-line" aria-hidden="true"></i>
        {t('navm.muteToday')}
      </button>
    );
  }

  return (
    <div className={`nav-late-mute-wrap nav-late-mute-wrap--${surface}`}>
      {/* La marque visible reste lisible dans l'ordre du document, mais elle
          n'est plus une zone parlante : c'est la zone de statut ci-dessous qui
          porte la phrase, une seule fois par silence demandé. */}
      <p className="nav-late-mute-note">
        <i className="ri-notification-off-line" aria-hidden="true"></i>
        <span>
          {t('navm.muteTrace')}
          {askedAt && <span className="nav-late-mute-since"> · {t('navm.muteSince').replace('{time}', askedAt)}</span>}
        </span>
      </p>
      <button
        type="button"
        className="nav-late-mute-undo"
        title={t('navm.muteUndoHint')}
        onClick={() => {
          clearLateMute();
          setMute(null);
        }}
      >
        <i className="ri-notification-3-line" aria-hidden="true"></i>
        {t('navm.muteUndo')}
      </button>
      <p className="nav-end-said" role="status" aria-live="polite">{muteSaid}</p>
    </div>
  );
}