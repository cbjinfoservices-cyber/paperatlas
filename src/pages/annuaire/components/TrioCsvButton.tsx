import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { buildTrioDetailCsv, saveTrioDetailCsv, type TrioCountry } from './cmapsTrioCsv';

type Props = {
  /** La feuille : un pays, ou tous quand le bouton est celui du bandeau. */
  countries: TrioCountry[];
  label: string;
  hint: string;
  className?: string;
  /** Le pays de la feuille, pour que deux téléchargements ne se confondent pas. */
  code?: string;
  /** Les pays qui viennent d'être emportés, pour que la carte les compte. */
  onExported?: (codes: string[]) => void;
};

/**
 * Le détail par maison emporté dans un tableur : la feuille garde le pays, le
 * rang, la région et les trois fonds, si bien que plusieurs pays enregistrés se
 * comparent côte à côte sans repasser par la carte.
 */
export default function TrioCsvButton({
  countries,
  label,
  hint,
  className = 'cmap-trio-copy',
  code = '',
  onExported,
}: Props) {
  const { t, lang } = useLang();
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  if (countries.length === 0) return null;

  const run = () => {
    saveTrioDetailCsv(buildTrioDetailCsv(countries, lang, t), code);
    /* La feuille est partie : ses pays entrent dans le compteur de la carte,
       une seule fois chacun. */
    onExported?.(countries.map((country) => country.code));
    setDone(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 2600);
  };

  return (
    <button
      type="button"
      className={`${className}${done ? ' is-ok' : ''}`}
      title={hint || label}
      aria-live="polite"
      onClick={run}
    >
      <i className={done ? 'ri-check-line' : 'ri-file-excel-2-line'} aria-hidden="true"></i>
      <span className="whitespace-nowrap">{done ? t('cmaps.csvDone') : label}</span>
    </button>
  );
}