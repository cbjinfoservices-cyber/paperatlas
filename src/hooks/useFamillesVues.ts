import { useEffect, useState } from 'react';
import { FAMILLES_EVENT, readFamillesVues } from '@/lib/familyMemory';

/**
 * Les familles ouvertes depuis cet appareil, relues à chaque geste.
 *
 * Le crochet écoute la mémoire elle-même : la bande des familles et la carte
 * du monde vivent sur la même page, et le compteur de l'en-tête doit suivre
 * une porte pressée plus bas sans attendre un rechargement. L'écoute du
 * stockage couvre les autres onglets du même site.
 */
export function useFamillesVues(): string[] {
  const [vues, setVues] = useState<string[]>([]);

  useEffect(() => {
    const relire = () => setVues(readFamillesVues());
    relire();
    window.addEventListener(FAMILLES_EVENT, relire);
    window.addEventListener('storage', relire);
    return () => {
      window.removeEventListener(FAMILLES_EVENT, relire);
      window.removeEventListener('storage', relire);
    };
  }, []);

  return vues;
}