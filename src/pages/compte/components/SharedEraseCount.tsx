import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Combien de fois cette gomme a servi. */
  count: number;
  /** Le jour du dernier geste, déjà mis en forme ; vide s'il n'est pas connu. */
  day: string;
  /** L'instant exact du dernier geste : le survol en tire le nombre de jours
   *  pendant lesquels ce geste n'a plus servi. Absent, le compte s'en tait. */
  lastAt?: string;
  /** Ce que le dernier geste a effacé, famille de valeurs par famille : les
   *  annonces et les offres que la gomme a retirées du compte. */
  erased?: { annonce: number; offre: number } | null;
  /** La petite porte du compte : elle resserre la liste des dépôts sur les
   *  valeurs que cette gomme a effacées. Absente, le compte reste une simple
   *  trace — un compte sans rien à resserrer ne montre pas de porte. */
  onNarrow?: (() => void) | null;
  /** Ce que la porte resserrera, dit en clair au survol. */
  narrowTitle?: string;
  /** La porte de ce compte est-elle ouverte en ce moment ? Un second clic
   *  rend alors les filtres qu'elle avait effacés. */
  narrowActive?: boolean;
  /** Ce que le second clic rendra, dit en clair au survol. */
  narrowBackTitle?: string;
  /** Combien de fois la petite porte de cette gomme a déjà été ouverte : le
   *  compte se lit à côté de son usage et de son jour. */
  opens?: number;
  /** La classe du jeton : la même écriture pour toutes les gommes de la ligne. */
  className?: string;
};

/**
 * Le petit compte d'une gomme de la ligne : combien de fois elle a servi, le
 * jour du dernier geste, et ce que ce geste a effacé — famille de valeurs par
 * famille. Les quatre gommes le portent de la même façon pour qu'elles se
 * lisent d'un même geste, et le compte reste visible une fois la gomme
 * disparue : la trace du geste demeure. Sa petite porte, elle, resserre la
 * liste sur les valeurs que le geste a effacées.
 */
export default function SharedEraseCount({
  count, day, lastAt = '', erased = null, onNarrow = null, narrowTitle = '',
  narrowActive = false, narrowBackTitle = '', opens = 0,
  className = 'mine-rubrique-shared-erase-count',
}: Props) {
  const { t } = useLang();
  if (count <= 0) return null;

  /** Depuis combien de jours ce geste n'a plus servi : le survol du compte le
   *  dit, à côté de son usage et de son jour. Un geste du jour se dit
   *  autrement qu'un geste d'il y a trois semaines. */
  const quiet = (() => {
    const at = new Date(lastAt).getTime();
    if (!Number.isFinite(at) || at <= 0) return '';
    const days = Math.floor(Math.max(0, Date.now() - at) / 86400000);
    if (days < 1) return t('acct.mine.rubriqueSharedEraseQuietToday');
    return t('acct.mine.rubriqueSharedEraseQuiet').replace('{n}', String(days));
  })();

  const base = count > 1
    ? t('acct.mine.rubriqueSharedEraseCountHint')
      .replace('{n}', String(count))
      .replace('{day}', day)
    : t('acct.mine.rubriqueSharedEraseCountHintOne')
      .replace('{day}', day);
  const hint = quiet ? `${base} ${quiet}` : base;

  /** Ce que le dernier geste a effacé, en mots : les deux familles qui ont
   *  perdu des valeurs, et leur compte — celles qui n'ont rien perdu se
   *  taisent. */
  const parts = erased
    ? [
      erased.annonce > 0
        ? t('acct.mine.rubriqueSharedSide')
          .replace('{family}', t('acct.mine.rubriqueFamilyAnnonce'))
          .replace('{n}', String(erased.annonce))
        : '',
      erased.offre > 0
        ? t('acct.mine.rubriqueSharedSide')
          .replace('{family}', t('acct.mine.rubriqueFamilyOffre'))
          .replace('{n}', String(erased.offre))
        : '',
    ].filter(Boolean).join(' · ')
    : '';

  return (
    <>
      <span className={className} dir="auto" title={hint}>
        <i className="ri-eraser-line" aria-hidden="true"></i>
        {day
          ? t('acct.mine.rubriqueSharedEraseCountDay')
            .replace('{n}', String(count))
            .replace('{day}', day)
          : t('acct.mine.rubriqueSharedEraseCount')
            .replace('{n}', String(count))}
      </span>
      {/* Combien de fois la petite porte de cette gomme s’est ouverte, juste
          après son usage : le geste et la lecture qu’il a permis se lisent
          d’un même jeton. */}
      {opens > 0 && (
        <span
          className="mine-rubrique-shared-erase-opens"
          dir="auto"
          title={t('acct.mine.rubriqueSharedEraseOpensHint').replace('{n}', String(opens))}
        >
          <i className="ri-login-box-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedEraseOpens').replace('{n}', String(opens))}
        </span>
      )}
      {/* La petite porte du compte : elle resserre la liste sur les valeurs
          que cette gomme a effacées — un clic, et le geste se relit dans la
          liste plutôt que dans le seul compte. */}
      {onNarrow && (
        <button
          type="button"
          className={`mine-rubrique-shared-erase-door${narrowActive ? ' is-on' : ''}`}
          aria-pressed={narrowActive}
          onClick={onNarrow}
          title={narrowActive
            ? (narrowBackTitle || t('acct.mine.rubriqueSharedEraseDoorBack'))
            : (narrowTitle || t('acct.mine.rubriqueSharedEraseDoorHint'))}
          aria-label={narrowActive
            ? t('acct.mine.rubriqueSharedEraseDoorBack')
            : t('acct.mine.rubriqueSharedEraseDoor')}
        >
          <i
            className={narrowActive ? 'ri-arrow-go-back-line' : 'ri-filter-3-line'}
            aria-hidden="true"
          ></i>
        </button>
      )}
      {parts && (
        <span
          className="mine-rubrique-shared-erase-last"
          dir="auto"
          title={t('acct.mine.rubriqueSharedEraseLastHint').replace('{parts}', parts)}
        >
          <i className="ri-delete-back-2-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueSharedEraseLast').replace('{parts}', parts)}
        </span>
      )}
    </>
  );
}