import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Le pays d’un membre, lu sur son profil public — seulement cela, rien de son
 * dossier. La messagerie s’en sert pour situer l’interlocuteur d’un fil dans
 * son aire du monde, sans ouvrir sa fiche entière.
 *
 * Une lecture qui échoue laisse simplement le pays vide : le fil reste
 * utilisable, et le geste de copie de l’aire se tait au lieu de mentir.
 */
export default function useMemberPays(memberId: string): string {
  const [pays, setPays] = useState('');

  useEffect(() => {
    const id = (memberId ?? '').trim();
    if (!id) {
      setPays('');
      return undefined;
    }
    let alive = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_membres')
          .select('pays')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        const code = (data as { pays?: string | null } | null)?.pays ?? '';
        if (alive) setPays(typeof code === 'string' ? code.trim() : '');
      } catch {
        if (alive) setPays('');
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [memberId]);

  return pays;
}

/**
 * Les pays de plusieurs membres, lus en une seule fois : la liste des fils
 * s'en sert pour resserrer la boîte sur une aire, sans lancer une lecture par
 * fil. La forme est la même que la lecture d'un seul membre — un code pays, ou
 * rien du tout quand le profil ne le dit pas.
 */
export function useMemberPaysMap(memberIds: string[]): Record<string, string> {
  const [pays, setPays] = useState<Record<string, string>>({});
  /* La clef stable de la lecture : les identifiants triés et dédoublonnés,
     si bien qu'une liste qui se réordonne ne relance pas la requête. */
  const key = [...new Set((memberIds ?? []).map((id) => (id ?? '').trim()).filter(Boolean))]
    .sort()
    .join(',');

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (ids.length === 0) {
      setPays({});
      return undefined;
    }
    let alive = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_membres')
          .select('id, pays')
          .in('id', ids);
        if (error) throw error;
        if (!alive) return;
        const sortie: Record<string, string> = {};
        ((data ?? []) as { id?: string | null; pays?: string | null }[]).forEach((row) => {
          const id = (row.id ?? '').trim();
          if (!id) return;
          sortie[id] = typeof row.pays === 'string' ? row.pays.trim() : '';
        });
        setPays(sortie);
      } catch {
        if (alive) setPays({});
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [key]);

  return pays;
}