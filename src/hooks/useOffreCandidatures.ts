import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';

/** Le nombre de candidatures reçues, offre par offre, pour ce compte. */
export type CandidatureTally = Record<string, number>;

/** L'instant de la dernière candidature reçue, offre par offre (en millisecondes). */
export type CandidatureLastAt = Record<string, number>;

/** Ce que le relevé sait dire des candidatures reçues sur les offres du compte. */
export type OffreCandidatures = {
  /** Toutes les candidatures reçues, offre par offre. */
  counts: CandidatureTally;
  /** Celles qu'aucune décision n'a encore ouvertes : elles attendent une réponse. */
  unread: CandidatureTally;
  /** Le total des non lues, toutes offres confondues. */
  unreadTotal: number;
  /** Combien d'offres portent au moins une candidature non lue. */
  unreadOffres: number;
  /** L'instant de la dernière candidature reçue sur chaque offre. */
  lastAt: CandidatureLastAt;
  /** Le délai moyen de première réponse, offre par offre (en millisecondes). */
  replyAvg: CandidatureLastAt;
  /** Sur combien de candidatures ce délai moyen a été mesuré, offre par offre. */
  replySeen: CandidatureTally;
  /** Combien d'offres répondent en moins de 48 h. */
  replyFast: number;
  /** Sur combien d'offres le délai a pu être mesuré : le tout dont replyFast est une part. */
  replyRated: number;
};

type Row = {
  offre_id: string | null;
  statut: string | null;
  created_at: string | null;
  updated_at: string | null;
  accuse_at: string | null;
  decision_envoyee_at: string | null;
};

/** En deçà de ce délai, une offre est dite rapide à répondre la première fois. */
const FAST_REPLY_MS = 48 * 60 * 60 * 1000;

/** Une candidature encore à son premier état : l'employeur ne l'a pas ouverte. */
const isUnread = (statut: string | null) => (statut ?? '').trim() === 'envoyee';

const stampOf = (iso: string | null) => {
  const time = new Date(iso ?? '').getTime();
  return Number.isFinite(time) ? time : 0;
};

/**
 * L'instant de la première réponse à une candidature : l'accusé de réception
 * quand il est parti, sinon le courriel de décision, sinon la dernière mise à
 * jour d'une candidature qui a quitté son premier état. Zéro quand aucune
 * réponse n'est encore partie.
 */
function firstReplyAt(row: Row) {
  const marks = [stampOf(row.accuse_at), stampOf(row.decision_envoyee_at)].filter((at) => at > 0);
  if (marks.length) return Math.min(...marks);
  if (isUnread(row.statut)) return 0;
  return stampOf(row.updated_at);
}

/**
 * Combien de candidatures chaque offre de ce compte a reçues, combien
 * attendent encore une réponse, quand la dernière est arrivée, et combien de
 * temps l'offre met en moyenne à répondre la première fois. La base ne livre
 * que les candidatures adressées à l'employeur : le relevé se lit sur une
 * seule requête, puis se range par offre. `null` quand rien ne peut en être
 * dit — visiteur non connecté, onglet des annonces, ou lecture refusée — pour
 * qu'aucune pastille n'affiche un zéro trompeur.
 */
export function useOffreCandidatures(enabled: boolean): OffreCandidatures | null {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [releve, setReleve] = useState<OffreCandidatures | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      setReleve(null);
      return;
    }
    let alive = true;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('paperatlas_candidatures')
          .select('offre_id, statut, created_at, updated_at, accuse_at, decision_envoyee_at')
          .eq('entreprise_user_id', userId)
          .limit(1000);
        if (error) throw error;
        const counts: CandidatureTally = {};
        const unread: CandidatureTally = {};
        const lastAt: CandidatureLastAt = {};
        const replyAvg: CandidatureLastAt = {};
        const replySeen: CandidatureTally = {};
        /* Le cumul des délais par offre, avant la moyenne. */
        const replySum: CandidatureLastAt = {};
        let unreadTotal = 0;

        (data ?? []).forEach((row: Row) => {
          const cle = (row.offre_id || '').trim();
          if (!cle) return;
          counts[cle] = (counts[cle] || 0) + 1;
          /* La plus récente l'emporte : c'est elle qui dit si l'offre fait
             encore postuler, ou si elle s'est tue. */
          const at = stampOf(row.created_at);
          if (at > (lastAt[cle] ?? 0)) lastAt[cle] = at;

          /* Le temps mis à répondre la première fois : de l'arrivée de la
             candidature à la première marque de réponse. Une réponse
             antérieure à l'arrivée ne compte pas. */
          const replied = firstReplyAt(row);
          if (replied > 0 && at > 0 && replied >= at) {
            replySum[cle] = (replySum[cle] ?? 0) + (replied - at);
            replySeen[cle] = (replySeen[cle] ?? 0) + 1;
          }

          if (!isUnread(row.statut)) return;
          unread[cle] = (unread[cle] || 0) + 1;
          unreadTotal += 1;
        });

        Object.keys(replySeen).forEach((cle) => {
          replyAvg[cle] = Math.round((replySum[cle] ?? 0) / replySeen[cle]);
        });

        /* La part des offres qui répondent en moins de 48 h : elle se lit sur
           les offres déjà mesurées, jamais sur un zéro supposé. */
        const ratedKeys = Object.keys(replyAvg);
        const replyFast = ratedKeys.filter((cle) => replyAvg[cle] <= FAST_REPLY_MS).length;

        if (!alive) return;
        setReleve({
          counts,
          unread,
          unreadTotal,
          unreadOffres: Object.keys(unread).length,
          lastAt,
          replyAvg,
          replySeen,
          replyFast,
          replyRated: ratedKeys.length,
        });
      } catch {
        if (alive) setReleve(null);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, [enabled, userId]);

  return releve;
}