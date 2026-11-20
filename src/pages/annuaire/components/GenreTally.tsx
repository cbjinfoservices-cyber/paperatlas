import { useLang } from '@/i18n/LangProvider';
import type { Genre } from '@/mocks/auteurs';
import TallyBar from './TallyBar';

type Props = {
  /** How many pens of the current selection write each genre, fullest first. */
  counts: { genre: Genre; count: number }[];
  /** How many pens the line is read on, so the reader knows the ground. */
  total: number;
  /** The genre currently filtered, so its counter reads as selected. */
  active: string;
  /** Picking a genre filters the list on it; a second click hands it back. */
  onPick: (genre: string) => void;
};

/**
 * The genres of the author list, counted on the pens the other filters leave.
 * Right above the cards, each counter is a door — the same gesture as a region
 * counter on the country cards: one click filters, the second one clears.
 */
export default function GenreTally({ counts, total, active, onPick }: Props) {
  const { t } = useLang();

  return (
    <TallyBar
      label={t('auth.genreBar')}
      icon="ri-price-tag-3-line"
      hint={t('auth.genreBarHint')}
      total={total}
      totalWord={t('gtally.profiles')}
      items={counts.map((row) => ({ key: row.genre, label: t(`genre.${row.genre}`), count: row.count }))}
      active={active}
      onPick={onPick}
      foldAt={6}
      moreWord={t('auth.genreBarMore')}
      expandHint={t('auth.genreBarExpand')}
      fewerLabel={t('auth.genreBarFewer')}
    />
  );
}