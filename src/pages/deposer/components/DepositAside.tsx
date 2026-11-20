import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

type Props = {
  kind: DepositKind;
};

/**
 * La colonne de droite suit l'onglet : les trois étapes parlent du dépôt
 * ouvert, et les deux portes du milieu mènent au tableau qui reçoit ce que
 * l'on vient de déposer.
 */
export default function DepositAside({ kind }: Props) {
  const { t } = useLang();
  const steps = kind === 'annonce'
    ? ['dep.ann.step1', 'dep.ann.step2', 'dep.ann.step3']
    : ['dep.off.step1', 'dep.off.step2', 'dep.off.step3'];

  return (
    <aside className="deposit-side">
      <section className="pro-card" data-reveal>
        <h2 className="pro-h">{t('dep.noteTitle')}</h2>
        <ol className="deposit-steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <p>{t(step)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pro-card" data-reveal>
        <h2 className="pro-h">{t('dep.browse')}</h2>
        <ul className="deposit-links">
          <li>
            <Link to="/annonces">
              <i className="ri-megaphone-line" aria-hidden="true"></i>
              <span>{t('nav.annonces')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </li>
          <li>
            <Link to="/emplois">
              <i className="ri-briefcase-line" aria-hidden="true"></i>
              <span>{t('nav.emplois')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </li>
          <li>
            <Link to="/compte">
              <i className="ri-file-list-3-line" aria-hidden="true"></i>
              <span>{t('acct.mine.title')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </li>
        </ul>
        <p className="pro-note">
          <i className="ri-shield-check-line" aria-hidden="true"></i>
          {t('dep.trust')}
        </p>
      </section>
    </aside>
  );
}