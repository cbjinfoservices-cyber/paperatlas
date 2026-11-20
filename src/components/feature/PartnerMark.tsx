/**
 * La seconde marque du réseau : l'emblème « Arabe World », son lettrage arabe
 * et sa lecture latine — une seule source, pour que le pied de page et la page
 * qui la présente ne puissent jamais diverger.
 */
export const PARTNER_EMBLEM_SRC =
  '/media/arabe-world.jpg';

type Props = {
  className?: string;
  /** Renseigné, l'emblème porte une description ; sinon il reste décoratif. */
  label?: string;
  /** Retire la ligne latine quand la place manque (barre étroite, pied de page serré). */
  hideLatin?: boolean;
};

export default function PartnerMark({ className = '', label, hideLatin = false }: Props) {
  return (
    <span className={['partner-mark', className].filter(Boolean).join(' ')}>
      <img
        className="partner-mark-img"
        src={PARTNER_EMBLEM_SRC}
        alt={label ?? ''}
        width={200}
        height={200}
        aria-hidden={label ? undefined : true}
      />
      <span className="partner-mark-txt">
        <b lang="ar" dir="rtl">العالم العربي</b>
        {!hideLatin && <small>Arabe World</small>}
      </span>
    </span>
  );
}