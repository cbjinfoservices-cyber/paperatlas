import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { restePoseFichier } from '@/pages/admin/components/adminPariteCore';

type Props = {
  /** Le fichier de textes que l'écran traverse. */
  fichier: string;
  /** Les familles de clés qui concernent vraiment cet écran. */
  prefixes?: string[];
  className?: string;
  /** L'adresse du relevé de parité, déjà resserré sur ce fichier : donné, le
   *  repère devient une porte plutôt qu'une mesure morte. */
  vers?: string;
};

/**
 * Le repère de pose d'un écran : combien de ses traductions restent à poser,
 * lu sur les dictionnaires que le site embarque — donc sur ce que le site
 * affiche vraiment, pas sur un fichier de travail qui pourrait diverger.
 *
 * Il ne s'affiche que s'il reste quelque chose : un écran complet n'a rien à
 * dire, et un repère permanent deviendrait du bruit. Son survol nomme le
 * fichier et la mesure, pour que le chiffre se lisse sans ouvrir la console.
 *
 * Quand un lien lui est donné, la pastille s'ouvre d'un clic sur le relevé de
 * parité déjà resserré sur son fichier : le chiffre ne reste plus une constat,
 * il mène au travail.
 */
export default function PoseRestante({
  fichier,
  prefixes = [],
  className = '',
  vers,
}: Props) {
  const { t } = useLang();
  const reste = restePoseFichier(fichier, prefixes);
  if (!reste || reste.reste === 0) return null;

  const hint = t('parPose.hint')
    .replace('{n}', String(reste.reste))
    .replace('{fichier}', fichier)
    .replace('{cles}', String(reste.reference));
  const ouvert = vers ? `${hint} ${t('parPose.open')}` : hint;

  const contenu = (
    <>
      <i className="ri-translate-2" aria-hidden="true"></i>
      <span>{t('parPose.badge').replace('{n}', String(reste.reste))}</span>
    </>
  );

  if (vers) {
    return (
      <Link
        to={vers}
        className={`pose-reste pose-reste--lien ${className}`.trim()}
        title={ouvert}
        aria-label={ouvert}
      >
        {contenu}
        <i className="ri-arrow-right-up-line pose-reste-go" aria-hidden="true"></i>
      </Link>
    );
  }

  return (
    <p className={`pose-reste ${className}`.trim()} title={hint} aria-label={hint}>
      {contenu}
    </p>
  );
}