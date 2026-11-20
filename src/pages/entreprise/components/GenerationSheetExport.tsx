import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { entreprises } from '@/mocks/entreprises';
import { decadeOf } from '@/lib/generation';
import { buildGenerationMatrixCsv, downloadCsvFile } from '@/pages/annuaire/components/directoryCsv';

type Props = {
  /** The decade this workshop opened in. */
  decade: number;
  /** That decade written « 1990–1999 », repeated in the file's footer. */
  label: string;
};

/**
 * On a workshop sheet, the generation table stops at its own generation: one
 * decade per row would be a single line, so the file is read as that decade
 * against every country its workshops stand in. Everything else — the header,
 * the footer block, the BOM for Excel — is the table the directory already
 * exports, so the two files open side by side.
 */
export default function GenerationSheetExport({ decade, label }: Props) {
  const { t, lang } = useLang();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  /* Only the workshops of that very decade, all countries together. */
  const rows = entreprises.filter((e) => decadeOf(e.since) === decade);
  if (rows.length === 0) return null;

  const run = () => {
    const csv = buildGenerationMatrixCsv({
      mode: 'entreprises', biz: rows, people: [], openYear: label, lang, t,
    });
    downloadCsvFile(`PaperAtlas-generation-${decade}.csv`, csv);
    setDone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2600);
  };

  return (
    <button
      type="button"
      className={`share-btn${done ? ' is-ok' : ''}`}
      onClick={run}
      title={t('genCsv.hint')}
      aria-live="polite"
    >
      <i className={done ? 'ri-check-line' : 'ri-calendar-2-line'} aria-hidden="true"></i>
      <span className="whitespace-nowrap">{done ? t('genCsv.done') : t('genCsv.cta')}</span>
    </button>
  );
}