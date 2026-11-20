import { Link } from 'react-router-dom';
import CopyTextButton from '@/components/feature/CopyTextButton';
import {
  devisDormantConfirmedHref,
  devisDormantHref,
  devisRestoredHref,
} from '@/lib/b2bLinks';

/** Une marque datée, telle que la bulle de l'en-tête la nomme. */
type MarkRow = { reference: string; at: string };

type Props = {
  loading: boolean;
  error: string;
  total: number;
  shares: { count: number; lastAt: string | null };
  restored: {
    count: number;
    lastAt: string | null;
    /** Le délai moyen depuis le retour, en jours — null quand rien n'est revenu. */
    avgDays: number | null;
    alone: boolean;
    onToggle: () => void;
    folded: boolean;
    open: boolean;
    onToggleOpen: () => void;
    all: boolean;
    onToggleAll: () => void;
    list: MarkRow[];
    visible: MarkRow[];
  };
  addressed: {
    count: number;
    lastAt: string | null;
    alone: boolean;
    onToggle: () => void;
  };
  /** Les dossiers seulement adressés qui dorment depuis plus d'une semaine :
   *  leur pastille porte leur compteur, le montant cumulé de leurs devis, la
   *  date du plus ancien et le lien de leur lecture. */
  dormant: {
    count: number;
    oldestAt: string | null;
    /** Le montant cumulé des devis encore endormis, écrit avec sa devise. */
    amount: string;
    /** La part de l'attente totale que ces devis représentent — « 32 % ».
     *  Vide quand les deux côtés ne parlent pas la même devise. */
    share: string;
    /** Combien de marchés ce lot mêle : au-delà d'un, la pastille le dit, pour
     *  que personne ne prenne le montant cumulé pour un total d'une seule
     *  devise. Zéro quand aucun montant n'est lisible. */
    devises: number;
    /** Le délai moyen de ces dossiers, en jours — null quand le lot est vide.
     *  Posé à côté de la part de l'attente, il dit depuis combien de temps
     *  cela dort, pas seulement ce que cela pèse. */
    avgDays: number | null;
    alone: boolean;
    onToggle: () => void;
  };
  /** Sa jumelle : parmi les dossiers qui dorment, ceux dont le devis est déjà
   *  confirmé — le devis est prêt, il n'a simplement jamais circulé. Elle porte
   *  leur compteur, le montant cumulé de ces devis-là, et le rapport de ce
   *  montant à celui de tous les endormis. */
  dormantConfirmed: {
    count: number;
    /** Le montant cumulé de ces devis, écrit avec sa devise. */
    amount: string;
    /** Le montant cumulé de tous les endormis : la pastille y rapporte le sien. */
    dormantAmount: string;
    /** La part du montant des endormis que représentent les confirmés. */
    share: string;
    /** Combien de marchés ces devis prêts mêlent : au-delà d'un, la pastille
     *  le dit, comme sa voisine — le montant cumulé ne se prend donc pas pour
     *  un total d'une seule devise. Zéro quand aucun montant n'est lisible. */
    devises: number;
    /** Le délai moyen de ces devis prêts, en jours — null quand il n'y en a
     *  aucun. */
    avgDays: number | null;
    /** Le délai moyen de tous les endormis : la pastille y rapporte le sien,
     *  comme elle rapporte déjà son montant à celui de l'attente entière. */
    dormantAvgDays: number | null;
    alone: boolean;
    onToggle: () => void;
  };
  forgotten: {
    count: number;
    total: number;
    onRestore: () => void;
    visible: MarkRow[];
    folded: boolean;
    all: boolean;
    onToggleAll: () => void;
  };
  lang: string;
  day: (iso: string) => string;
  t: (key: string) => string;
};

/** Whole days between a day and today, never negative. */
function ageInDays(iso: string) {
  const at = new Date(iso).getTime();
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((Date.now() - at) / (24 * 60 * 60 * 1000)));
}

