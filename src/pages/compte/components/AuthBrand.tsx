/**
 * Le cachet, en tête des pages de connexion et d'inscription : le sceau, puis
 * le nom juste en dessous — la même marque que la barre et le pied de page.
 */
import BrandSeal from '@/components/feature/BrandSeal';
import '@/styles/brand.css';

export default function AuthBrand() {
  return (
    <div className="auth-brand">
      <BrandSeal className="auth-brand-seal" />
      <span className="auth-brand-name">PaperAtlas</span>
    </div>
  );
}