import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { faconnerieHref, faconnageLabelKey } from '@/lib/faconnage';

type Props = {
  /** Combien d'ateliers de façonnage le périmètre lu contient vraiment. */
  count: number;
  /** La région retenue dans l'adresse, "" quand toutes se lisent. */
  region: string;
  /** Le pays retenu dans l'adresse, "" quand tous se lisent. */
  pays: string;
  /** L'annuaire est déjà ouvert sur le façonnage : la pastille s'accuse. */
  current: boolean;
};

/**
 * La pastille de façonnage du rang.
 *
 * Elle ne compte plus le réseau entier : elle lit la région et le pays de
 * l'adresse, comme le pied de page, et n'annonce donc que les ateliers que le
 * lecteur verra vraiment. Le lien garde le même périmètre, si bien que le
 * chiffre affiché est exactement celui qu'on retrouve en l'ouvrant. Quand il
 * n'y en a aucun, le trait passe en pointillés et le jeton s'éteint — la même
 * écriture que la puce de l'annuaire à zéro.
 */
export default function NavFacChip({ count, region, pays, current }: Props) {
  const { t } = useLang();
  const label = t(faconnageLabelKey(count));
  const hint = t('navm.faconActive');
  const cls = ['nav-fac', current ? 'is-current' : '', count === 0 ? 'is-zero' : ''];

  return (
    <Link
      to={faconnerieHref(region, pays)}
      className={cls.filter(Boolean).join(' ')}
      aria-current={current ? 'page' : undefined}
      aria-label={`${label} — ${count} ${hint}`}
      title={`${label} — ${count} ${hint}`}
    >
      <i className="ri-scissors-cut-line" aria-hidden="true"></i>
      <span>{label}</span>
      <span className="nav-fac-count">{count}</span>
    </Link>
  );
}