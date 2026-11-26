import type { Entreprise, Trade } from '@/mocks/entreprises';

type Props = {
  item: Pick<Entreprise, 'logoMark' | 'photos'> & Partial<Pick<Entreprise, 'trade'>>;
  alt: string;
  title?: string;
  className?: string;
};

const IMAGE_GENERIQUE = '/media/panel-contact.jpg';

/* Visuel de repli selon le métier, quand la fiche n'a pas de photo. */
const IMAGE_PAR_METIER: Partial<Record<Trade, string>> = {
  librairie: '/media/panel-library.jpg',
  faconnage: '/media/panel-bindery.jpg',
};

export default function BizPhoto({ item, alt, title, className }: Props) {
  const src = item.photos[0] ?? (item.trade && IMAGE_PAR_METIER[item.trade]) ?? IMAGE_GENERIQUE;
  return <img className={className} src={src} alt={alt} title={title} width={1200} height={900} />;
}
