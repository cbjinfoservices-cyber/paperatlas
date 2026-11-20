import { useEffect, useRef, useState } from 'react';

/**
 * Une phrase dite une seule fois par occasion.
 *
 * Une marque visible qui reparaît ne doit pas reparler : un lecteur d'écran
 * qui l'entend à chaque remontée de la liste croirait à une nouvelle à chaque
 * fois. La marque est donc muette, et c'est une zone de statut, présente mais
 * vide dès l'ouverture, qui porte la phrase — une fois, la première fois que
 * l'occasion se présente, puis rien ne bouge tant qu'elle dure. L'occasion
 * finie, la mémoire se vide : la suivante a de nouveau droit à sa phrase.
 *
 * Le ménage et la phrase se font dans le même souffle, dans cet ordre. L'ancien
 * découpage — un effet pour dire, un autre pour oublier — les faisait courir
 * l'un derrière l'autre : quand l'occasion changeait et s'ouvrait au même
 * rendu, l'oubli passait après la phrase et l'effaçait. Une confirmation
 * pouvait donc se perdre en silence, sans que rien ne le signale.
 *
 * @param active   L'occasion est-elle ouverte ?
 * @param text     Ce qu'il faut dire — déjà traduit.
 * @param occasion Ce qui identifie l'occasion : elle change, la mémoire se vide.
 */
export function useSpokenOnce(active: boolean, text: string, occasion: unknown): string {
  const [said, setSaid] = useState('');
  const occasionRef = useRef<unknown>(undefined);
  const saidRef = useRef(false);

  useEffect(() => {
    /* Une nouvelle occasion : d'abord l'oubli, ensuite la phrase. */
    if (!Object.is(occasionRef.current, occasion)) {
      occasionRef.current = occasion;
      saidRef.current = false;
      setSaid('');
    }
    if (!active || saidRef.current) return;
    saidRef.current = true;
    setSaid(text);
  }, [active, text, occasion]);

  return said;
}