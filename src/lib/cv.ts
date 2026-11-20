import { supabase } from '@/lib/supabase';

/** Private bucket: a CV is never reachable without a signed link. */
export const CV_BUCKET = 'cvs-candidats';
export const CV_MAX_BYTES = 5 * 1024 * 1024;

export type CvError = 'type' | 'size' | 'upload';

export type CvResult = { ok: true; path: string } | { ok: false; error: CvError };

/** Legacy rows hold a public link; new rows hold a storage path. */
export const isStoredCv = (value: string) => Boolean(value) && !/^https?:\/\//i.test(value);

/** The path always starts with the owner id: the bucket policies rely on it. */
export function cvObjectPath(userId: string) {
  const stamp = Date.now();
  const salt = Math.random().toString(36).slice(2, 8);
  return `${userId}/cv-${stamp}-${salt}.pdf`;
}

export function isPdf(file: File) {
  const byType = file.type === 'application/pdf';
  const byName = /\.pdf$/i.test(file.name);
  return byType || byName;
}

export async function uploadCv(userId: string, file: File): Promise<CvResult> {
  if (!isPdf(file)) return { ok: false, error: 'type' };
  if (file.size > CV_MAX_BYTES) return { ok: false, error: 'size' };

  const path = cvObjectPath(userId);
  const { error } = await supabase.storage.from(CV_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: 'application/pdf',
    upsert: false,
  });
  if (error) return { ok: false, error: 'upload' };
  return { ok: true, path };
}

export async function removeCv(path: string) {
  if (!isStoredCv(path)) return;
  await supabase.storage.from(CV_BUCKET).remove([path]);
}

/**
 * A one-hour signed link, created on demand. The bucket is private, so this is
 * the only way to open a CV — and the policy only grants it to the owner or to
 * an employer who received an application carrying that file.
 */
export async function cvSignedUrl(path: string, seconds = 3600) {
  if (!isStoredCv(path)) return path;
  const { data, error } = await supabase.storage.from(CV_BUCKET).createSignedUrl(path, seconds);
  if (error || !data?.signedUrl) return '';
  return data.signedUrl;
}

export async function openCv(path: string) {
  const url = await cvSignedUrl(path);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}