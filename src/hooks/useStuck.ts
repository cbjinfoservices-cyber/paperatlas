import { useEffect, useRef, useState } from 'react';

/** L'écart sous la navigation, le même que celui donné à la pile en CSS. */
const offset = (): number => (
  typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches ? 62 : 70
);

/**
 * Dit si l'élément est réellement accroché en haut de l'écran, et non s'il est
 * encore à sa place dans le flux. La barre ne porte son ombre que dans le
 * premier cas : au repos, elle ne projette rien sur les fiches.
 *
 * La lecture est faite sur une image d'animation, jamais à chaque événement de
 * défilement : le défilement reste fluide même sur un long tableau.
 */
export function useStuck() {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let frame = 0;

    const read = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      /* Sur téléphone, la pile se dissout (`display: contents`) pour que les
         pastilles repassent dans le flux : elle n'a alors plus de boîte, et
         c'est la barre de recherche, elle seule accrochée, qui porte l'ombre. */
      const dissolved = box.width === 0 && box.height === 0;
      const probe = dissolved
        ? (node.querySelector('.filters, .board-filters') as HTMLElement | null)
        : node;
      const top = (probe ?? node).getBoundingClientRect().top;
      setStuck(top <= offset() + 1);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, stuck };
}