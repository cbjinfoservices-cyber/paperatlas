import { auteurs } from '@/mocks/auteurs';
import { annonces } from '@/mocks/annonces';
import { emplois } from '@/mocks/emplois';
import { paysDe } from '@/lib/pays';

export type ScopeCompte = {
  /** The region kept in the address, "" when every region is read. */
  region: string;
  /** The country kept in the address, "" when every country is read. */
  pays: string;
  /** Whether a perimeter is actually narrowing the three boards. */
  narrowed: boolean;
  auteurs: number;
  annonces: number;
  emplois: number;
};

type Row = { wilaya: string; pays?: string | null };

/**
 * Combien de profils, d'annonces et de postes le périmètre retenu contient.
 *
 * Les trois barres latérales annoncent un compte ; quand une région est
 * choisie, ce compte doit être celui que le lecteur verra vraiment sur la
 * barre concernée — jamais le total national à la place d'un périmètre qui ne
 * le contient plus. La région et le pays sont lus ensemble : deux régions
 * peuvent porter le même nom d'un pays à l'autre.
 */
export function comptePerimetre(region: string, pays: string): ScopeCompte {
  const garde = (row: Row) => (!region || row.wilaya === region)
    && (!pays || paysDe(row) === pays);
  return {
    region,
    pays,
    narrowed: Boolean(region || pays),
    auteurs: region || pays ? auteurs.filter(garde).length : auteurs.length,
    annonces: region || pays ? annonces.filter(garde).length : annonces.length,
    emplois: region || pays ? emplois.filter(garde).length : emplois.length,
  };
}