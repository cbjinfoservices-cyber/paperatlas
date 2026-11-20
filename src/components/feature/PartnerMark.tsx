/**
 * La seconde marque du réseau : l'emblème « Arabe World », son lettrage arabe
 * et sa lecture latine — une seule source, pour que le pied de page et la page
 * qui la présente ne puissent jamais diverger.
 */
export const PARTNER_EMBLEM_SRC =
  'https://readdy.ai/api/search-image?query=Minimal%20flat%20emblem%20of%20a%20globe%20formed%20by%20interlocking%20Arabic%20geometric%20eight-point%20stars%2C%20fine%20warm%20orange%20line%20art%20on%20a%20plain%20cream%20background%2C%20centered%20round%20seal%2C%20no%20text%2C%20crisp%20editorial%20vector%20look%2C%20soft%20inner%20glow%2C%20branding%20mark&width=200&height=200&seq=arabe-world-emblem-01&orientation=squarish';

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