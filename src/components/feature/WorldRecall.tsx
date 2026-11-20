import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { PARTNER_EMBLEM_SRC } from '@/components/feature/PartnerMark';

type Props = {
  /** Le type dont la porte a été franchie, déjà traduit. Renseigné, la ligne
      dit d'où l'on arrive et par quelle page ; sinon elle nomme seulement la
      marque. */
  typeLabel?: string;
  /** La phrase du tableau qui reçoit le rappel — annonces, emplois — quand il
      n'y a pas de type à nommer. */
  subject?: string;
  /** La famille d'Arabe World dont la visite est partie, déjà traduite, et
      l'adresse de sa carte (`/arabe-world#fam-impression`). Renseignées, la
      ligne ne renvoie plus seulement à la page : elle renvoie à la famille. */
  familyLabel?: string;
  familyTo?: string;
};

/**
 * Le rappel de passage posé sur un tableau quand la visite vient d'Arabe World.
 *
 * Les portes de la page Arabe World ouvrent chacune une autre page : le
 * lecteur change d'écran sans s'en apercevoir. Cette ligne le lui dit, une
 * seule fois, avec le chemin du retour et la main pour l'effacer — un rappel,
 * jamais un bandeau qui reste.
 */
export default function WorldRecall({
  typeLabel = '',
  subject = '',
  familyLabel = '',
  familyTo = '',
}: Props) {
  const { t } = useLang();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  /* La phrase reçue l'emporte : un tableau n'a pas de type à nommer, et
     « Annonces · Deux marques, un même atelier » ne voudrait rien dire. */
  const line = subject || (typeLabel ? `${typeLabel} · ${t('world.viaText')}` : t('world.viaText'));
  const familyText = familyLabel
    ? t('world.backToFamily').replace('{family}', familyLabel)
    : '';

  return (
    <div className="dir-via">
      <img
        className="dir-via-emblem"
        src={PARTNER_EMBLEM_SRC}
        alt=""
        width={120}
        height={120}
        aria-hidden="true"
      />
      <span className="dir-via-txt">
        <span className="dir-via-lab">{t('world.viaLabel')}</span>
        <span className="dir-via-sub">{line}</span>
      </span>
      <span className="dir-via-acts">
        {/* Le retour nommé : non pas « la page », mais la famille précise d'où
            la visite est partie — sa carte, sur la page Arabe World. */}
        {familyTo && familyText && (
          <Link className="dir-via-fam" to={familyTo} title={familyText}>
            <i className="ri-corner-up-left-line" aria-hidden="true"></i>
            <span>{familyText}</span>
          </Link>
        )}
        <Link className="dir-via-link" to="/arabe-world">
          {t('world.viaLink')}
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </Link>
      </span>
      <button
        type="button"
        className="dir-via-x"
        onClick={() => setHidden(true)}
        aria-label={t('world.viaClose')}
        title={t('world.viaClose')}
      >
        <i className="ri-close-line" aria-hidden="true"></i>
      </button>
    </div>
  );
}