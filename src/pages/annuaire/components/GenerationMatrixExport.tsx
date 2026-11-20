import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { Entreprise } from '@/mocks/entreprises';
import type { Auteur } from '@/mocks/auteurs';
import { buildGenerationMatrixCsv, downloadCsvFile } from './directoryCsv';

type Props = {
  mode: 'entreprises' | 'auteurs';
  biz: Entreprise[];
  people: Auteur[];
  pays: string;
  wilaya: string;
  /** The generation currently filtered, written as its decade label. */
  openYear?: string;
  sortLabel?: string;
  /** 'item' renders a full-width row inside the export menu. */
  variant?: 'pill' | 'item';
};

/**
 * The generation companion of the directory exports: one decade per row, one
 * column per country. It sits beside the genre tables so a colleague can read
 * an era — 1990–1999 here, 2000–2009 there — across every country at once.
 */
export default function GenerationMatrixExport({
  mode, biz, people, pays, wilaya, openYear = '', sortLabel, variant = 'pill',
}: Props) {
  const { t, lang } = useLang();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const total = mode === 'entreprises' ? biz.length : people.length;
  if (total === 0) return null;

  const run = () => {
    const csv = buildGenerationMatrixCsv({
      mode, biz, people, pays, wilaya, openYear, sortLabel, lang, t,
    });
    const where = wilaya ? `-${wilaya.replace(/\s+/g, '-')}` : '';
    downloadCsvFile(`PaperAtlas-annuaire-generations-${mode}${pays ? `-${pays}` : ''}${where}.csv`, csv);
    setDone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2600);
  };

  return (
    <button
      type="button"
      className={variant === 'item' ? `export-item${done ? ' is-ok' : ''}` : `share-btn dir-export${done ? ' is-ok' : ''}`}
      onClick={run}
      title={t('genCsv.hint')}
      aria-live="polite"
      role={variant === 'item' ? 'menuitem' : undefined}
    >
      <i className={done ? 'ri-check-line' : 'ri-calendar-2-line'} aria-hidden="true"></i>
      <span className="whitespace-nowrap">{done ? t('genCsv.done') : t('genCsv.cta')}</span>
    </button>
  );
}