import { useEffect, useState } from 'react';

/**
 * Un mot dit une seule fois par occasion — même si la surface se remonte.
 *
 * Le repère de fin de liste et les confirmations du chapitre vivent dans la
 * surface qui les porte : elle se referme, se rouvre, et la mémoire de
 * `useSpokenOnce` repart de zéro, ce qui est juste pour eux — chaque ouverture
 * a droit à sa phrase.
 *
 * Le rappel B2B, lui, ne change pas d'occasion en s'ouvrant : c'est la demande
 * qui attend qui est l'occasion. Rouverte depuis la feuille après l'avoir été
 * depuis le panneau, la même attente ne doit pas se dire deux fois. La mémoire
 * est donc tenue hors du composant, par une clé qui nomme l'occasion — le
 * compte des demandes en retard et la plus ancienne d'entre elles, ou l'heure
 * à laquelle la sourdine a été demandée.
 *
 * La clé change, l'occasion est neuve, la phrase se dit de nouveau : une
 * demande de plus qui prend du retard, une sourdine levée puis redemandée.
 *
 * @param key  Ce qui identifie l'occasion — vide quand il n'y a rien à dire.
 * @param text La phrase, déjà traduite et accordée.
 */
const saidKeys = new Set<string>();

export function useSpokenMark(key: string, text: string): string {
  const [said, setSaid] = useState('');

  useEffect(() => {
    if (!key) {
      setSaid('');
      return;
    }
    if (saidKeys.has(key)) {
      setSaid('');
      return;
    }
    saidKeys.add(key);
    setSaid(text);
  }, [key, text]);

  return said;
}

/** Une occasion qui recommence vraiment : la phrase retrouve sa place. */
export function forgetSpokenMark(key: string): void {
  saidKeys.delete(key);
}