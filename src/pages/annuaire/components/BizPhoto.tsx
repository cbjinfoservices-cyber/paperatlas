import type { Entreprise } from '@/mocks/entreprises';

type Props = {
  item: Pick<Entreprise, 'logoMark' | 'photos'>;
  alt: string;
  title?: string;
  className?: string;
};

/* Sans photo, la fiche montre ses initiales sur un fond neutre. */
export default function BizPhoto({ item, alt, title, className }: Props) {
  const photo = item.photos[0];
  if (photo) {
    return <img className={className} src={photo} alt={alt} title={title} width={1200} height={900} />;
  }
  return (
    <div className={`dir-placeholder${className ? ` ${className}` : ''}`} role="img" aria-label={alt} title={title}>
      <span aria-hidden="true">{item.logoMark}</span>
    </div>
  );
}
