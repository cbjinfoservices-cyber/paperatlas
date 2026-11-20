import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useGeo } from '@/hooks/useGeo';
import { readDirMemory, dirMemoryQuery } from '@/hooks/useDirMemory';
import { SORT_LABEL } from '@/pages/annuaire/components/DirectoryTools';
import { decadeLabel, parseDecades } from '@/lib/generation';

/**
 * Small return path for visitors who already searched the directory: one click
 * and they land back on their last wilaya, radius, sort order and view.
 */
export default function DirRecallChip() {
  const { t } = useLang();
  const geo = useGeo();
  const memory = useMemo(() => readDirMemory(), []);
  const hasPosition = Boolean(geo.point);
  const query = dirMemoryQuery(memory, hasPosition);

  if (!query) return null;

  /* The decade the visitor had opened is part of the search, so the chip says
     it too instead of promising a list that no longer matches. The order the
     list was read in is named as well, so a block reading comes back whole. */
  const sortReopens = memory.sort !== 'pertinence'
    && (memory.sort !== 'distance' || hasPosition);
  const bits = [
    memory.wilaya,
    hasPosition && memory.radius ? `${memory.radius} km` : '',
    memory.open ? parseDecades(memory.open).map(decadeLabel).join(' · ') : '',
    sortReopens ? t(SORT_LABEL[memory.sort]) : '',
  ].filter(Boolean);

  return (
    <Link className="dir-chip" to={`/annuaire${query}`}>
      <i className="ri-history-line" aria-hidden="true"></i>
      <span className="dir-chip-txt">
        <span className="dir-chip-label">{t('mem.chip')}</span>
        {bits.length > 0 && <em>{bits.join(' · ')}</em>}
      </span>
      <i className="ri-arrow-right-line dir-chip-arrow" aria-hidden="true"></i>
    </Link>
  );
}