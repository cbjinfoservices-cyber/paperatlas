import { useLang } from '@/i18n/LangProvider';
import { decadeLabel } from '@/lib/generation';
import TallyBar, { type TallyPart } from './TallyBar';

type Props = {
  /** How many profiles of the current selection belong to each decade. */
  counts: { decade: number; count: number; parts?: TallyPart[] }[];
  /** How many profiles the bar is read on. */
  total: number;
  /** The word that names them: « fiches » for workshops, « profils » for pens. */
  totalWord: string;
  /** The decade currently filtered, written as its first year for the address. */
  active: string;
  /** When two generations are read at once, the counters picked. */
  activeKeys?: string[];
  onPick: (decade: string) => void;
  /** A country read inside the picked decade: both filters land together. */
  onPickPays?: (decade: string, code: string) => void;
  /** The country already applied, so its code reads as picked. */
  activePays?: string;
};

/**
 * The generations of the profiles listed — ten years under one counter, so an
 * era reads at a glance instead of a scatter of single years. Each counter also
 * carries the country split of that decade underneath: where the workshops of
 * those ten years actually stand.
 * Same gesture as the genre counters: one click opens a generation, the second
 * hands the whole range back. The country code under a decade is a door of its
 * own: it opens that generation inside that country only.
 */
export default function GenerationTally({
  counts, total, totalWord, active, activeKeys, onPick, onPickPays, activePays,
}: Props) {
  const { t } = useLang();

  return (
    <TallyBar
      label={t('genTally.label')}
      icon="ri-calendar-event-line"
      hint={t('genTally.hint')}
      total={total}
      totalWord={totalWord}
      items={counts.map((row) => ({
        key: String(row.decade),
        label: decadeLabel(row.decade),
        count: row.count,
        parts: row.parts,
      }))}
      active={active}
      activeKeys={activeKeys}
      onPick={onPick}
      onPickPart={onPickPays ? (decade, code) => onPickPays(decade, code) : undefined}
      activePart={activePays}
      foldAt={6}
      moreWord={t('genTally.more')}
      expandHint={t('genTally.expand')}
      fewerLabel={t('genTally.fewer')}
    />
  );
}