/**
 * La ventilation de l'en-tête de « Devis envoyés » : les devis de la liste, puis
 * les dossiers qui circulent, ceux qui sont revenus (avec leur délai moyen), les
 * dossiers seulement adressés, et les marques retirées.
 *
 * Chaque pastille est une porte : un clic garde la liste réduite à sa propre
 * lecture — les mêmes lignes que son compteur. Les trois lectures s'excluent,
 * et les marques retirées ne comptent jamais un dossier rendu.
 */
export default function DevisHeadCounts({
  loading,
  error,
  total,
  shares,
  restored,
  addressed,
  dormant,
  dormantConfirmed,
  forgotten,
  lang,
  day,
  t,
}: Props) {
  const quiet = !loading && !error;

  return (
    <div className="dvl-head-counts">
      <span className="dvl-count">
        <i className="ri-file-list-3-line" aria-hidden="true"></i>
        {total} {t('dv.listCount')}
      </span>

      {/* Le nombre de dossiers qui circulent déjà, à côté du compteur de devis :
          la liste dit d'un coup d'œil ce qui est déjà sorti. */}
      {shares.count > 0 && (
        <span
          className="dvl-count dvl-count-shares"
          title={
            shares.lastAt
              ? `${t('dv.listSharedHint')} — ${t('dv.listSharedLast').replace('{date}', day(shares.lastAt))}`
              : t('dv.listSharedHint')
          }
        >
          <i className="ri-share-forward-line" aria-hidden="true"></i>
          {shares.count} {t('dv.listSharedCount')}
          {shares.lastAt && (
            <em className="dvl-count-when">
              {t('dv.listSharedLast').replace('{date}', day(shares.lastAt))}
            </em>
          )}
        </span>
      )}

      {quiet && restored.count > 0 && (
        <span
          className="dvl-count dvl-count-restored"
          data-on={restored.alone ? 'yes' : 'no'}
          data-fold={restored.folded && restored.open ? 'yes' : 'no'}
        >
          <button
            type="button"
            className="dvl-count-restored-main"
            aria-pressed={restored.alone}
            title={t('dv.listRestoredHint')}
            onClick={restored.onToggle}
          >
            <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
            {restored.count} {t('dv.listRestoredCount')}
            {restored.lastAt && (
              <em className="dvl-count-when">
                {t('dv.sumMarksRestoredOn').replace('{date}', day(restored.lastAt))}
              </em>
            )}
            {/* Le délai moyen du lot, à côté du jour du dernier retour : le
                nombre dit combien, la date dit quand, la moyenne dit combien de
                temps ces retours portent. */}
            {restored.avgDays !== null && (
              <em className="dvl-count-when dvl-count-avg">
                {t('dv.csvRestoredAgoAvg').replace('{n}', String(restored.avgDays))}
              </em>
            )}
          </button>

          {/* Au-delà d'une dizaine, la pastille se replie : son chevron ouvre
              les dossiers rendus, dix lignes à la fois. */}
          {restored.folded && (
            <button
              type="button"
              className="dvl-count-restored-fold"
              aria-expanded={restored.open}
              aria-controls="dvl-count-restored-rows"
              title={t('dv.listRestoredFoldHint')}
              onClick={restored.onToggleOpen}
            >
              <i
                className={restored.open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {restored.open
                  ? t('dv.markSeeLess')
                  : t('dv.markSeeAll').replace('{n}', String(restored.list.length))}
              </span>
            </button>
          )}

          {/* Le lien des dossiers rendus se copie depuis la pastille. */}
          <CopyTextButton
            build={() => devisRestoredHref(lang)}
            label={t('dv.listRestoredCopy')}
            hint={t('dv.listRestoredCopyHint')}
            className="dvl-count-restored-copy"
          />

          {restored.folded && restored.open && (
            <span className="dvl-last-mark-rows dvl-count-mark-rows" id="dvl-count-restored-rows">
              {restored.visible.map(({ reference, at }) => (
                <span className="dvl-last-mark dvl-last-mark-row" key={reference}>
                  <Link
                    className="dvl-last-mark-link"
                    to={`/suivi?ref=${encodeURIComponent(reference)}`}
                    title={t('dv.followHint')}
                  >
                    <b>{reference}</b>
                    <span className="dvl-last-mark-when">
                      {t('dv.lastRestoredOn').replace('{date}', day(at))}
                    </span>
                    <span className="dvl-last-mark-ago">
                      {t('dv.lastRestoredAgo').replace('{n}', String(ageInDays(at)))}
                    </span>
                  </Link>
                </span>
              ))}
              {restored.folded ? (
                <button
                  type="button"
                  className="dvl-mark-more"
                  aria-expanded={restored.all}
                  title={
                    restored.all
                      ? t('dv.markSeeLess')
                      : t('dv.markSeeAll').replace('{n}', String(restored.list.length))
                  }
                  onClick={restored.onToggleAll}
                >
                  <i
                    className={restored.all ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {restored.all
                      ? t('dv.markSeeLess')
                      : t('dv.markSeeAll').replace('{n}', String(restored.list.length))}
                  </span>
                </button>
              ) : null}
            </span>
          )}
        </span>
      )}

      {/* La troisième lecture de la ventilation, dans l'en-tête comme sur la
          bande des Offres : les dossiers munis de leur adresse mais jamais
          transmis. Un clic la garde seule, un second la relâche. */}
      {quiet && addressed.count > 0 && (
        <span
          className="dvl-count dvl-count-addressed"
          data-on={addressed.alone ? 'yes' : 'no'}
          title={t('dv.listAddressedHint')}
        >
          <button
            type="button"
            className="dvl-count-addressed-main"
            aria-pressed={addressed.alone}
            onClick={addressed.onToggle}
          >
            <i className="ri-at-line" aria-hidden="true"></i>
            {addressed.count} {t('dv.listAddressedCount')}
            {/* Le jour du dernier dossier resté seulement adressé : celui de son
                entrée dans le lot, puisque son adresse n'a jamais circulé. */}
            {addressed.lastAt && (
              <em className="dvl-count-when">
                {t('dv.listAddressedLast').replace('{date}', day(addressed.lastAt))}
              </em>
            )}
          </button>
        </span>
      )}

      {/* La pastille des dossiers qui dorment, dans l'en-tête comme sur la
          bande des Offres : son compteur, le montant cumulé de leurs devis,
          la date du plus ancien et le lien de leur lecture. Un clic sur le
          compteur garde ces seuls dossiers. */}
      {quiet && dormant.count > 0 && (
        <span
          className="dvl-count dvl-count-addressed dvl-count-dormant"
          data-on={dormant.alone ? 'yes' : 'no'}
          title={t('dv.filterDormantHint')}
        >
          <button
            type="button"
            className="dvl-count-addressed-main"
            aria-pressed={dormant.alone}
            onClick={dormant.onToggle}
          >
            <i className="ri-moon-line" aria-hidden="true"></i>
            {dormant.count} {t('dv.listDormantCount')}
            {/* Le montant cumulé, à côté du compteur : le nombre dit combien
                dorment, le montant dit ce qu'ils pèsent. */}
            {dormant.amount && (
              <em className="dvl-count-amount" title={t('dv.listDormantAmountHint')}>
                {dormant.amount}
              </em>
            )}
            {/* Et la part de l'attente entière que ces devis portent : un jeton
                à part, comme celui des endormis confirmés, pour que le
                pourcentage ne se lise pas comme un second montant. Rien ne
                s'écrit quand le calcul n'a pas de sens. */}
            {dormant.share && (
              <em
                className="dvl-count-share dvl-count-share-dormant"
                title={t('dv.listDormantShareHint')}
              >
                {dormant.share}
              </em>
            )}
            {/* Et le délai moyen du lot, juste à côté de sa part de l'attente :
                le pourcentage dit ce qu'il pèse, la moyenne dit depuis combien
                de temps ces dossiers attendent — la même horloge que le
                classeur et que la pastille des endormis confirmés. */}
            {dormant.avgDays !== null && (
              <em className="dvl-count-when dvl-count-avg" title={t('dv.listDormantAvgHint')}>
                {t('dv.listDormantAvg').replace('{n}', String(dormant.avgDays))}
              </em>
            )}
            {/* Et sur combien de marchés ce lot s'étend : le compteur dit
                combien dorment, le jeton dit sur combien de devises — le
                montant cumulé ne se prend donc pas pour un seul total. Rien
                ne s'écrit quand le lot ne mêle qu'une devise. */}
            {dormant.devises > 1 && (
              <em className="dvl-count-devises" title={t('dv.listDormantDevisesHint')}>
                {t('dv.listDormantDevises').replace('{n}', String(dormant.devises))}
              </em>
            )}
          </button>

          {/* Depuis quand le plus ancien attend, juste à côté du compteur : le
              compteur dit combien dorment, la date dit depuis quand — et la
              date elle-même est une porte vers leur lecture. */}
          {dormant.oldestAt && (
            <Link
              to={devisDormantHref(lang)}
              className="dvl-count-dormant-oldest"
              title={`${t('dv.listDormantOldestHint')} — ${t('dv.listDormantOldestOpen')}`}
            >
              <i className="ri-time-line" aria-hidden="true"></i>
              {t('dv.listDormantOldest').replace('{date}', day(dormant.oldestAt))}
            </Link>
          )}

          {/* Le lien des endormis se copie d'ici, sans ouvrir la liste. */}
          <CopyTextButton
            build={() => devisDormantHref(lang)}
            label={t('dv.listDormantCopy')}
            hint={t('dv.listDormantCopyHint')}
            className="dvl-count-restored-copy dvl-count-addressed-copy"
          />
        </span>
      )}

      {/* Sa jumelle, aussitôt après : les endormis dont le devis est déjà
          confirmé. Le devis est prêt, il n'a jamais circulé — même compteur,
          même porte, même lien copiable. */}
      {quiet && dormantConfirmed.count > 0 && (
        <span
          className="dvl-count dvl-count-addressed dvl-count-dormant dvl-count-dormant-ok"
          data-on={dormantConfirmed.alone ? 'yes' : 'no'}
          title={t('dv.filterDormantConfirmedHint')}
        >
          <button
            type="button"
            className="dvl-count-addressed-main"
            aria-pressed={dormantConfirmed.alone}
            onClick={dormantConfirmed.onToggle}
          >
            <i className="ri-check-double-line" aria-hidden="true"></i>
            {dormantConfirmed.count} {t('dv.listDormantConfirmedCount')}
            {/* Le montant de ces devis rapporté à celui de tous les endormis :
                le compteur dit combien attendent pour rien, la comparaison dit
                quelle part de l'attente est déjà prête. Sans l'un des deux
                montants, la pastille retombe sur le seul montant des
                confirmés — jamais sur une comparaison bancale. */}
            {dormantConfirmed.amount && dormantConfirmed.dormantAmount ? (
              <em
                className="dvl-count-amount"
                title={t('dv.listDormantConfirmedCompareHint')}
              >
                {t('dv.sumDormantConfirmedAmountOf')
                  .replace('{a}', dormantConfirmed.amount)
                  .replace('{b}', dormantConfirmed.dormantAmount)}
              </em>
            ) : dormantConfirmed.amount ? (
              <em
                className="dvl-count-amount"
                title={t('dv.listDormantConfirmedAmountHint')}
              >
                {dormantConfirmed.amount}
              </em>
            ) : null}
            {/* Et sous les montants, les deux délais moyens, l'un rapporté à
                l'autre : « 18 j sur 24 j ». La pastille dit ainsi si les devis
                prêts attendent plus longtemps que l'attente entière, et non
                seulement ce qu'ils pèsent. */}
            {dormantConfirmed.avgDays !== null && dormantConfirmed.dormantAvgDays !== null && (
              <em
                className="dvl-count-when dvl-count-avg"
                title={t('dv.listDormantConfirmedAvgCompareHint')}
              >
                {t('dv.sumDormantConfirmedAvgOf')
                  .replace('{a}', String(dormantConfirmed.avgDays))
                  .replace('{b}', String(dormantConfirmed.dormantAvgDays))}
              </em>
            )}
            {/* Et la part que cela représente, en pourcentage : le rapport brut
                se lit d'un coup d'œil, le pourcentage dit la proportion. Rien
                ne s'écrit quand les deux côtés ne parlent pas la même devise. */}
            {dormantConfirmed.share && (
              <em
                className="dvl-count-share"
                title={t('dv.listDormantConfirmedShareHint')}
              >
                {dormantConfirmed.share}
              </em>
            )}
            {/* Et sur combien de marchés ces devis prêts s'étendent : le
                compteur dit combien attendent pour rien, le jeton dit sur
                combien de devises — comme celui de la pastille des endormis.
                Rien ne s'écrit quand le lot ne mêle qu'une devise. */}
            {dormantConfirmed.devises > 1 && (
              <em
                className="dvl-count-devises"
                title={t('dv.listDormantConfirmedDevisesHint')}
              >
                {t('dv.listDormantDevises').replace(
                  '{n}',
                  String(dormantConfirmed.devises),
                )}
              </em>
            )}
          </button>

          <CopyTextButton
            build={() => devisDormantConfirmedHref(lang)}
            label={t('dv.lastDormantConfirmedCopy')}
            hint={t('dv.lastDormantConfirmedCopyHint')}
            className="dvl-count-restored-copy dvl-count-addressed-copy"
          />
        </span>
      )}

      {/* Le rappel des marques retirées : « Rétablir » les rend avec leur jour
          d'origine, sans descendre jusqu'aux lignes. */}
      {quiet && forgotten.count > 0 && (
        <span className="dvl-count dvl-count-forgot dvl-count-marks" title={t('dv.listForgotHint')}>
          <span className="dvl-count-forgot-head">
            <i className="ri-eraser-line" aria-hidden="true"></i>
            {t(forgotten.count > 1 ? 'dv.lastForgotMany' : 'dv.lastForgotOne').replace(
              '{n}',
              String(forgotten.count),
            )}
            <button
              type="button"
              className="dvl-count-restore"
              title={t('dv.restoreSharesHint')}
              onClick={forgotten.onRestore}
            >
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('dv.rowRestoreShare')}</span>
            </button>
          </span>
          <span className="dvl-last-mark-rows dvl-count-mark-rows">
            {forgotten.visible.map(({ reference, at }) => (
              <span className="dvl-last-mark" key={reference}>
                <b>{reference}</b>
                <span className="dvl-last-mark-when">
                  {t('dv.lastForgotOn').replace('{date}', day(at))}
                </span>
                <span className="dvl-last-mark-ago">
                  {t('dv.lastForgotAgo').replace('{n}', String(ageInDays(at)))}
                </span>
              </span>
            ))}
            {forgotten.folded && (
              <button
                type="button"
                className="dvl-mark-more"
                aria-expanded={forgotten.all}
                title={
                  forgotten.all
                    ? t('dv.markSeeLess')
                    : t('dv.markSeeAll').replace('{n}', String(forgotten.total))
                }
                onClick={forgotten.onToggleAll}
              >
                <i
                  className={forgotten.all ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">
                  {forgotten.all
                    ? t('dv.markSeeLess')
                    : t('dv.markSeeAll').replace('{n}', String(forgotten.total))}
                </span>
              </button>
            )}
          </span>
        </span>
      )}
    </div>
  );
}