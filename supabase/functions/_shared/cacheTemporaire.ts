export type CacheTemporaire<C, T> = (contexte: C) => Promise<T>;

export function creerCacheTemporaire<C, T>({
  ttlMs,
  charger,
  valide,
  maintenant = Date.now,
}: {
  ttlMs: number;
  charger: (contexte: C) => Promise<T>;
  valide: (valeur: T) => boolean;
  maintenant?: () => number;
}): CacheTemporaire<C, T> {
  let entree: { valeur: T; expire: number } | null = null;

  return async (contexte) => {
    if (entree && entree.expire > maintenant()) return entree.valeur;

    const valeur = await charger(contexte);
    if (valide(valeur)) {
      entree = { valeur, expire: maintenant() + ttlMs };
    }
    return valeur;
  };
}
