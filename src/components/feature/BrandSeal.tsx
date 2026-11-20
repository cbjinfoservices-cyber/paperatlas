/**
 * La marque du site, une seule source.
 *
 * Le même cachet d'imprimeur — anneau et livre ouvert à l'orange exact de la
 * marque, sans étoile pour rester lisible tout petit — sert d'icône d'onglet,
 * de repère dans la barre, de sceau dans le pied de page, d'en-tête des pages
 * de connexion et de marque dans la console d'administration.
 */
export const BRAND_SEAL_SRC = '/media/logo.jpg';

type Props = {
  className?: string;
  /** Renseigné, le sceau devient une image décrite ; sinon il reste décoratif. */
  label?: string;
};

export default function BrandSeal({ className = '', label }: Props) {
  return (
    <img
      className={className}
      src={BRAND_SEAL_SRC}
      alt={label ?? ''}
      width={512}
      height={512}
      aria-hidden={label ? undefined : true}
    />
  );
}