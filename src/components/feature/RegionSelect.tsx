import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { paysArabes } from '@/lib/pays';
import { regionsDe, regionsWith } from '@/lib/regions';
import { nomRegion } from '@/lib/regionLabels';

type Props = {
  id: string;
  /** ISO code of the country in the filters, "" for every country. */
  pays: string;
  /** The region currently applied, "" for none. */
  value: string;
  /** The region and the country it belongs to travel together. */
  onChange: (region: string, code: string) => void;
  allLabel: string;
  className?: string;
};

/**
 * The region field of every filter. With a country chosen it opens on that
 * country's own regions — wilayas in Algeria, governorates or emirates
 * elsewhere. With no country chosen it opens the whole world arab list, each
 * region sitting under the name of its country, so a place can be picked
 * directly without guessing where it belongs.
 */
export default function RegionSelect({ id, pays, value, onChange, allLabel, className }: Props) {
  const { lang } = useLang();
  const selected = value ? (pays ? `${pays}|${value}` : value) : '';
  /* A region handed over by an old link, outside the chosen country's list:
     it stays visible and selected instead of silently disappearing. */
  const orphan = value && (!pays || !regionsDe(pays).includes(value)) ? value : '';

  return (
    <select
      id={id}
      className={className}
      value={selected}
      onChange={(event) => {
        const raw = event.target.value;
        if (!raw) {
          onChange('', '');
          return;
        }
        const cut = raw.indexOf('|');
        if (cut < 0) {
          onChange(raw, pays);
          return;
        }
        onChange(raw.slice(cut + 1), raw.slice(0, cut));
      }}
    >
      <option value="">{allLabel}</option>
      {orphan && <option value={orphan}>{nomRegion(orphan, lang)}</option>}
      {pays ? (
        regionsWith(pays, value).map((region) => (
          <option key={region} value={`${pays}|${region}`}>{nomRegion(region, lang)}</option>
        ))
      ) : (
        paysArabes.map((country) => (
          <optgroup key={country.code} label={localize(country.nom, lang)}>
            {regionsDe(country.code).map((region) => (
              <option key={`${country.code}-${region}`} value={`${country.code}|${region}`}>
                {nomRegion(region, lang)}
              </option>
            ))}
          </optgroup>
        ))
      )}
    </select>
  );
}