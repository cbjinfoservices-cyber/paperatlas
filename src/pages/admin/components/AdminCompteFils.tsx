import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { enSommeil, replyGapLabel } from '@/lib/messaging';
import AireCopyProfile from '@/components/feature/AireCopyProfile';
import type { AdminConversation } from './adminTypes';

type Props = {
  /** Les fils de ce compte, dormants ou actifs : la fiche peut les montrer
   *  tous, chaque ligne portant la porte vers le fil public. */
  fils: AdminConversation[];
  /** Le rythme de chaque fil, lu une fois pour toute la fiche. */
  paces: Record<string, number>;
  /** Ouvre le fil dans la messagerie de la console, panneau de droite. */
  onOpenThread: (conversationId: string) => void;
  /** Le nom du compte dont la fiche montre les fils : le geste de copie de
   *  l'aire le nomme, au lieu de parler d'un interlocuteur inconnu. */
  compteNom?: string;
  /** Le pays du compte, lu sur sa fiche : c'est lui qui donne son aire. Tant
   *  qu'il n'est pas renseigné, le geste se tait plutôt que d'inventer une
   *  aire. */
  comptePays?: string | null;
};

/**
 * Les fils d'un compte, en tête de sa fiche : d'abord ceux qui dorment, puis
 * — quand le jeton les appelle — les fils actifs.
 *
 * Deux gestes par fil, qui ne se volent pas le clic : la ligne ouvre le fil
 * dans la console, et la porte à côté l'ouvre tel que le compte le voit, dans
 * un autre onglet. La fiche reste en place derrière.
 *
 * Sous le nom, le geste de l'aire du compte : il copie, en deux lignes, l'aire
 * où ce compte se tient — ses pays et ses fiches —, sans ouvrir son dossier.
 */
export default function AdminCompteFils({
  fils, paces, onOpenThread, compteNom = '', comptePays = null,
}: Props) {
  const { t } = useLang();

  return (
    <ul className="admin-fiche-fils">
      {fils.map((row) => {
        const nom = [row.nom_a, row.nom_b].filter(Boolean).join(' ↔ ') || row.sujet || '—';
        const dort = enSommeil(paces[row.id]);
        return (
          <li
            className="admin-fiche-fil-item"
            key={row.id}
            data-dormant={dort ? 'yes' : 'no'}
          >
            <div className="admin-fiche-fil-line">
              <button
                type="button"
                className="admin-fiche-fil"
                data-dormant={dort ? 'yes' : 'no'}
                title={t('ad.f.sleepOpen')}
                aria-label={`${t('ad.f.sleepOpen')} · ${nom}`}
                onClick={() => onOpenThread(row.id)}
              >
                <i
                  className={dort ? 'ri-moon-line' : 'ri-chat-3-line'}
                  aria-hidden="true"
                ></i>
                <span className="admin-fiche-fil-main">
                  <b>{nom}</b>
                  {row.sujet && <em>{row.sujet}</em>}
                </span>
                <span
                  className="admin-fiche-fil-pace"
                  data-dormant={dort ? 'yes' : 'no'}
                >
                  {replyGapLabel(paces[row.id] ?? null, t)}
                </span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </button>
              {/* La même porte que la messagerie : le fil tel que le compte le
                  voit, dans un autre onglet. */}
              <Link
                to={`/messages?c=${row.id}`}
                target="_blank"
                rel="noreferrer"
                className="admin-fiche-fil-open"
                title={`${t('ad.f.sleepOpenPublicHint')} · /messages?c=${row.id}`}
              >
                <i className="ri-external-link-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ad.f.sleepOpenPublic')}</span>
              </Link>
            </div>
            {/* L'aire du compte, sous le nom, avec le geste qui la copie : la
                fiche situe le compte dans le monde arabe sans ouvrir sa fiche
                publique. Un compte sans pays n'affiche rien. */}
            {comptePays ? (
              <AireCopyProfile
                pays={comptePays}
                nom={compteNom || nom}
                kind="compte"
                className="admin-fiche-fil-aire"
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}