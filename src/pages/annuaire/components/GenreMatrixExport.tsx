import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { Auteur } from '@/mocks/auteurs';
import { buildGenreMatrixCsv, downloadCsvFile } from './directoryCsv';

type Props = {
  people: Auteur[];
  pays: string;
  wilaya: string;
  sortLabel?: string;
  /** 'item' renders a full-width row inside the export menu. */
  variant?: 'pill' | 'item';
};

/**
 * The two companion files of the author export: the same genre cross table, read
 * once region by region and once country by country. They download as two
 * separate files, so a colleague opens the split he needs straight away.
 */
export default function GenreMatrixExport({ people, pays, wilaya, sortLabel, variant = 'pill' }: Props) {
  const { t, lang } = useLang();
  const [done, setDone] = useState<'region' | 'pays' | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  if (people.length === 0) return null;

  const run = (dimension: 'region' | 'pays') => {
    const csv = buildGenreMatrixCsv({ people, dimension, pays, wilaya, sortLabel, lang, t });
    const where = wilaya ? `-${wilaya.replace(/\s+/g, '-')}` : '';
    downloadCsvFile(`PaperAtlas-auteurs-genres-${dimension}${pays ? `-${pays}` : ''}${where}.csv`, csv);
    setDone(dimension);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(null), 2600);
  };

  const files: { key: 'region' | 'pays'; icon: string; label: string; hint: string }[] = [
    { key: 'region', icon: 'ri-table-line', label: t('genresCsv.regionsCta'), hint: t('genresCsv.regionsHint') },
    { key: 'pays', icon: 'ri-earth-line', label: t('genresCsv.paysCta'), hint: t('genresCsv.paysHint') },
  ];

  return (
    <>
      {files.map((file) => {
        const isDone = done === file.key;
        return (
          <button
            key={file.key}
            type="button"
            className={variant === 'item' ? `export-item${isDone ? ' is-ok' : ''}` : `share-btn dir-export${isDone ? ' is-ok' : ''}`}
            onClick={() => run(file.key)}
            title={file.hint}
            aria-live="polite"
            role={variant === 'item' ? 'menuitem' : undefined}
          >
            <i className={isDone ? 'ri-check-line' : file.icon} aria-hidden="true"></i>
            <span className="whitespace-nowrap">{isDone ? t('genresCsv.done') : file.label}</span>
          </button>
        );
      })}
    </>
  );
}