import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** How many profiles the current selection holds. */
  files: number;
  /** How many different regions they come from. */
  regions: number;
  /** The 22 countries of the Arab world, the scope of the board. */
  paysTotal: number;
  /** Authors read as « profils », workshops as « fiches ». */
  kind: 'biz' | 'auteurs';
};

/**
 * One line above the grid: how much the current selection holds, and how far it
 * spreads. It is read on the filtered list, so every search, country, region or
 * trade filter rewrites it the moment the cards change.
 */
export default function GridTally({ files, regions, paysTotal, kind }: Props) {
  const { t } = useLang();

  return (
    <div className="gtally" role="status" aria-live="polite" title={t('gtally.hint')}>
      <span className="gtally-item">
        <i className="ri-file-list-3-line" aria-hidden="true"></i>
        <b>{files}</b>
        {kind === 'auteurs' ? t('gtally.profiles') : t('gtally.files')}
      </span>
      <span className="gtally-sep" aria-hidden="true">·</span>
      <span className="gtally-item">
        <i className="ri-map-pin-2-line" aria-hidden="true"></i>
        <b>{regions}</b>
        {t('gtally.regions')}
      </span>
      <span className="gtally-sep" aria-hidden="true">·</span>
      <span className="gtally-item gtally-item--scope">
        <i className="ri-earth-line" aria-hidden="true"></i>
        {t('gtally.ofCountries')} <b>{paysTotal}</b> {t('gtally.countries')}
      </span>
    </div>
  );
}