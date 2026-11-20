import { useCallback, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import PhotoViewer from '@/components/feature/PhotoViewer';

type Props = {
  photos: string[];
  /** Le nom porté sur les photos : l'atelier, le vendeur ou la plume. */
  nom: string;
  /** Le lieu ou la précision qui accompagne le nom. */
  wilaya: string;
  /** Ce que montre la galerie, lu par les lecteurs d'écran. */
  label: string;
  /** Le petit format : une photo à la fois dans une carte étroite (un
      établissement voisin), avec le compteur toujours lisible. */
  compact?: boolean;
};

/**
 * La galerie d'une fiche. Sur ordinateur c'est une planche de photos ; sur
 * téléphone une bande qui défile d'une image à l'autre, et le compteur
 * « 1 / 4 » sous la bande dit combien de photos attendent encore, au lieu de
 * laisser croire qu'il n'y en a qu'une.
 * Un clic sur une photo l'ouvre en grand, avec le même compteur et les deux
 * flèches : on peut faire le tour sans perdre la fiche.
 */
export default function PhotoGallery({ photos, nom, wilaya, label, compact = false }: Props) {
  const { t } = useLang();
  const railRef = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const total = photos.length;

  /* La photo lue est celle qui occupe le bord de départ de la bande. Le pas
     est mesuré sur la première figure plutôt que supposé : il suit la largeur
     réelle de la colonne et l'écart entre deux photos. */
  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail || total < 2) return;
    const first = rail.querySelector('figure');
    if (!first) return;
    const step = first.getBoundingClientRect().width + 10;
    if (step <= 0) return;
    const index = Math.round(Math.abs(rail.scrollLeft) / step);
    setActif(Math.min(Math.max(index, 0), total - 1));
  }, [total]);

  const fermer = useCallback(() => setZoomed(null), []);
  const aller = useCallback((next: number) => setZoomed(next), []);

  return (
    <div className={`gallery-wrap${compact ? ' is-compact' : ''}`}>
      <div
        className={`gallery${total === 2 ? ' gallery-duo' : ''}`}
        ref={railRef}
        onScroll={onScroll}
        role="group"
        aria-label={label}
      >
        {photos.map((p, i) => (
          <figure key={p}>
            <button
              type="button"
              className="gallery-open"
              onClick={() => setZoomed(i)}
              aria-label={`${t('pro.galleryOpen')} · ${nom} · ${i + 1} / ${total}`}
            >
              <img
                src={p}
                alt={`${nom} · ${wilaya} · ${i + 1}`}
                title={`${nom} ${wilaya}`}
                width={1200}
                height={900}
              />
            </button>
          </figure>
        ))}
      </div>

      {total > 1 && (
        <p className="gallery-count" aria-live="polite">
          <span className="gallery-count-cur">{actif + 1}</span>
          <span className="gallery-count-sep" aria-hidden="true">/</span>
          <span className="gallery-count-tot">{total}</span>
        </p>
      )}

      {zoomed !== null && (
        <PhotoViewer
          photos={photos.map((p, i) => ({
            src: p,
            alt: `${nom} · ${wilaya} · ${i + 1}`,
            title: nom,
            caption: wilaya,
          }))}
          index={zoomed}
          label={label}
          closeLabel={t('pro.galleryClose')}
          prevLabel={t('pro.galleryPrev')}
          nextLabel={t('pro.galleryNext')}
          onClose={fermer}
          onIndex={aller}
        />
      )}
    </div>
  );
}