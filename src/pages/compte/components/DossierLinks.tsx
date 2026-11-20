import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';

/** Une porte de l'espace compte : son adresse, son icône et son libellé. */
export type DossierDoor = { to: string; icon: string; label: string };

type Props = {
  doors: DossierDoor[];
};

/**
 * La liste des dossiers de l'espace compte, pilotée comme les autres listes du
 * site : les flèches haut et bas mettent une porte en avant (le geste boucle
 * d'un bout à l'autre), Entrée ouvre celle qui est mise en avant, Échap rend la
 * liste au repos. Le lien garde son adresse : un clic reste un vrai lien.
 */
export default function DossierLinks({ doors }: Props) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [keyed, setKeyed] = useState(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const doorsKey = doors.map((door) => door.to).join(',');

  /* Une porte qui disparaît ne garde pas sa mise en avant. */
  useEffect(() => {
    setKeyed(-1);
  }, [doorsKey]);

  /* La porte mise en avant reste sous les yeux : la liste défile juste assez
     pour la garder dans le cadre. */
  useEffect(() => {
    if (keyed < 0) return;
    listRef.current?.querySelector('li.is-keyed a')?.scrollIntoView({ block: 'nearest' });
  }, [keyed]);

  const onKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (doors.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setKeyed((current) => {
        if (event.key === 'ArrowDown') return current < doors.length - 1 ? current + 1 : 0;
        return current > 0 ? current - 1 : doors.length - 1;
      });
      return;
    }
    if (event.key === 'Escape') {
      setKeyed(-1);
      return;
    }
    if (event.key !== 'Enter') return;
    /* Un lien déjà pris au clavier s'ouvre de lui-même : on ne l'ouvre pas
       deux fois ni à la place d'un autre. */
    const target = event.target as HTMLElement | null;
    if (target?.closest('a')) return;
    const chosen = doors[keyed];
    if (!chosen) return;
    event.preventDefault();
    navigate(chosen.to);
  };

  return (
    <>
      <ul
        className="deposit-links"
        ref={listRef}
        tabIndex={0}
        aria-label={t('acct.dossiers')}
        onKeyDown={onKey}
      >
        {doors.map((door, i) => (
          <li
            key={door.to}
            className={i === keyed ? 'is-keyed' : undefined}
            aria-current={i === keyed ? 'true' : undefined}
          >
            <Link to={door.to}>
              <i className={door.icon} aria-hidden="true"></i>
              <span>{door.label}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </li>
        ))}
      </ul>

      {doors.length > 1 && (
        <p className="doss-keyhint deposit-keyhint">
          <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
          {t('acct.dossiersKey')}
        </p>
      )}
    </>
  );
}