import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { Entreprise } from '@/mocks/entreprises';
import type { Auteur } from '@/mocks/auteurs';
import { buildDirectoryCsv, downloadCsvFile } from './directoryCsv';

type Props = {
  mode: 'entreprises' | 'auteurs';
  biz: Entreprise[];
  people: Auteur[];
  pays: string;
  wilaya: string;
  radius: number | null;
  /** The opening year the establishment list is narrowed to, "" for all. */
  openYear?: string;
  /** The order the exported rows are read in, written in the footer block. */
  sortLabel?: string;
  /** 'item' renders a full-width row inside the export menu. */
  variant?: 'pill' | 'item';
};

/**
 * Exports everything the current filters list — the whole regional selection,
 * not the four-item shortlist — so it can feed a prospecting spreadsheet.
 */
export default function DirectoryExport({ mode, biz, people, pays, wilaya, radius, openYear = '', sortLabel, variant = 'pill' }: Props) {
  const { t, lang } = useLang();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const total = mode === 'entreprises' ? biz.length : people.length;

  const run = () => {
    if (total === 0) return;
    const csv = buildDirectoryCsv({ mode, biz, people, pays, wilaya, radius, openYear, sortLabel, lang, t });
    const where = wilaya ? `-${wilaya.replace(/\s+/g, '-')}` : '';
    const within = radius ? `-${radius}km` : '';
    downloadCsvFile(`PaperAtlas-annuaire-${mode}${pays ? `-${pays}` : ''}${where}${within}.csv`, csv);
    setDone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2600);
  };

  if (total === 0) return null;

  return (
    <button
      type="button"
      className={variant === 'item' ? `export-item${done ? ' is-ok' : ''}` : `share-btn dir-export${done ? ' is-ok' : ''}`}
      onClick={run}
      title={t('dirCsv.cta')}
      aria-live="polite"
      role={variant === 'item' ? 'menuitem' : undefined}
    >
      <i className={done ? 'ri-check-line' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
      <span className="whitespace-nowrap">
        {done ? t('dirCsv.done') : `${t('dirCsv.cta')} (${total})`}
      </span>
    </button>
  );
}