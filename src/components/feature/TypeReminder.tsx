import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** What the field is called on this board: the establishment type, the
      genre, the category of the ads, the contract of the offers. */
  label: string;
  /** The value actually kept, already translated. */
  value: string;
  /** How many sheets the list holds under that type. */
  count: number;
  /** The word that follows the figure: « établissements », « profils ». */
  word: string;
  /** Hands the type back: the other filters stay exactly where they are. */
  onClear: () => void;
  /** How many other types the same scope still holds. Zero hides the line. */
  othersCount?: number;
  /** The line under the pill, already worded: « 3 autres métiers dans cette région ». */
  othersText?: string;
  /** Hands the type back as well, and reopens the search on everything the
      region holds — the same gesture, read as a fresh search. */
  onOthers?: () => void;
};

/**
 * The type kept on a board, recalled on one line right above the results.
 *
 * The filter row carries the choice; the cards further down only show it
 * through their own badges. This line states it plainly, with the figure the
 * list really holds, and hands it back in a single click without touching the
 * country, the region or the generation. Underneath, a second line says how
 * many other types the same scope still holds, so the search can be reopened
 * without going back up to the filter row.
 */
export default function TypeReminder({
  label, value, count, word, onClear,
  othersCount = 0, othersText = '', onOthers,
}: Props) {
  const { t } = useLang();
  const more = Boolean(othersCount && othersText && onOthers);
  /* A type that holds nothing keeps its door: it is named « aucune fiche »
     instead of counting zero. */
  const empty = count === 0;

  return (
    <div className="dir-type">
      <span className="dir-type-lab">
        <i className="ri-price-tag-3-line" aria-hidden="true"></i>
        {label}
      </span>
      <button
        type="button"
        className={`dir-type-chip${empty ? ' dir-type-chip--empty' : ''}`}
        onClick={onClear}
        title={t('dir.scopeClear')}
        aria-label={`${value} — ${t('dir.scopeClear')}`}
      >
        <span className="dir-type-val">{value}</span>
        {empty ? (
          <span className="dir-type-none">{t('pro.walkFicheNone')}</span>
        ) : (
          <>
            <span className="dir-type-count" aria-hidden="true">{count}</span>
            <span className="dir-type-word">{word}</span>
          </>
        )}
        <i className="ri-close-line" aria-hidden="true"></i>
      </button>
      {more && (
        <button
          type="button"
          className="dir-type-more"
          onClick={onOthers}
          title={t('dir.othersHint')}
        >
          <i className="ri-compass-3-line" aria-hidden="true"></i>
          <span>{othersText}</span>
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </button>
      )}
    </div>
  );
}