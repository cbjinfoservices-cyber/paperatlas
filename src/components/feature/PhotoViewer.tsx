import { useEffect } from 'react';

export type ViewerPhoto = {
  src: string;
  alt: string;
  /** Le nom porté sous l'image, en tête de la légende. */
  title: string;
  /** Le lieu ou la précision qui suit le nom. */
  caption?: string;
};

type Props = {
  photos: ViewerPhoto[];
  index: number;
  /** Ce que montre la série, lu par les lecteurs d'écran. */
  label: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
  onClose: () => void;
  onIndex: (next: number) => void;
};

/**
 * L'aperçu plein écran, écrit une seule fois : la galerie d'un atelier, les
 * photos d'une annonce et celles d'un profil de plume s'ouvrent toutes ici.
 * Même fond sombre, mêmes flèches, même compteur « 2 / 4 », mêmes touches :
 * Échap referme, les flèches tournent, et la page ne défile plus derrière.
 */
export default function PhotoViewer({
  photos,
  index,
  label,
  closeLabel,
  prevLabel,
  nextLabel,
  onClose,
  onIndex,
}: Props) {
  const total = photos.length;
  const current = photos[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && total > 1) onIndex((index + 1) % total);
      if (event.key === 'ArrowLeft' && total > 1) onIndex((index - 1 + total) % total);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [index, total, onClose, onIndex]);

  if (!current) return null;

  return (
    <div
      className="gallery-fs"
      role="dialog"
      aria-modal="true"
      aria-label={`${label} — ${current.title}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="gallery-fs-x"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <i className="ri-close-line" aria-hidden="true"></i>
      </button>

      <figure className="gallery-fs-fig" onClick={(event) => event.stopPropagation()}>
        <img src={current.src} alt={current.alt} title={current.title} />
        <figcaption className="gallery-fs-cap">
          <span className="gallery-fs-name">{current.title}</span>
          {current.caption && <span className="gallery-fs-where">{current.caption}</span>}
        </figcaption>
      </figure>

      {total > 1 && (
        <>
          <button
            type="button"
            className="gallery-fs-nav is-prev"
            onClick={(event) => {
              event.stopPropagation();
              onIndex((index - 1 + total) % total);
            }}
            aria-label={prevLabel}
          >
            <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="gallery-fs-nav is-next"
            onClick={(event) => {
              event.stopPropagation();
              onIndex((index + 1) % total);
            }}
            aria-label={nextLabel}
          >
            <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
          </button>
          <p className="gallery-fs-count" aria-live="polite">
            <span className="gallery-fs-count-cur">{index + 1}</span>
            <span className="gallery-fs-count-sep" aria-hidden="true">/</span>
            <span>{total}</span>
          </p>
        </>
      )}
    </div>
  );
}