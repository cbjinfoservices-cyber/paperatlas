import { genres as GENRES, type Genre } from '@/mocks/auteurs';

/** Accent-blind, case-blind form, so « Poésie » and « poesie » meet. */
function plat(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * The directory genre a book label stands for. Book labels are free text
 * (« Essai traduit », « Album illustré », « Patrimoine »), while the directory
 * filters on genre keys — so a label is matched against the translated names of
 * the known genres. Returns "" when the label has no key, and the counter then
 * stays a plain count instead of a door.
 */
export function genreDeLivre(label: string, t: (key: string) => string): Genre | '' {
  const clean = plat(label);
  if (!clean) return '';
  const trouve = GENRES.find((genre) => {
    const nom = plat(t(`genre.${genre}`));
    return nom.length > 1 && (clean === nom || clean.includes(nom));
  });
  return trouve ?? '';
}