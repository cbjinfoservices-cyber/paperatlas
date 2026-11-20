import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { memoriserPays, paysArabes, paysDevine } from '@/lib/pays';

type Props = {
  id: string;
  /** Field name posted with the form; defaults to the id. */
  name?: string;
  /** Current country. Left empty, the field opens on Algeria. */
  value?: string | null;
  defaultValue?: string;
  /** Told on every change, so the region field can follow the country. */
  onChange?: (value: string) => void;
  /** Adds an empty « all countries » option, for the filters. */
  allLabel?: string;
  disabled?: boolean;
};

/**
 * One country field, reused everywhere a member says where he works from: the
 * two sign-up forms, the account profile, the deposit form and the filters. It
 * keeps its own value, so it works both with and without a parent state, and
 * every change is announced so the region list can adapt right away.
 */
export default function PaysSelect({
  id,
  name,
  value,
  defaultValue,
  onChange,
  allLabel,
  disabled,
}: Props) {
  const { t, lang } = useLang();
  /* Left to itself, the field opens on the country the visitor already chose,
     or on the one his time zone or language points at — never on a blind
     default that would make every form say « Algérie ». */
  const [current, setCurrent] = useState(value || defaultValue || paysDevine());

  /* A parent that loads the country later (the account profile) wins. */
  useEffect(() => {
    if (typeof value === 'string' && value) setCurrent(value);
  }, [value]);

  return (
    <div className="fld">
      <label htmlFor={id}>{t('pays.label')}</label>
      <select
        id={id}
        name={name ?? id}
        disabled={disabled}
        value={current}
        onChange={(event) => {
          setCurrent(event.target.value);
          memoriserPays(event.target.value);
          onChange?.(event.target.value);
        }}
      >
        {allLabel && <option value="">{allLabel}</option>}
        {paysArabes.map((pays) => (
          <option key={pays.code} value={pays.code}>
            {localize(pays.nom, lang)}
          </option>
        ))}
      </select>
    </div>
  );
}