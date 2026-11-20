import { supabase } from '@/lib/supabase';
import { PAYS_DEFAUT, paysArabes } from '@/lib/pays';

/** One row of `paperatlas_conversations`, exactly as stored. */
export type ConversationRow = {
  id: string;
  kind: 'candidature' | 'libre';
  sujet: string;
  offre_id: string | null;
  candidature_id: string | null;
  user_a: string;
  user_b: string;
  nom_a: string | null;
  nom_b: string | null;
  last_message: string | null;
  last_at: string;
  lu_a: string | null;
  lu_b: string | null;
  created_at: string;
  /** D’où le fil a été ouvert : '' pour l’ordinaire, 'fiche' quand il est né
   *  du bouton « Écrire » d’une fiche d’atelier. */
  origine?: string | null;
};

export const CONVERSATION_COLUMNS =
  'id, kind, sujet, offre_id, candidature_id, user_a, user_b, nom_a, nom_b, last_message, last_at, lu_a, lu_b, created_at, origine';

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  corps: string;
  created_at: string;
};

export const MESSAGE_COLUMNS = 'id, conversation_id, sender_id, corps, created_at';

export type CandidatureStatut = 'envoyee' | 'vue' | 'retenue' | 'refusee';

export type Candidature = {
  id: string;
  user_id: string;
  offre_id: string;
  offre_titre: string;
  entreprise: string;
  entreprise_user_id: string | null;
  candidat_nom: string | null;
  candidat_email: string | null;
  /** Country read from the candidate profile; empty until it is joined in. */
  candidat_pays?: string | null;
  telephone: string | null;
  cv_url: string | null;
  /* Private storage path of the CV attached to this application. */
  cv_path: string | null;
  message: string;
  statut: CandidatureStatut;
  note_employeur: string | null;
  /** Le jour où le courriel d'accusé de réception a réellement quitté
   *  PaperAtlas, au dépôt de la candidature. Null tant qu'aucun envoi n'a eu
   *  lieu — jamais la date de l'ouverture du dossier. */
  accuse_at: string | null;
  /** Le jour où le courriel de décision a vraiment quitté PaperAtlas. Null
   *  tant qu'aucun courriel n'est parti — jamais la date de la décision. */
  decision_envoyee_at: string | null;
  created_at: string;
  updated_at: string;
};

export const CANDIDATURE_COLUMNS =
  'id, user_id, offre_id, offre_titre, entreprise, entreprise_user_id, candidat_nom, candidat_email, telephone, cv_url, cv_path, message, statut, note_employeur, accuse_at, decision_envoyee_at, created_at, updated_at';

/** The order the employer's pile can be shown in. */
export type ApplicationSort = 'recent' | 'name' | 'status' | 'pays' | 'silent';

/* Newest first, then the ones still waiting to be handled. */
const STATUT_RANK: Record<CandidatureStatut, number> = {
  envoyee: 0,
  vue: 1,
  retenue: 2,
  refusee: 3,
};

const createdMs = (iso: string) => {
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? time : 0;
};

