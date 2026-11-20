import { useLang } from '@/i18n/LangProvider';
import { nomRegion } from '@/lib/regionLabels';
import { motDivision } from '@/lib/division';

export type LegendItem = { wilaya: string; count: number };

type Props = {
  items: LegendItem[];
  total: number;
  active: string;
  /** ISO country code on screen: it names the division of the legend. */
  pays: string;
  onPick: (wilaya: string) => void;
};

export default function MapLegend({ items, total, active, pays, onPick }: Props) {
  const { t, lang } = useLang();
  const max = items.reduce((m, item) => Math.max(m, item.count), 1);

  return (
    <div className="map-legend">
      <p className="map-legend-title">
        <i className="ri-bar-chart-horizontal-line" aria-hidden="true"></i>
        {`${t('legend.byRegion')} ${motDivision(pays, lang)}`}
      </p>
      <ul>
        <li>
          <button type="button" className={active ? '' : 'is-on'} onClick={() => onPick('')}>
            <span className="legend-name">{motDivision(pays, lang, 'tous')}</span>
            <span className="legend-bar"><i style={{ width: '100%' }}></i></span>
            <span className="legend-count">{total}</span>
          </button>
        </li>
        {items.map((item) => (
          <li key={item.wilaya}>
            <button
              type="button"
              className={active === item.wilaya ? 'is-on' : ''}
              onClick={() => onPick(item.wilaya)}
            >
              <span className="legend-name">{nomRegion(item.wilaya, lang)}</span>
              <span className="legend-bar">
                <i style={{ width: `${Math.max(8, Math.round((item.count / max) * 100))}%` }}></i>
              </span>
              <span className="legend-count">{item.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}