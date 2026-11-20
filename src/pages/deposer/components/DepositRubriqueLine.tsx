import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useRubriqueCount } from '@/hooks/useRubriqueCount';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';
import type { AnnonceCat } from '@/mocks/annonces';
import type { Contract } from '@/mocks/emplois';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

type Props = {
  kind: DepositKind;
  rubrique: string;
  /** Les lignes publiées dans toute la famille : le tout dont la rubrique est une part. */
  total?: number;
  /** Reprend le titre le plus court comme base modifiable dans le formulaire. */
  onUse?: (titre: string) => void;
};

/**
 * Sous l'aperçu, la rubrique choisie prend son compte et sa porte : combien
 * de lignes sont déjà publiées dessous sur le tableau, et le geste pour
 * l'ouvrir déjà resserré sur elle. Une rubrique encore vide le dit, sans
 * promettre une liste qu'on ne trouvera pas. Sa part dans le tableau se lit
 * d'un coup d'œil : une petite barre et son pourcentage.
 */
export default function DepositRubriqueLine({ kind, rubrique, total = 0, onUse }: Props) {
  const { t } = useLang();
  const { count, loading, shortest } = useRubriqueCount(kind, rubrique);

  if (!rubrique) {
    return (
      <p className="dep-rubrique-line is-idle">
        <i className="ri-list-check-2" aria-hidden="true"></i>
        {t('dep.rubriquePick')}
      </p>
    );
  }

  const label = kind === 'annonce'
    ? t(CAT_KEY[rubrique as AnnonceCat])
    : t(CONTRACT_KEY[rubrique as Contract]);
  const door = kind === 'annonce' ? `/annonces?cat=${rubrique}` : `/emplois?contrat=${rubrique}`;
  const doorTitle = kind === 'annonce'
    ? t('dep.rubriqueDoorAnnonce')
    : t('dep.rubriqueDoorOffre');

  /**
   * Reprendre le titre le plus court : il arrive dans le champ du titre, déjà
   * sélectionné, pour servir de base à réécrire — rien ne part sans l'envoi.
   */
  const useShortest = () => {
    if (!shortest || !onUse) return;
    onUse(shortest);
    const prefix = kind === 'annonce' ? 'ann' : 'off';
    const input = document.getElementById(`${prefix}-titre`) as HTMLInputElement | null;
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      input.focus({ preventScroll: true });
      input.select();
      input.classList.add('is-jumped');
      window.setTimeout(() => input.classList.remove('is-jumped'), 1800);
    }, 260);
  };

  /* La part de la rubrique dans sa famille, bornée à 100 : un stock de
     référence et des dépôts validés ne doivent jamais dépasser le tout. */
  const share = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;

  /* Ce que le compte veut dire, en une phrase : la rubrique est-elle déjà
     fournie, ou presque vide ? Le ton suit la réponse — l'absence se dit
     sans reproche, puisqu'elle ouvre justement la place. */
  const verdict = count === 0
    ? { tone: 'is-empty', icon: 'ri-seedling-line', text: t('dep.rubriqueVerdictEmpty') }
    : count <= 3
      ? {
        tone: 'is-few',
        icon: 'ri-bar-chart-line',
        text: t('dep.rubriqueVerdictFew').replace('{n}', String(count)),
      }
      : count < 12
        ? {
          tone: 'is-some',
          icon: 'ri-bar-chart-2-line',
          text: t('dep.rubriqueVerdictSome').replace('{n}', String(count)),
        }
        : {
          tone: 'is-full',
          icon: 'ri-bar-chart-box-line',
          text: t('dep.rubriqueVerdictFull').replace('{n}', String(count)),
        };

  return (
    <div className="dep-rubrique-block">
      <div className="dep-rubrique-line">
      <span className="dep-rubrique-line-count" title={t('dep.rubriqueCountHint')}>
        <i className="ri-list-check-2" aria-hidden="true"></i>
        <b>{loading ? '…' : count}</b>
        <span>{t('dep.rubriqueCount')}</span>
      </span>
      <span className="dep-rubrique-line-name">{label}</span>
      <span className="dep-rubrique-share" title={t('dep.rubriqueShareHint')}>
        <span className="dep-rubrique-bar" aria-hidden="true">
          <span
            className={`dep-rubrique-bar-fill${loading ? ' is-waiting' : ''}`}
            style={{ width: `${loading ? 0 : share}%` }}
          ></span>
        </span>
        <b className="dep-rubrique-share-num" dir="ltr">
          {loading ? '…' : `${share} %`}
        </b>
        <span className="dep-rubrique-share-label">{t('dep.rubriqueShare')}</span>
      </span>
      <Link className="dep-rubrique-line-door" to={door} title={doorTitle}>
        {t('dep.rubriqueDoor')}
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
      </div>

      {/* La densité de la rubrique, dite en une phrase : bien fournie ou
          presque vide, et ce que cela change pour le dépôt en cours. */}
      <p className={`dep-rubrique-verdict ${verdict.tone}`} title={t('dep.rubriqueVerdictHint')}>
        <i className={verdict.icon} aria-hidden="true"></i>
        <span>{loading ? t('dep.rubriqueVerdictWait') : verdict.text}</span>
      </p>

      {/* Le titre le plus court déjà publié dans la rubrique : un repère
          d'écriture, pas une consigne. Il montre jusqu'où la rubrique sait
          rester sobre, avant que le visiteur n'allonge le sien. */}
      <p className="dep-rubrique-shortest" title={t('dep.rubriqueShortestHint')}>
        <i className="ri-quill-pen-line" aria-hidden="true"></i>
        {loading ? (
          <span>{t('dep.rubriqueShortestWait')}</span>
        ) : shortest ? (
          <>
            <span className="dep-rubrique-shortest-label">{t('dep.rubriqueShortest')}</span>
            <span className="dep-rubrique-shortest-title">« {shortest} »</span>
            <span className="dep-rubrique-shortest-len">
              {t('dep.rubriqueShortestChars').replace('{n}', String(shortest.length))}
            </span>
            {/* Le repère devient un point de départ : le titre le plus court
                arrive dans le champ, prêt à être réécrit. */}
            {onUse && (
              <button
                type="button"
                className="dep-rubrique-shortest-use"
                title={t('dep.rubriqueShortestUseHint')}
                onClick={useShortest}
              >
                <i className="ri-input-cursor-move" aria-hidden="true"></i>
                {t('dep.rubriqueShortestUse')}
              </button>
            )}
          </>
        ) : (
          <span>{t('dep.rubriqueShortestNone')}</span>
        )}
      </p>
    </div>
  );
}