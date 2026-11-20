import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { Entreprise } from '@/mocks/entreprises';
import type { Auteur } from '@/mocks/auteurs';
import DirectoryExport from './DirectoryExport';
import GenerationMatrixExport from './GenerationMatrixExport';
import GenreMatrixExport from './GenreMatrixExport';

type Props = {
  mode: 'entreprises' | 'auteurs';
  biz: Entreprise[];
  people: Auteur[];
  pays: string;
  wilaya: string;
  radius: number | null;
  /** The opening year the list is narrowed to, written as its decade label. */
  openYear?: string;
  /** The order the exported rows are read in. */
  sortLabel?: string;
};

/**
 * Les fichiers de la sélection derrière une seule porte : les tableaux croisés
 * (genres, décennies) et l'annuaire lui-même. La ligne de résultats ne porte
 * plus quatre boutons empilés, elle n'en montre qu'un — « Exporter » — qui
 * ouvre la liste au clic. Rien n'est retiré : chaque fichier garde son geste
 * et son retour « téléchargé ».
 */
export default function ExportMenu({
  mode, biz, people, pays, wilaya, radius, openYear = '', sortLabel,
}: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const total = mode === 'entreprises' ? biz.length : people.length;
  if (total === 0) return null;

  return (
    <div className={`export-menu${open ? ' is-open' : ''}`} ref={wrap}>
      <button
        type="button"
        className="share-btn export-menu-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={t('exportMenu.hint')}
      >
        <i className="ri-download-2-line" aria-hidden="true"></i>
        <span className="whitespace-nowrap">{t('exportMenu.label')}</span>
        <i className="ri-arrow-down-s-line export-menu-caret" aria-hidden="true"></i>
      </button>

      {open && (
        <div className="export-panel" role="menu" aria-label={t('exportMenu.label')}>
          {mode === 'auteurs' && (
            <GenreMatrixExport
              people={people}
              pays={pays}
              wilaya={wilaya}
              sortLabel={sortLabel}
              variant="item"
            />
          )}
          <GenerationMatrixExport
            mode={mode}
            biz={biz}
            people={people}
            pays={pays}
            wilaya={wilaya}
            openYear={openYear}
            sortLabel={sortLabel}
            variant="item"
          />
          <DirectoryExport
            mode={mode}
            biz={biz}
            people={people}
            pays={pays}
            wilaya={wilaya}
            radius={radius}
            openYear={openYear}
            sortLabel={sortLabel}
            variant="item"
          />
        </div>
      )}
    </div>
  );
}