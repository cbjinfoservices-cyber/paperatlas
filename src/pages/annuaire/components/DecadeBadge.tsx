import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** What a decade means here: « Ouverture » or « 1re publication ». */
  label: string;
  /** The decade itself, written « 1990–1999 ». */
  decade: string;
  /** How many profiles the decade keeps on the board. */
  count: number;
  /** The word that names them: « fiches » or « profils ». */
  word: string;
  /** The country still applied, named in full when there is one. */
  pays?: string;
  /** Hand the decade back, without touching the other filters. */
  onClear: () => void;
};

/**
 * One badge above the cards: the generation the list is narrowed to, and the
 * click that gives it back. It replaces a hunt through the counters — the
 * decade is named where the results actually start.
 */
export default function DecadeBadge({ label, decade, count, word, pays = '', onClear }: Props) {
  const { t } = useLang();

  return (
    <button
      type="button"
      className="dir-genbadge"
      onClick={onClear}
      title={t('gen.badgeHint')}
      aria-label={`${t('gen.clear')} · ${decade}`}
    >
      <span className="dir-genbadge-ico" aria-hidden="true">
        <i className="ri-calendar-event-line"></i>
      </span>
      <span className="dir-genbadge-txt">
        <span className="dir-genbadge-lab">{label}</span>
        <strong>{decade}</strong>
        <span className="dir-genbadge-count">
          {count} {word}{pays ? ` · ${pays}` : ''}
        </span>
      </span>
      <span className="dir-genbadge-x" aria-hidden="true">
        <i className="ri-close-line"></i>
      </span>
    </button>
  );
}