import { useCallback, useEffect, useState } from 'react';
import { isFacturation, type Facturation } from '@/pages/offres/components/plans';
import {
  abonnerFacturation,
  changerFacturation,
  facturationDuPlan,
} from '@/lib/facturation';

/**
 * The billing rhythm shared by every Premium figure on screen: the card on
 * « Offres », the tariff table's detail panel, the sign-up reminder. The last
 * choice is remembered like the country, so a reader who picked the year once
 * finds the year again on the next page — and on the next visit.
 *
 * A link that names its rhythm (`?facturation=annee`) is adopted: the address
 * wins the first time, then the memory follows the latest choice made.
 */
export function useFacturation(adresse?: string | null) {
  const [facturation, setFacturation] = useState<Facturation>(() =>
    isFacturation(adresse) ? adresse : facturationDuPlan(),
  );

  useEffect(() => abonnerFacturation(setFacturation), []);

  useEffect(() => {
    if (isFacturation(adresse)) changerFacturation(adresse);
  }, [adresse]);

  const choisir = useCallback((valeur: Facturation) => changerFacturation(valeur), []);

  return { facturation, choisir };
}