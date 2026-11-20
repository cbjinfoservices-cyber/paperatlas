import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Rows the sheet will hold; nothing is offered when the board is empty. */
  total: number;
  /** Builds and downloads the sheet — called on click only. */
  run: () => void;
  /** Quiet variant for the account area. */
  ghost?: boolean;
  /** What the button says at rest — « Exporter CSV » unless a board overrides. */
  label?: string;
  /** What it says once the file has left. */
  doneLabel?: string;
  /**
   * What the figure counts — « devis », « lignes »… When given, the count leaves
   * the parenthesis and becomes a counter of its own inside the button, so the
   * reader sees how many rows the workbook will carry before pressing it, and
   * still sees it after the file has left.
   */
  unit?: string;
};

/**
 * One export button shared by the boards and the account lists: it says how
 * many rows it will write, then confirms the download in place instead of
 * opening a toast.
 */
export default function CsvExportButton({
  total, run, ghost = false, label, doneLabel, unit,
}: Props) {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  if (total === 0) return null;

  const idleLabel = label ?? t('csv.cta');

  return (
    <button
      type="button"
      className={`${ghost ? 'ghost-btn' : 'share-btn'} dir-export${done ? ' is-ok' : ''}`}
      onClick={() => {
        run();
        setDone(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDone(false), 2600);
      }}
      title={idleLabel}
      aria-live="polite"
    >
      <i className={done ? 'ri-check-line' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
      <span className="whitespace-nowrap">
        {done ? (doneLabel ?? t('dirCsv.done')) : idleLabel}
      </span>
      {/* The counter of the rows the sheet will hold. It is a badge of its own,
          so the figure stays readable after the download, not only before. */}
      {unit ? (
        <b className="dir-export-n" aria-label={`${total} ${unit}`}>
          {total}
          <em>{unit}</em>
        </b>
      ) : (
        <span className="whitespace-nowrap">({total})</span>
      )}
    </button>
  );
}