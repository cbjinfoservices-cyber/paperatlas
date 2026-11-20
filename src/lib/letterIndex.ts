/**
 * L'index des lettres d'une liste rangée par nom (A → Z).
 *
 * Une seule mesure pour les trois tableaux — le vivier des candidats, les
 * annonces et les emplois : chaque lettre présente connaît la première ligne
 * qu'elle ouvre et le nombre de lignes qu'elle tient, pour qu'un clic mène
 * droit au point cherché dans une liste longue.
 */
export type LetterEntry = {
  /** La lettre, en capitale, telle qu'elle s'affiche dans l'index. */
  letter: string;
  /** La position de la première ligne qui porte cette lettre. */
  index: number;
  /** Combien de lignes la lettre tient. */
  count: number;
};

/**
 * Construit l'index d'une liste *déjà rangée* : l'ordre des lettres suit donc
 * celui de la liste, sans être retrié.
 */
export function buildLetterIndex(names: (string | null | undefined)[]): LetterEntry[] {
  const out: LetterEntry[] = [];
  names.forEach((name, index) => {
    const letter = (name ?? '').trim().charAt(0).toUpperCase();
    if (!letter) return;
    const last = out[out.length - 1];
    if (last && last.letter === letter) last.count += 1;
    else out.push({ letter, index, count: 1 });
  });
  return out;
}

/**
 * La lettre lue dans l'adresse, ramenée à une seule lettre : une adresse
 * abîmée ne casse pas l'index, elle ne le rejoint simplement pas.
 */
export function readLetter(raw: string | null | undefined): string {
  return (raw ?? '').trim().charAt(0).toUpperCase();
}