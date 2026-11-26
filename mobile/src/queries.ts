import type { NonNullableClient } from './types';
import type { ListingFilter, LocationFilter } from './catalog';

export type ListingKind = 'annonce' | 'offre';

const safeTerm = (value: string) => value.normalize('NFC').replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');

export async function searchDirectory(db: NonNullableClient, search: string, signal: AbortSignal, location?: LocationFilter) {
  const term = safeTerm(search);
  let query = db.from('paperatlas_membres')
    .select('id, nom, organisme, metier, wilaya, pays, titre, bio')
    .eq('role', 'pro')
    .order('nom').order('id').limit(50);
  if (term) {
    const pattern = `%${term.replace(/ /g, '%')}%`;
    query = query.or(['nom', 'organisme', 'metier', 'wilaya', 'pays'].map(field => `${field}.ilike.${pattern}`).join(','));
  }
  if (location?.country === 'DZ') query = query.or('pays.eq.DZ,pays.is.null,pays.eq.');
  else if (location?.country) query = query.eq('pays', location.country);
  const region = safeTerm(location?.region ?? '');
  if (region) query = query.ilike('wilaya', `%${region.replace(/ /g, '%')}%`);
  const { data, error } = await query.abortSignal(signal);
  if (error) throw new Error(error.message);
  return data;
}

export async function publishedListings(db: NonNullableClient, kind: ListingKind, signal: AbortSignal, filters?: ListingFilter) {
  let query = db.from('paperatlas_annonces')
    .select('id, titre, organisation, rubrique, wilaya, commune, pays, description')
    .eq('kind', kind).eq('statut', 'publie');
  if (filters?.category) query = query.eq('rubrique', filters.category);
  if (filters?.country === 'DZ') query = query.or('pays.eq.DZ,pays.is.null,pays.eq.');
  else if (filters?.country) query = query.eq('pays', filters.country);
  const region = safeTerm(filters?.region ?? '');
  if (region) {
    const pattern = `%${region.replace(/ /g, '%')}%`;
    query = query.or(`wilaya.ilike.${pattern},commune.ilike.${pattern}`);
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(60).abortSignal(signal);
  if (error) throw new Error(error.message);
  return data;
}

export async function conversations(db: NonNullableClient, userId: string, signal: AbortSignal) {
  const { data, error } = await db.from('paperatlas_conversations')
    .select('id, sujet, user_a, user_b, nom_a, nom_b, last_message, lu_a, lu_b, last_at')
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order('last_at', { ascending: false }).limit(100).abortSignal(signal);
  if (error) throw new Error(error.message);
  return data;
}

export async function messages(db: NonNullableClient, id: string, signal: AbortSignal) {
  const { data, error } = await db.from('paperatlas_messages')
    .select('id, corps, sender_id, created_at')
    .eq('conversation_id', id).order('created_at', { ascending: false }).limit(100).abortSignal(signal);
  if (error) throw new Error(error.message);
  return data.reverse();
}

export type Conversation = Awaited<ReturnType<typeof conversations>>[number];

export async function sendMessage(db: NonNullableClient, id: string, author: string, body: string) {
  const { error } = await db.from('paperatlas_messages').insert({
    conversation_id: id, sender_id: author, corps: body,
  });
  if (error) throw new Error(error.message);
  const { error: previewError } = await db.from('paperatlas_conversations')
    .update({ last_message: body.slice(0, 160), last_at: new Date().toISOString() }).eq('id', id);
  return previewError?.message;
}
