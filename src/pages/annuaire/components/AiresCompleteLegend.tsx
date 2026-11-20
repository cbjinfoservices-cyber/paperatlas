import { useLang } from '@/i18n/LangProvider';
import './aires-complete-legend.css';

type Props = {
  /** Les aires complètes de la rangée, comptées dans la phrase. */
  count: number;
  /** Toutes les aires de la rangée, complètes ou non. */
  total: number;
  /** Le nom de la première aire complète, écrit sur l'échantillon. */
  sample: string;
  /** Ces aires, nommées une à une dans le survol. */
  names: string;
  /** Les fiches que ces aires complètes tiendraient une fois envoyées. */
  files: number;
};

/**
 * Sous une rangée d'aires, une légende discrète : elle explique une seule fois
 * ce que disent le trait affermi et la coche — les aires dont tous les pays
 * ont déjà été copiés seuls —, avec l'échantillon d'une pastille complète.
 * Les deux rangées portent la même, si bien qu'aucune n'a son vocabulaire.
 * Son survol achève la phrase sur les fiches que ces aires tiendraient une
 * fois envoyées : le geste se mesure avant d'être pressé.
 */
export default function AiresCompleteLegend({ count, total, sample, names, files }: Props) {
  const { t } = useLang();
  const poids = t('cmaps.airesLegendFiles')
    .replace('{files}', files.toLocaleString())
    .replace('{unit}', t('cmaps.airesChipFiles'));
  return (
    <p
      className="aires-legend"
      title={`${t('cmaps.airesLegendHint')}${names ? ` · ${names}` : ''} · ${poids}`}
    >
      <span className="aires-legend-label">{t('cmaps.airesLegendLabel')}</span>
      <span className="aires-legend-sample" aria-hidden="true">
        {sample}
        <i className="ri-checkbox-circle-fill"></i>
      </span>
      <span className="aires-legend-txt">
        {t('cmaps.airesLegend')
          .replace('{n}', String(count))
          .replace('{total}', String(total))}
      </span>
    </p>
  );
}