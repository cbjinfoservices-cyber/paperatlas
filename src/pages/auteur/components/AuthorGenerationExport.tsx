import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { auteurs } from '@/mocks/auteurs';
import { decadeOf, premierePublication } from '@/lib/generation';
import { buildGenerationMatrixCsv, downloadCsvFile } from '@/pages/annuaire/components/directoryCsv';

type Props = {
  /** The decade this author first went to print in. */
  decade: number;
  /** That decade written « 1990–1999 », repeated in the file's footer. */
  label: string;
};

/**
 * On an author sheet, the generation table stops at its own generation: the
 * file is that first-publication decade read against every country its pens
 * stand in. Header, footer block and BOM are the table the directory already
 * exports, so the two files open side by side.
 */
export default function AuthorGenerationExport({ decade, label }: Props) {
  const { t, lang } = useLang();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  /* Only the pens of that very decade, all countries together. */
  const rows = auteurs.filter((a) => decadeOf(premierePublication(a)) === decade);
  if (rows.length === 0) return null;

  const run = () => {
    const csv = buildGenerationMatrixCsv({
      mode: 'auteurs', biz: [], people: rows, openYear: label, lang, t,
    });
    downloadCsvFile(`PaperAtlas-generation-auteurs-${decade}.csv`, csv);
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