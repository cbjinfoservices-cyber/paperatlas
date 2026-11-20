import { b2bDict } from '@/i18n/dict.b2b';
import { B2B_MOTIF_KEYS, type B2bMotifKey } from '@/lib/b2b';

const LANGS = ['fr', 'ar', 'en'] as const;

/** Every label a reason may have been written with, in all three languages. */
function labelsOf(key: B2bMotifKey): string[] {
  return LANGS.map((lang) => {
    const dict = b2bDict[lang] as Record<string, string | undefined>;
    return dict[`acct.b2b.motif.${key}`] ?? '';
  }).filter(Boolean);
}

/**
 * A closure stores the reason as it was worded that day, followed — maybe — by
 * the workshop own note. Detecting it against every language means a member who
 * switches language still finds the requests they closed last month.
 */
export function detectMotif(motif?: string | null): B2bMotifKey | null {
  const value = (motif ?? '').trim();
  if (!value) return null;
  const found = B2B_MOTIF_KEYS.find((key) =>
    labelsOf(key).some(
      (label) => value === label || value.startsWith(`${label} —`) || value.startsWith(`${label} -`),
    ),
  );
  return found ?? null;
}

/** How many closed requests each reason accounts for. */
export function countMotifs(rows: Array<{ statut: string; motif?: string | null }>) {
  const counts: Record<B2bMotifKey, number> = { devis: 0, client: 0, hors: 0, delai: 0, sansSuite: 0 };
  rows.forEach((row) => {
    if (row.statut !== 'traitee') return;
    const key = detectMotif(row.motif);
    if (key) counts[key] += 1;
  });
  return counts;
}