/** Stable, locale-aware ordering of received applications. */
export function sortApplications(
  rows: Candidature[],
  sort: ApplicationSort,
  locale: string,
) {
  const copy = [...rows];
  if (sort === 'name') {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    copy.sort((a, b) => {
      const nomA = (a.candidat_nom || a.candidat_email || '').trim();
      const nomB = (b.candidat_nom || b.candidat_email || '').trim();
      const byName = collator.compare(nomA, nomB);
      return byName !== 0 ? byName : createdMs(b.created_at) - createdMs(a.created_at);
    });
    return copy;
  }
  if (sort === 'status') {
    copy.sort((a, b) => {
      const byStatus = STATUT_RANK[a.statut] - STATUT_RANK[b.statut];
      return byStatus !== 0 ? byStatus : createdMs(b.created_at) - createdMs(a.created_at);
    });
    return copy;
  }
  if (sort === 'pays') {
    /* Grouped by country: the order of the country select, then the newest
       application first inside each block, so a country reads as one pile. */
    const rank = new Map(paysArabes.map((p, i) => [p.code, i]));
    copy.sort((a, b) => {
      const codeA = a.candidat_pays || PAYS_DEFAUT;
      const codeB = b.candidat_pays || PAYS_DEFAUT;
      const gap = (rank.get(codeA) ?? 999) - (rank.get(codeB) ?? 999);
      return gap !== 0 ? gap : createdMs(b.created_at) - createdMs(a.created_at);
    });
    return copy;
  }
  if (sort === 'silent') {
    /* « Silence le plus long » : les dossiers encore muets — ni accusé de
       réception, ni décision — passent devant, le plus oublié d'abord. Les
       dossiers déjà touchés par un mot suivent, du plus récent au plus ancien. */
    const silentRank = (row: Candidature) => (
      isSettled(row.statut) || row.accuse_at || row.decision_envoyee_at ? 1 : 0
    );
    copy.sort((a, b) => {
      const rankA = silentRank(a);
      const rankB = silentRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if (rankA === 0) return createdMs(a.created_at) - createdMs(b.created_at);
      return createdMs(b.created_at) - createdMs(a.created_at);
    });
    return copy;
  }
  copy.sort((a, b) => createdMs(b.created_at) - createdMs(a.created_at));
  return copy;
}

/** Shortlisted or declined: the two decisions a candidate waits for. */
export const FINAL_STATUTS: CandidatureStatut[] = ['retenue', 'refusee'];

export function isSettled(statut: CandidatureStatut) {
  return FINAL_STATUTS.includes(statut);
}

/**
 * A settled application the candidate has not opened since the last change.
 * The employer's update touches `updated_at`, so a second decision on the same
 * file surfaces again even though the candidate had already opened it once.
 */
export function statusChangeUnseen(
  statut: CandidatureStatut,
  updatedAt: string,
  seenAt?: string | null,
) {
  if (!isSettled(statut)) return false;
  if (!seenAt) return true;
  const seen = new Date(seenAt).getTime();
  const moved = new Date(updatedAt).getTime();
  if (!Number.isFinite(moved)) return false;
  return !Number.isFinite(seen) || seen < moved;
}

export type SeenMark = { candidature_id: string; seen_at: string };

export const SEEN_COLUMNS = 'candidature_id, seen_at';

/** Clears the candidate's badge once they have opened the applications board. */
export async function markCandidaturesSeen(meId: string, ids: string[]) {
  if (!meId || ids.length === 0) return;
  await supabase.from('paperatlas_candidature_vues').upsert(
    ids.map((id) => ({ candidature_id: id, user_id: meId, seen_at: new Date().toISOString() })),
    { onConflict: 'candidature_id,user_id' },
  );
}

export type MemberCard = {
  id: string;
  nom: string;
  organisme: string | null;
  metier: string | null;
  wilaya: string | null;
  /** ISO country code; empty on older rows, which read as Algeria. */
  pays?: string | null;
  role: string;
  titre: string | null;
  bio: string | null;
};

export const MEMBER_COLUMNS = 'id, nom, organisme, metier, wilaya, pays, role, titre, bio';

export type MemberCardRow = MemberCard & { created_at?: string | null };

/** The person on the other end of a thread. */
export function partnerOf(row: ConversationRow, meId: string) {
  const mine = row.user_a === meId;
  return {
    id: mine ? row.user_b : row.user_a,
    nom: ((mine ? row.nom_b : row.nom_a) || '').trim(),
  };
}

/** The moment I last opened this thread. */
export function myReadMark(row: ConversationRow, meId: string) {
  return row.user_a === meId ? row.lu_a : row.lu_b;
}

/** A thread is unread when something happened after I last opened it. */
export function isUnread(row: ConversationRow, meId: string) {
  const mark = myReadMark(row, meId);
  if (!mark) return Boolean(row.last_message);
  const seen = new Date(mark).getTime();
  const last = new Date(row.last_at).getTime();
  return Number.isFinite(last) && last > seen;
}

