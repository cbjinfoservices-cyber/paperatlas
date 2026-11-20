import { Link } from 'react-router-dom';
import BrandSeal from '@/components/feature/BrandSeal';
import { PARTNER_EMBLEM_SRC } from '@/components/feature/PartnerMark';

/**
 * Le nom du site et, à côté, la seconde marque du réseau : le cachet de
 * PaperAtlas, son nom, puis l'emblème « Arabe World » avec son lettrage arabe.
 *
 * Le couple se lit sur toutes les pages du site — l'accueil comme les pages
 * intérieures : la barre nomme les deux marques partout, au même endroit.
 */
export default function NavLogo() {
  return (
    <Link to="/" className="nav-logo">
      <BrandSeal className="nav-logo-mark" />
      <span className="nav-logo-txt">PaperAtlas</span>
      <span className="nav-logo-partner">
        <img
          className="nav-logo-partner-mark"
          src={PARTNER_EMBLEM_SRC}
          alt="Arabe World"
          width={200}
          height={200}
        />
        <span className="nav-logo-partner-txt">
          <b lang="ar" dir="rtl">العالم العربي</b>
          <small>Arabe World</small>
        </span>
      </span>
    </Link>
  );
}