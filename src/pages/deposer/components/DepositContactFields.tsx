import { useLang } from '@/i18n/LangProvider';
import PaysSelect from '@/components/feature/PaysSelect';
import { deviseCode, exempleTelephone, indicatifDe, libelleDevise } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import type { DepositFormState } from '@/pages/deposer/components/useDepositForm';

type Props = {
  f: DepositFormState;
  /** Pour que les identifiants des champs ne se heurtent pas entre les deux formulaires. */
  idPrefix: string;
  orgLabel: string;
  budgetLabel: string;
  budgetPlaceholder: string;
};

/**
 * Les coordonnées d'un dépôt : l'établissement, le prix ou le salaire, le pays,
 * la wilaya, la commune, l'e-mail et le téléphone. Les deux formulaires les
 * posent à l'identique ; seuls deux intitulés changent selon ce que l'on dépose.
 */
export default function DepositContactFields({
  f,
  idPrefix,
  orgLabel,
  budgetLabel,
  budgetPlaceholder,
}: Props) {
  const { t, lang } = useLang();
  const division = motDivision(f.pays, lang);

  return (
    <div className="form-grid">
      <div className="fld">
        <label htmlFor={`${idPrefix}-org`}>{orgLabel} *</label>
        <input
          id={`${idPrefix}-org`}
          name="organisation"
          required
          placeholder={t('cf.orgPh')}
          value={f.org}
          onChange={(e) => f.setOrg(e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor={`${idPrefix}-budget`} title={libelleDevise(f.pays, lang)}>
          {budgetLabel} · {deviseCode(f.pays)}
        </label>
        <input
          id={`${idPrefix}-budget`}
          name="budget"
          placeholder={budgetPlaceholder}
          value={f.budget}
          onChange={(e) => f.setBudget(e.target.value)}
        />
      </div>
      <PaysSelect
        id={`${idPrefix}-pays`}
        name="pays"
        value={f.pays}
        onChange={f.setPays}
      />
      <div className="fld">
        <label htmlFor={`${idPrefix}-wilaya`}>{division}</label>
        <select
          id={`${idPrefix}-wilaya`}
          name="wilaya"
          value={f.wilaya}
          onChange={(e) => f.setWilaya(e.target.value)}
        >
          <option value="">{motDivision(f.pays, lang, 'tous')}</option>
          {f.wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div className="fld">
        <label htmlFor={`${idPrefix}-commune`}>{t('dep.commune')}</label>
        <input
          id={`${idPrefix}-commune`}
          name="commune"
          placeholder={t('dep.communePh')}
          value={f.commune}
          onChange={(e) => f.setCommune(e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor={`${idPrefix}-email`}>{t('dep.email')} *</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          name="email"
          required
          placeholder={t('cf.emailPh')}
          value={f.email}
          onChange={(e) => f.setEmail(e.target.value)}
        />
      </div>
      <div className="fld">
        <label htmlFor={`${idPrefix}-phone`} title={indicatifDe(f.pays)}>
          {t('dep.phone')} · {indicatifDe(f.pays)}
        </label>
        <input
          id={`${idPrefix}-phone`}
          type="tel"
          name="telephone"
          placeholder={exempleTelephone(f.pays)}
          value={f.phone}
          onChange={(e) => f.setPhone(e.target.value)}
        />
      </div>
    </div>
  );
}