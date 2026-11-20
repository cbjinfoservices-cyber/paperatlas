import { Link } from 'react-router-dom';
import BrandSeal from '@/components/feature/BrandSeal';

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
          src="https://readdy.ai/api/search-image?query=Minimal%20flat%20emblem%20of%20a%20globe%20formed%20by%20interlocking%20Arabic%20geometric%20eight-point%20stars%2C%20fine%20warm%20orange%20line%20art%20on%20a%20plain%20cream%20background%2C%20centered%20round%20seal%2C%20no%20text%2C%20crisp%20editorial%20vector%20look%2C%20soft%20inner%20glow%2C%20branding%20mark&width=200&height=200&seq=arabe-world-emblem-01&orientation=squarish"
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