import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  offreId: string;
  count: number;
  /** Celles qu'aucune réponse n'a encore ouvertes : elles attendent un geste. */
  unread?: number;
  /** Le délai moyen de première réponse, en millisecondes (0 : rien à dire). */
  replyAvg?: number;
  /** Sur combien de candidatures ce délai a été mesuré. */
  replySeen?: number;
  /** Une offre encore en relecture n'a pas de fiche à ouvrir. */
  published: boolean;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Le compte des candidatures reçues sur une offre, posé sous ses métadonnées.
 * Quand l'offre est en ligne, le jeton est la porte de sa fiche publiée ; sinon
 * il reste un simple relevé, et le survol dit pourquoi la porte manque.
 *
 * Les candidatures non lues se lisent à part : un second jeton d'accent dit
 * combien attendent une réponse, et c'est lui qui porte la porte de
 * « Mes candidatures » déjà resserré sur cette offre — on arrive sur les
 * dossiers, pas sur un tableau entier à filtrer soi-même.
 *
 * Un troisième jeton, plus calme, donne le temps que l'offre met en moyenne à
 * répondre la première fois : le silence se mesure au lieu de se deviner.
 */
export default function OffreCandidatureChip({
  offreId,
  count,
  unread = 0,
  replyAvg = 0,
  replySeen = 0,
  published,
}: Props) {
  const { t } = useLang();
  const label = count === 1 ? t('acct.mine.candOne') : t('acct.mine.candMany');
  const unreadLabel = unread === 1 ? t('acct.mine.candUnreadOne') : t('acct.mine.candUnreadMany');

  /** Le délai en mots simples : jours, heures, ou moins d'une heure. */
  const delay = (elapsed: number) => {
    if (elapsed < HOUR) return t('acct.mine.lessHour');
    const days = Math.floor(elapsed / DAY);
    if (days >= 1) return `${days} ${t(days > 1 ? 'acct.mine.dayMany' : 'acct.mine.dayOne')}`;
    const hours = Math.max(1, Math.floor(elapsed / HOUR));
    return `${hours} ${t(hours > 1 ? 'acct.mine.hourMany' : 'acct.mine.hourOne')}`;
  };

  const body = (
    <>
      <i className="ri-user-follow-line" aria-hidden="true"></i>
      <b dir="ltr">{count}</b>
      <span>{label}</span>
      {published && <i className="ri-arrow-right-line mine-cand-door" aria-hidden="true"></i>}
    </>
  );

  return (
    <>
      {published ? (
        <Link
          className="mine-cand"
          to={`/emplois/${offreId}`}
          title={t('acct.mine.candHint')}
        >
          {body}
        </Link>
      ) : (
        <span className="mine-cand is-idle" title={t('acct.mine.candHintOff')}>
          {body}
        </span>
      )}

      {unread > 0 && (
        <Link
          className="mine-cand-unread"
          to={`/compte?atab=received&offre=${encodeURIComponent(offreId)}#mes-candidatures`}
          title={t('acct.mine.candUnreadDoor')}
        >
          <i className="ri-mail-unread-line" aria-hidden="true"></i>
          <b dir="ltr">{unread}</b>
          <span>{unreadLabel}</span>
          <i className="ri-arrow-right-line mine-cand-door" aria-hidden="true"></i>
        </Link>
      )}

      {replyAvg > 0 && (
        <span
          className="mine-cand-reply"
          title={t('acct.mine.candReplyHint').replace('{n}', String(replySeen))}
        >
          <i className="ri-timer-flash-line" aria-hidden="true"></i>
          <span className="mine-cand-reply-label">{t('acct.mine.candReply')}</span>
          <b dir="ltr">{delay(replyAvg)}</b>
        </span>
      )}
    </>
  );
}