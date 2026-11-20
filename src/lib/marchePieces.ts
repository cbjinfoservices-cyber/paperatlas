import { supabase } from '@/lib/supabase';

/**
 * Les deux pièces d'un dossier de marché : le cahier des charges et le
 * bordereau des prix, en PDF.
 *
 * Le dépôt est public — un acheteur public n'a pas de compte — mais le fichier
 * ne l'est pas. Le serveur ouvre donc une place de dépôt signée, valable pour
 * un seul fichier et une seule fois : le navigateur y dépose le PDF sans jamais
 * pouvoir lire le reste de l'espace, et la boîte de l'atelier reçoit ensuite un
 * lien signé, refait à chaque ouverture. Rien n'est rangé dans une table, rien
 * n'est exposé par une adresse devinable.
 */

export const PIECES_BUCKET = 'marches-pieces';
/** Le plafond du bucket : au-delà, le serveur refuse le fichier de toute façon. */
export const PIECE_MAX_BYTES = 5 * 1024 * 1024;

/** Les deux pièces du guichet : chacune a sa place, aucune ne remplace l'autre. */
export type PieceKind = 'cdc' | 'bordereau';

export type PieceIssue = 'type' | 'size' | 'slot' | 'upload';

export type PieceUpload =
  | { ok: true; path: string }
  | { ok: false; error: PieceIssue };

/** Un PDF, reconnu au type comme au nom : un navigateur muet reste servi. */
export function isPdfFile(file: File) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

/** La taille se dit en mégaoctets, sans décimale inutile. */
export function pieceSizeLabel(bytes: number) {
  const mo = bytes / (1024 * 1024);
  return `${Math.round(mo * 10) / 10} Mo`;
}

/**
 * Le chemin est fabriqué par le serveur, jamais par le navigateur : c'est lui
 * qui décide de la place, et le jeton qui l'accompagne ne vaut que pour elle.
 */
async function requestSlot(kind: PieceKind) {
  const { data, error } = await supabase.functions.invoke('demandes-b2b', {
    body: { action: 'pieceSlot', kind },
  });
  if (error) return null;
  const body = (data ?? {}) as { ok?: boolean; path?: string; token?: string };
  if (!body.ok || !body.path || !body.token) return null;
  return { path: body.path, token: body.token };
}

/** Dépose une pièce et rend son chemin, ou la raison du refus. */
export async function uploadMarchePiece(kind: PieceKind, file: File): Promise<PieceUpload> {
  if (!isPdfFile(file)) return { ok: false, error: 'type' };
  if (file.size > PIECE_MAX_BYTES) return { ok: false, error: 'size' };

  const slot = await requestSlot(kind);
  if (!slot) return { ok: false, error: 'slot' };

  const { error } = await supabase.storage
    .from(PIECES_BUCKET)
    .uploadToSignedUrl(slot.path, slot.token, file, {
      cacheControl: '3600',
      contentType: 'application/pdf',
    });
  if (error) return { ok: false, error: 'upload' };
  return { ok: true, path: slot.path };
}