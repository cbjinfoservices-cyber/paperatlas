import { useEffect, useState } from 'react';
import { DEPOT_BROUILLON_EVENT, readBrouillon } from '@/lib/depotBrouillon';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

export type DraftFlags = Record<DepositKind, boolean>;

const readFlags = (): DraftFlags => ({
  annonce: readBrouillon('annonce') !== null,
  offre: readBrouillon('offre') !== null,
});

/**
 * Quelles familles tiennent un brouillon sur cet appareil. Les onglets de
 * dépôt s'en servent pour porter un point : on sait qu'un texte attend sans
 * avoir à ouvrir l'onglet. Le signal se relit à chaque frappe enregistrée, au
 * retour sur la fenêtre et à tout changement de stockage.
 */
export function useDraftFlags(): DraftFlags {
  const [flags, setFlags] = useState<DraftFlags>(readFlags);

  useEffect(() => {
    const sync = () => setFlags(readFlags());
    sync();
    window.addEventListener(DEPOT_BROUILLON_EVENT, sync);
    window.addEventListener('focus', sync);
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('paperatlas:depot')) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(DEPOT_BROUILLON_EVENT, sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return flags;
}