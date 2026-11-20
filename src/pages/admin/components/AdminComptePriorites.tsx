import CopyTextButton from '@/components/feature/CopyTextButton';
import { useLang } from '@/i18n/LangProvider';
import AdminCompteFils from './AdminCompteFils';
import { nombre, type AdminConversation } from './adminTypes';

type Props = {
  /** Les fils affichés : ceux qui dorment seuls, ou tous quand le jeton les
   *  appelle — les actifs compris. */
  fils: AdminConversation[];
  /** Le nombre de fils en sommeil, même quand la liste est ouverte à tous. */
  dormants: number;
  /** Tous les fils du compte, actifs compris : le chiffre du jeton. */
  total: number;
  /** Le rythme de chaque fil, lu une fois pour toute la fiche. */
  paces: Record<string, number>;
  /** Faux tant que les rythmes ne sont pas revenus : la liste attend. */
  pacesReady: boolean;
  /** Les dépôts qui attendent une réponse depuis plus de sept jours. */
  relecturesLongues: number;
  /** Vrai quand la liste s'ouvre aux fils actifs. */
  tousFils: boolean;
  onToggleTousFils: () => void;
  onOpenThread: (conversationId: string) => void;
  /** Le récapitulatif de la fiche, copié d'un clic. */
  buildPriorites: () => string;
  /** Le nom du compte dont la fiche montre les fils : le geste de l'aire le
   *  nomme au lieu de parler d'un interlocuteur inconnu. */
  compteNom?: string;
  /** Le pays du compte, lu sur sa fiche : il donne son aire. */
  comptePays?: string | null;
};

/**
 * Les priorités d'un compte : ses fils qui dorment, le nombre de ses dépôts en
 * relecture longue, et la porte qui ouvre la liste à tous ses fils.
 *
 * Le bloc ne refait aucun calcul : il reçoit les fils déjà triés par la fiche
 * — les plus lents devant — et se contente de les nommer, avec la mesure de
 * leur délai de réponse.
 */
export default function AdminComptePriorites({
  fils,
  dormants,
  total,
  paces,
  pacesReady,
  relecturesLongues,
  tousFils,
  onToggleTousFils,
  onOpenThread,
  buildPriorites,
  compteNom = '',
  comptePays = null,
}: Props) {
  const { t } = useLang();
  /* Les fils qui répondent en moins d'un jour : le complément des dormants,
     lu sur la même mesure — la fiche n'ouvre rien pour les compter. */
  const actifs = Math.max(total - dormants, 0);

  return (
    <section className="admin-sheet-block">
      <div className="admin-sheet-block-head">
        <p className="admin-stamp">{t('ad.f.priorites')}</p>
        <div className="admin-counts">
          {dormants > 0 && (
            <span className="admin-badge" data-tone="warn" title={t('ad.f.sleepThreadsHint')}>
              <i className="ri-moon-line" aria-hidden="true"></i>
              {dormants} {t('ad.f.sleepThreads')}
            </span>
          )}
          {/* L'autre côté du même compte, à côté des dormants : les deux
              chiffres se lisent d'un coup d'œil, sans ouvrir la liste. */}
          {pacesReady && total > 0 && (
            <span
              className="admin-badge"
              data-tone={actifs > 0 ? 'ok' : 'off'}
              title={t('ad.f.actifsThreadsHint')}
            >
              <i className="ri-chat-3-line" aria-hidden="true"></i>
              {actifs} {t('ad.f.actifsThreads')}
            </span>
          )}
          {relecturesLongues > 0 && (
            <span className="admin-badge" data-tone="warn" title={t('ad.f.lateLinkHint')}>
              <i className="ri-timer-flash-line" aria-hidden="true"></i>
              {nombre(relecturesLongues)} {t('ad.f.prioLateShort')}
            </span>
          )}
          <CopyTextButton
            build={buildPriorites}
            label={t('ad.f.prioCopy')}
            hint={t('ad.f.prioCopyHint')}
            className="admin-chip"
          />
          {/* La liste des fils s'ouvre à tous ceux du compte, actifs compris :
              la porte du fil public se lit alors ligne à ligne, sans avoir à
              passer par la messagerie. */}
          {total > 0 ? (
            <button
              type="button"
              className="admin-chip"
              data-on={tousFils ? 'yes' : 'no'}
              aria-pressed={tousFils}
              title={
                tousFils ? t('ad.f.allThreadsExitHint') : t('ad.f.allThreadsHint')
              }
              onClick={onToggleTousFils}
            >
              <i
                className={tousFils ? 'ri-moon-line' : 'ri-chat-3-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">
                {tousFils ? t('ad.f.allThreadsOff') : t('ad.f.allThreads')}
              </span>
              <b>{total}</b>
            </button>
          ) : null}
        </div>
      </div>
      {fils.length === 0 ? (
        <p className="admin-empty">
          <i
            className={pacesReady ? 'ri-moon-line' : 'ri-loader-4-line is-spin'}
            aria-hidden="true"
          ></i>
          {pacesReady ? t('ad.f.sleepThreadsNone') : t('ad.f.loading')}
        </p>
      ) : !pacesReady ? (
        <p className="admin-empty">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('ad.f.loading')}
        </p>
      ) : (
        <AdminCompteFils
          fils={fils}
          paces={paces}
          onOpenThread={onOpenThread}
          compteNom={compteNom}
          comptePays={comptePays}
        />
      )}
    </section>
  );
}