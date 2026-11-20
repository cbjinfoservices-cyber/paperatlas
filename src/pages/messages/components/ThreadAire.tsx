import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import {
  REGIONS_MONDE,
  fichesDesPays,
  type RegionMonde,
} from '@/lib/worldRegions';

type Props = {
  /** L'aire de l'interlocuteur, lue sur son pays : elle situe le fil dans le
      monde arabe, avec le nombre de fiches qu'elle tient dans l'annuaire. */
  region: RegionMonde;
  /** La boîte est-elle déjà resserrée sur cette aire ? */
  active: boolean;
  /** Resserrer la messagerie sur les fils de cette même aire. */
  onPick: () => void;
};

/**
 * L'aire de l'interlocuteur, rappelée sous son nom dans la liste des fils.
 * Elle se suffit d'elle-même, mais elle est aussi une porte : d'un appui, la
 * boîte ne montre plus que les fils dont l'interlocuteur se tient dans cette
 * aire. Le survol dit son rang parmi les cinq aires du monde et le nombre de
 * ses pays, pour la situer avant de resserrer.
 */
export default function ThreadAire({ region, active, onPick }: Props) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  const files = fichesDesPays(region.pays);
  const label = t(`worldRegion.${region.key}`);
  const rank = REGIONS_MONDE.findIndex((row) => row.key === region.key) + 1;
  const total = REGIONS_MONDE.length;

  const hint = t(active ? 'msg.threadAireOffHint' : 'msg.threadAireHint')
    .replace('{region}', label)
    .replace('{files}', files.toLocaleString(locale))
    .replace('{unit}', t('cmaps.airesChipFiles'))
    .replace('{rank}', String(rank > 0 ? rank : 1))
    .replace('{total}', String(total))
    .replace('{pays}', String(region.pays.length));

  return (
    <button
      type="button"
      className={`msg-thread-aire${active ? ' is-on' : ''}`}
      title={hint}
      aria-pressed={active}
      aria-label={hint}
      onClick={(event) => {
        /* La ligne ne doit pas ouvrir le fil : elle ne fait que resserrer. */
        event.stopPropagation();
        onPick();
      }}
    >
      <i className="ri-map-2-line" aria-hidden="true"></i>
      {label}
      <em>
        {files.toLocaleString(locale)}
        {' '}
        {t('cmaps.airesChipFiles')}
      </em>
      <i className="ri-filter-3-line msg-thread-aire-go" aria-hidden="true"></i>
    </button>
  );
}