import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type DirectoryCompany = {
  id: string;
  nom: string;
  metier: string;
  pays: string;
  wilaya: string;
  commune: string | null;
  description: string | null;
  mise_en_avant_jusqu_a: string | null;
  created_at: string;
};

type Props = {
  country?: string;
  region?: string;
  trade?: string;
  query?: string;
  onCountChange?: (count: number) => void;
};

const TRADE_TO_PROFILE: Record<string, string> = {
  impression: 'imprimerie',
  edition: 'edition',
  librairie: 'librairie',
  faconnage: 'faconnage',
  communication: 'agence',
  fournisseurs: 'fournisseur',
};

function normalized(value: string) {
  return value.trim().toLocaleLowerCase();
}

export default function PremiumDirectory({
  country = '',
  region = '',
  trade = '',
  query = '',
  onCountChange,
}: Props) {
  const [rows, setRows] = useState<DirectoryCompany[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase
        .from('paperatlas_entreprises')
        .select('id,nom,metier,pays,wilaya,commune,description,mise_en_avant_jusqu_a,created_at')
        .eq('publie', true)
        .order('mise_en_avant_jusqu_a', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (!alive) return;
      if (error) {
        console.error('public-business-list-load-failed', error.message);
      } else {
        setRows((data ?? []) as DirectoryCompany[]);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = normalized(query);
    const wantedTrade = TRADE_TO_PROFILE[trade] ?? '';
    return rows
      .filter((row) =>
        (!country || row.pays === country)
        && (!region || normalized(row.wilaya) === normalized(region))
        && (!wantedTrade || row.metier === wantedTrade)
        && (!needle || normalized(`${row.nom} ${row.metier} ${row.commune ?? ''} ${row.wilaya} ${row.description ?? ''}`).includes(needle)),
      )
      .sort((a, b) => {
        const aFeatured = Boolean(a.mise_en_avant_jusqu_a && new Date(a.mise_en_avant_jusqu_a).getTime() > Date.now());
        const bFeatured = Boolean(b.mise_en_avant_jusqu_a && new Date(b.mise_en_avant_jusqu_a).getTime() > Date.now());
        return Number(bFeatured) - Number(aFeatured)
          || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [country, region, rows, trade, query]);

  useEffect(() => {
    onCountChange?.(filtered.length);
  }, [filtered.length, onCountChange]);

  /* Le bloc n'est plus affiché : le composant ne fait que compter les fiches. */
  return null;
}