type OpenInput = {
  meId: string;
  meNom: string;
  otherId: string;
  otherNom: string;
  sujet: string;
  kind: 'candidature' | 'libre';
  offreId?: string | null;
  candidatureId?: string | null;
  firstMessage?: string;
  /** D’où le fil est né : 'fiche' depuis la fiche d’un atelier, 'auteur'
   *  depuis celle d’un auteur, '' pour l’ordinaire. */
  origine?: 'fiche' | 'auteur' | '';
};

/**
 * Finds the thread between these two members — one per job offer — or opens a
 * new one. The caller is always stored as `user_a`, so every later check knows
 * which name and read mark belong to whom.
 */
export async function openConversation(input: OpenInput): Promise<string> {
  const { meId, otherId } = input;
  if (!meId || !otherId || meId === otherId) throw new Error('conversation-not-possible');

  const { data, error } = await supabase
    .from('paperatlas_conversations')
    .select(CONVERSATION_COLUMNS)
    .or(`and(user_a.eq.${meId},user_b.eq.${otherId}),and(user_a.eq.${otherId},user_b.eq.${meId})`)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;

  const wanted = input.offreId ?? null;
  const found = ((data ?? []) as ConversationRow[]).find(
    (row) => row.kind === input.kind && (row.offre_id ?? null) === wanted,
  );

  let conversationId = found?.id ?? '';

  if (!conversationId) {
    const { data: created, error: createError } = await supabase
      .from('paperatlas_conversations')
      .insert({
        kind: input.kind,
        sujet: input.sujet,
        offre_id: wanted,
        candidature_id: input.candidatureId ?? null,
        user_a: meId,
        user_b: otherId,
        nom_a: input.meNom,
        nom_b: input.otherNom,
        last_at: new Date().toISOString(),
        origine: input.origine ?? '',
      })
      .select('id')
      .maybeSingle();
    if (createError) throw createError;
    conversationId = (created?.id as string | undefined) ?? '';
    if (!conversationId) throw new Error('conversation-not-created');
  } else if (input.origine && !(found?.origine ?? '')) {
    /* Un fil libre déjà ouvert, puis repris depuis une fiche : il garde son
       histoire et gagne simplement son origine. Rien d’autre ne bouge. */
    await supabase
      .from('paperatlas_conversations')
      .update({ origine: input.origine })
      .eq('id', conversationId);
  }

  const first = (input.firstMessage ?? '').trim();
  if (first) {
    const { error: sendError } = await supabase.from('paperatlas_messages').insert({
      conversation_id: conversationId,
      sender_id: meId,
      corps: first,
    });
    if (sendError) throw sendError;
    await supabase
      .from('paperatlas_conversations')
      .update({ last_message: first.slice(0, 160), last_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return conversationId;
}

/** Marks the thread as read for me. */
export async function markConversationRead(row: ConversationRow, meId: string) {
  const column = row.user_a === meId ? 'lu_a' : 'lu_b';
  await supabase
    .from('paperatlas_conversations')
    .update({ [column]: new Date().toISOString() })
    .eq('id', row.id);
}

/**
 * Le compte qui tient une fiche de l'annuaire — seulement son identifiant.
 *
 * La correspondance fiche → compte vit sur le compte lui-même, que la lecture
 * publique ne peut pas ouvrir (elle rendrait les adresses e-mail de tous les
 * ateliers). La fonction ne renvoie donc qu'un identifiant, et rien d'autre :
 * juste de quoi ouvrir un fil avec l'atelier, sans rien lire de son dossier.
 */
export async function compteDeFiche(ficheId: string): Promise<string | null> {
  return compteParFiche('fiche_compte', 'fiche', ficheId);
}

/**
 * Le compte qui tient la fiche d’un auteur — même règle, même discrétion :
 * l’identifiant seul, jamais l’adresse ni le téléphone.
 */
export async function compteDAuteur(auteurId: string): Promise<string | null> {
  return compteParFiche('auteur_compte', 'auteur', auteurId);
}

/** Les deux correspondances fiche → compte lisent de la même façon : un
 *  identifiant, ou rien. Une seule lecture, deux fiches possibles. */
async function compteParFiche(
  fn: 'fiche_compte' | 'auteur_compte',
  arg: 'fiche' | 'auteur',
  value: string,
): Promise<string | null> {
  const fiche = (value ?? '').trim();
  if (!fiche) return null;
  const { data, error } = await supabase.rpc(fn, { [arg]: fiche });
  if (error) throw error;
  const found = Array.isArray(data) ? data[0] : data;
  const id = typeof found === 'string' ? found.trim() : '';
  return id || null;
}

/**
 * Puts a thread back in the unread pile so it can be picked up later.
 * The read mark is moved just before the last activity — nothing else changes.
 */
export async function markConversationUnread(row: ConversationRow, meId: string) {
  if (!meId || (row.user_a !== meId && row.user_b !== meId)) return false;
  const column = row.user_a === meId ? 'lu_a' : 'lu_b';
  const last = new Date(row.last_at).getTime();
  const stamp = new Date((Number.isFinite(last) ? last : Date.now()) - 1000).toISOString();
  const { error } = await supabase
    .from('paperatlas_conversations')
    .update({ [column]: stamp })
    .eq('id', row.id);
  return !error;
}

/**
 * Le seuil du sommeil : un fil qui met un jour ou plus à répondre est un fil
 * qui dort. Le même seuil sert à la liste, à l'en-tête de la boîte et à la
 * console — les trois ne peuvent pas compter deux nombres différents.
 */
export const SEUIL_SOMMEIL_MS = 24 * 60 * 60 * 1000;

/** Ce fil dort-il ? Lu sur son rythme de réponse, jamais sur un autre critère. */
export function enSommeil(gapMs?: number | null): boolean {
  return typeof gapMs === 'number' && Number.isFinite(gapMs) && gapMs >= SEUIL_SOMMEIL_MS;
}

/** L'ordre de la liste des conversations : l'activité la plus récente, le
 *  rythme de réponse le plus lent — les fils qui dorment passent devant —, ou
 *  l'aire du monde de l'interlocuteur, qui regroupe les fils sous son nom. */
export type ThreadSort = 'recent' | 'lent' | 'aire';

const lastStampMs = (iso?: string | null) => {
  const time = new Date(iso ?? '').getTime();
  return Number.isFinite(time) ? time : 0;
};

/**
 * La liste triée. Sur « réponse lente », l'écart moyen descend : le fil qui
 * attend une réponse depuis des jours remonte en tête. Un fil qui n'a pas
 * encore connu d'échange n'a pas de rythme : il ferme la marche, sans se
 * faire passer pour ce qu'il n'est pas.
 */
export function sortThreads(
  rows: ConversationRow[],
  sort: ThreadSort,
  pace: Record<string, number>,
): ConversationRow[] {
  /* « Par aire » ne change pas l'ordre des lignes : c'est la liste qui les
     range sous le nom de chaque aire, et cette lecture demande le pays de
     chaque interlocuteur, que le tri ne connaît pas. */
  if (sort !== 'lent') return [...rows];
  const gapOf = (id: string) => {
    const value = pace[id];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  };
  return [...rows].sort((a, b) => {
    const gapA = gapOf(a.id);
    const gapB = gapOf(b.id);
    if (gapA === null && gapB === null) return lastStampMs(b.last_at) - lastStampMs(a.last_at);
    if (gapA === null) return 1;
    if (gapB === null) return -1;
    if (gapA !== gapB) return gapB - gapA;
    return lastStampMs(b.last_at) - lastStampMs(a.last_at);
  });
}

/** La nature retenue dans la boîte : tous les fils, ceux venus d’une
 *  candidature, ceux ouverts librement, ou ceux qui attendent une réponse. */
export type ThreadKindFilter = 'tout' | 'candidature' | 'libre' | 'nonlus';

/** La liste resserrée sur une nature — aucun autre critère n’entre en jeu.
 *  Les non-lus se lisent sur la marque de lecture du compte, donc `meId`
 *  accompagne ce seul filtre ; les autres n’en ont pas besoin. */
export function filterThreads(
  rows: ConversationRow[],
  filter: ThreadKindFilter,
  meId = '',
): ConversationRow[] {
  if (filter === 'tout') return rows;
  if (filter === 'nonlus') {
    if (!meId) return rows;
    return rows.filter((row) => isUnread(row, meId));
  }
  return rows.filter((row) => row.kind === filter);
}

/** Ce fil est-il né du bouton « Écrire » d’une fiche de l’annuaire ? */
export function depuisFiche(row: ConversationRow): boolean {
  const origine = row.origine ?? '';
  return origine === 'fiche' || origine === 'auteur';
}

/** Le genre de fiche qui a ouvert le fil : un atelier, ou un auteur. */
export function origineFiche(row: ConversationRow): 'fiche' | 'auteur' | '' {
  const origine = row.origine ?? '';
  return origine === 'auteur' ? 'auteur' : origine === 'fiche' ? 'fiche' : '';
}

/** Combien de fils dorment, sur le rythme déjà lu pour la liste. */
export function sleepingCount(rows: ConversationRow[], pace: Record<string, number>): number {
  return rows.filter((row) => enSommeil(pace[row.id])).length;
}

export function timeOf(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

/**
 * Le délai moyen de réponse, dit dans l'unité qui se lit : les minutes d'un
 * échange vif, les heures d'un échange du jour, les jours d'un échange étalé.
 * Une seule formulation, partagée par l'en-tête du fil et par la liste des
 * conversations : les deux ne peuvent pas raconter deux rythmes différents.
 */
export function replyGapLabel(gapMs: number | null, t: (key: string) => string): string {
  if (gapMs === null || !Number.isFinite(gapMs)) return '';
  const minutes = gapMs / 60000;
  if (minutes < 60) {
    const value = Math.max(Math.round(minutes), 1);
    return t('msg.replyAvg').replace('{d}', t('msg.replyMinutes').replace('{n}', String(value)));
  }
  const hours = minutes / 60;
  if (hours < 48) {
    return t('msg.replyAvg').replace(
      '{d}',
      t('msg.replyHours').replace('{n}', String(Math.max(Math.round(hours), 1))),
    );
  }
  return t('msg.replyAvg').replace(
    '{d}',
    t('msg.replyDays').replace('{n}', String(Math.max(Math.round(hours / 24), 1))),
  );
}

/**
 * Le rythme de chaque fil, lu sur ses messages : chaque fois que la parole
 * change de camp, l'écart entre le message et celui qui lui répond compte.
 * Les messages envoyés d'affilée ne sont pas des réponses, ils ne pèsent donc
 * pas dans la moyenne. `rows` doit arriver dans l'ordre chronologique.
 */
export function replyPaceByConversation(rows: MessageRow[]): Record<string, number> {
  const groups = new Map<string, MessageRow[]>();
  rows.forEach((row) => {
    const list = groups.get(row.conversation_id);
    if (list) list.push(row);
    else groups.set(row.conversation_id, [row]);
  });

  const out: Record<string, number> = {};
  groups.forEach((list, id) => {
    let total = 0;
    let count = 0;
    for (let i = 1; i < list.length; i += 1) {
      const previous = list[i - 1];
      const current = list[i];
      if (previous.sender_id === current.sender_id) continue;
      const from = new Date(previous.created_at).getTime();
      const to = new Date(current.created_at).getTime();
      if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) continue;
      total += to - from;
      count += 1;
    }
    if (count > 0) out[id] = total / count;
  });
  return out;
}

/** "il y a 3 min" style labels, in the visitor's language. */
export function shortWhen(iso: string, locale: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'minute');
  if (minutes < 60) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 24) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 7) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-days, 'day');
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(date);
}