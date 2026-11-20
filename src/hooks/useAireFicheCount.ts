import { useEffect, useState } from 'react';
import {
  TOURS_EVENT,
  readAireCartePays,
  readAireCartesAires,
  readAireCartesAiresAts,
  readAireFicheCopies,
  type AiresCompletesCopiees,
} from '@/lib/aireCarteMemory';
import type { RegionMondeKey } from '@/lib/worldRegions';

const AUCUN: AiresCompletesCopiees = { count: 0, last: null };

/**
 * Le compte des copies d’une aire, lu sur l’appareil : la fiche et les cartes
 * de l’annuaire lisent la même mémoire, si bien qu’une copie faite d’un côté
 * avance le chiffre de l’autre sans recharger la page.
 */
export default function useAireFicheCount(aire: RegionMondeKey | '') {
  const [compte, setCompte] = useState<AiresCompletesCopiees>(AUCUN);
  /* Les pays de l’aire déjà partis d’une carte : le survol du compte les
     nomme, pour vérifier ce qui a quitté l’appareil. */
  const [cartesPays, setCartesPays] = useState<string[]>([]);
  /* Les aires distinctes déjà parties d’une carte : le survol les dénombre
     et les nomme, au lieu de ne compter que les pays. */
  const [cartesAires, setCartesAires] = useState<RegionMondeKey[]>([]);
  /* Le jour de la dernière copie de chacune de ces aires : le survol les
     nomme une à une avec leur date, pour savoir quand elles sont parties. */
  const [cartesAiresAts, setCartesAiresAts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCompte(readAireFicheCopies(aire));
    setCartesPays(readAireCartePays(aire));
    setCartesAires(readAireCartesAires());
    setCartesAiresAts(readAireCartesAiresAts());
    /* Le compte se relit quand un geste part — d’ici ou d’une autre fiche de
       la même aire —, sans recharger la page. */
    const relire = () => {
      setCompte(readAireFicheCopies(aire));
      setCartesPays(readAireCartePays(aire));
      setCartesAires(readAireCartesAires());
      setCartesAiresAts(readAireCartesAiresAts());
    };
    window.addEventListener(TOURS_EVENT, relire);
    return () => window.removeEventListener(TOURS_EVENT, relire);
  }, [aire]);

  return { compte, setCompte, cartesPays, cartesAires, cartesAiresAts };
}