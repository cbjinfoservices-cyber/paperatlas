import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useRubriqueRange } from '@/hooks/useRubriqueRange';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

type Props = {
  kind: DepositKind;
  rubrique: string;
  /** Le pays du dépôt : la fourchette se lit dans sa monnaie. */
  pays: string;
  /** Mène le curseur au champ du prix. */
  onUse: () => void;
};

/**
 * Sous le prix laissé vide, un repère plutôt qu'un vide : la fourchette des
 * prix déjà affichés dans la rubrique, dans la monnaie du pays. Elle ne
 * s'affiche que si deux dépôts au moins la portent, et ne remplit jamais le
 * champ d'elle-même — un clic mène au prix, qui reste à écrire.
 */
export default function DepositPriceHint({ kind, rubrique, pays, onUse }: Props) {
  const { t, lang } = useLang();
  const range = useRubriqueRange(kind, rubrique, pays);
  if (!range) return null;

  const nombre = (value: number) => new Intl.NumberFormat(localeFor(lang)).format(value);
  const texte = range.min === range.max
    ? `${nombre(range.min)} ${range.devise}`
    : `${nombre(range.min)} – ${nombre(range.max)} ${range.devise}`;

  /* Le jour du dépôt en base le plus récent : la fraîcheur de la fourchette,
     lue seulement quand au moins un dépôt réel la porte. */
  const fresh = range.lastAt
    ? new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(new Date(range.lastAt))
    : '';

  /* Son âge en jours, à côté de la date : l'ancienneté se lit sans calcul. */
  const ageStamp = range.lastAt ? new Date(range.lastAt).getTime() : NaN;
  const ageDays = Number.isFinite(ageStamp)
    ? Math.max(0, Math.floor((Date.now() - ageStamp) / (24 * 60 * 60 * 1000)))
    : -1;
  const age = ageDays < 0
    ? ''
    : ageDays === 0
      ? t('dep.previewRangeAgeToday')
      : ageDays === 1
        ? t('dep.previewRangeAgeOne')
        : t('dep.previewRangeAgeMany').replace('{n}', String(ageDays));

  /* D'où vient la fourchette : les dépôts validés en base et le stock de
     référence du tableau, comptés séparément. Le survol le dit. */
  const hint = range.countBase > 0
    ? `${t('dep.previewRangeHint')} ${t('dep.previewRangeSplit')
      .replace('{base}', String(range.countBase))
      .replace('{stock}', String(range.countStock))}${fresh ? ` ${t('dep.previewRangeFreshHint').replace('{date}', fresh)}${age ? ` · ${age}` : ''}` : ''}`
    : `${t('dep.previewRangeHint')} ${t('dep.previewRangeSplitStock')
      .replace('{stock}', String(range.countStock))}`;

  /* La provenance est aussi une porte : le tableau du même type, déjà resserré
     sur cette rubrique et sur ce pays, pour lire les dépôts qui font le prix. */
  const cle = rubrique.trim();
  const paysParam = pays ? `&pays=${encodeURIComponent(pays)}` : '';
  const boardHref = kind === 'annonce'
    ? `/annonces?cat=${encodeURIComponent(cle)}${paysParam}`
    : `/emplois?contrat=${encodeURIComponent(cle)}${paysParam}`;
  /* Ce que le tableau filtré ouvrira vraiment : ses dépôts publiés de la
     rubrique et du pays, tous prix confondus. */
  const boardCount = range.boardCount;
  /* Les lignes que le filtre ouvrira, et celles qui portent vraiment un prix :
     deux nombres, pour ne pas confondre un dépôt avec un montant. */
  const boardPriced = range.boardPriced;
  /* Les dépôts que le tableau ouvrira et dont le prix ne se lit pas : ce sont
     des lignes sans montant, à corriger dans « Mes annonces ». */
  const boardUnpriced = Math.max(0, boardCount - boardPriced);
  /* La porte de correction : le tableau du compte, déjà resserré sur la même
     rubrique et le même pays, chaque ligne prête à recevoir son prix. */
  const fixHref = `/compte?tab=${kind}&mrub=${encodeURIComponent(cle)}${
    pays ? `&mpays=${encodeURIComponent(pays)}` : ''
  }#my-listings`;
  const boardHint = boardCount > 0
    ? `${t('dep.previewRangeBoardCountHint').replace('{n}', nombre(boardCount))} ${t('dep.previewRangeBoardPricedHint')
      .replace('{rows}', nombre(boardCount))
      .replace('{n}', nombre(boardPriced))}`
    : t('dep.previewRangeBoardNone');
  const splitText = range.countBase > 0
    ? t('dep.previewRangeSplitShort')
      .replace('{base}', String(range.countBase))
      .replace('{stock}', String(range.countStock))
    : t('dep.previewRangeSplitStockShort').replace('{stock}', String(range.countStock));

  return (
    <p className="dep-preview-range" title={hint}>
      <i className="ri-price-tag-2-line" aria-hidden="true"></i>
      <span className="dep-preview-range-label">{t('dep.previewRangeLabel')}</span>
      <button
        type="button"
        className="dep-preview-range-use"
        title={t('dep.previewRangeUse')}
        onClick={onUse}
      >
        <b dir="ltr">{texte}</b>
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </button>
      <span className="dep-preview-range-note">
        {t('dep.previewRangeNote').replace('{n}', String(range.count))}
      </span>
      {/* La provenance des prix, et sa porte : le tableau de la rubrique, déjà
          filtré sur le pays du dépôt. */}
      <Link
        to={boardHref}
        className="dep-preview-range-split dep-preview-range-split-door"
        title={boardHint}
      >
        <span className="dep-preview-range-split-txt">{splitText}</span>
        <span className="dep-preview-range-board">
          {t('dep.previewRangeBoard')}
          {boardCount > 0 && (
            <span className="dep-preview-range-board-n" dir="ltr">{nombre(boardCount)}</span>
          )}
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </span>
        {/* Le nombre de lignes ne dit pas le nombre de prix : la porte porte
            aussi le compte de celles qui se lisent vraiment. */}
        {boardCount > 0 && (
          <span
            className="dep-preview-range-priced"
            title={t('dep.previewRangeBoardPricedHint')
              .replace('{rows}', nombre(boardCount))
              .replace('{n}', nombre(boardPriced))}
          >
            <i className="ri-price-tag-3-line" aria-hidden="true"></i>
            {boardPriced > 0
              ? t('dep.previewRangeBoardPriced').replace('{n}', nombre(boardPriced))
              : t('dep.previewRangeBoardPricedNone')}
          </span>
        )}
        {/* Ce que la porte laisse sans montant : la ligne existe dans le
            tableau, mais son prix ne s'y lit pas — le compte se dit ici. */}
        {boardCount > 0 && boardUnpriced > 0 && (
          <span
            className="dep-preview-range-unpriced"
            title={t('dep.previewRangeUnpricedHint').replace('{n}', nombre(boardUnpriced))}
          >
            <i className="ri-eraser-line" aria-hidden="true"></i>
            {t('dep.previewRangeUnpriced').replace('{n}', nombre(boardUnpriced))}
          </span>
        )}
      </Link>
      {/* La correction, d'un seul geste : « Mes annonces » s'ouvre sur la même
          rubrique et le même pays, là où le prix s'écrit. */}
      {boardUnpriced > 0 && (
        <Link
          to={fixHref}
          className="dep-preview-range-fix"
          title={t('dep.previewRangeFixHint').replace('{n}', nombre(boardUnpriced))}
        >
          <i className="ri-pencil-line" aria-hidden="true"></i>
          <span>{t('dep.previewRangeFix').replace('{n}', nombre(boardUnpriced))}</span>
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </Link>
      )}
      {/* La fraîcheur : le jour du dépôt en base le plus récent, et son âge en
          jours, sous la provenance, pour que le repère ne paraisse pas figé. */}
      {range.countBase > 0 && fresh && (
        <span className="dep-preview-range-fresh" title={t('dep.previewRangeFreshHint').replace('{date}', fresh)}>
          <i className="ri-time-line" aria-hidden="true"></i>
          {t('dep.previewRangeFresh').replace('{date}', fresh)}
          {age && <span className="dep-preview-range-age">{age}</span>}
        </span>
      )}
    </p>
  );
}