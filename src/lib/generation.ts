/**
 * A workshop is read by the decade it opened in: ten years make one generation,
 * so a single counter can hold a whole era instead of a scatter of single years.
 */
export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/** « 1990–1999 »: the ten years a generation covers, read as one label. */
export function decadeLabel(start: number): string {
  return `${start}–${start + 9}`;
}

/** The most generations the directory reads side by side. */
export const MAX_DECADES = 2;

/**
 * The decades a generation filter holds, read from the address (« 1990 » or
 * « 1990,2000 »). Each one comes back as the year it starts on, in order, and
 * never more than two — an older link can only carry what the menu allows.
 */
export function parseDecades(raw: string): number[] {
  if (!raw) return [];
  const starts: number[] = [];
  raw.split(',').forEach((part) => {
    const year = Number(part.trim());
    if (!Number.isFinite(year) || year < 1000) return;
    const start = decadeOf(year);
    if (!starts.includes(start)) starts.push(start);
  });
  return starts.sort((a, b) => a - b).slice(0, MAX_DECADES);
}

/** The address form of a generation filter: first years, comma separated. */
export function decadesParam(starts: number[]): string {
  return [...new Set(starts)].sort((a, b) => a - b).slice(0, MAX_DECADES).join(',');
}

/** « 1990–1999 · 2000–2009 »: two generations read on one line. */
export function decadesLabel(starts: number[]): string {
  return starts.map(decadeLabel).join(' · ');
}

/**
 * One click on a decade in the menu: it joins the filter, and a second click
 * hands it back. A third pick makes room by releasing the oldest decade, so
 * the list never reads more than two generations at once.
 */
export function toggleDecade(raw: string, decade: string): string {
  const year = Number(decade);
  if (!Number.isFinite(year)) return raw;
  const start = decadeOf(year);
  const current = parseDecades(raw);
  if (current.includes(start)) return decadesParam(current.filter((d) => d !== start));
  const kept = current.length >= MAX_DECADES
    ? current.slice(current.length - (MAX_DECADES - 1))
    : current;
  return decadesParam([...kept, start]);
}

/**
 * The place of a decade when the list is read as blocks: the order the decades
 * were picked in, and every other decade keeping its own place after them. It
 * is what turns two generations into two clean blocks instead of two scattered
 * columns of cards.
 */
export function decadeRank(decade: number, picked: number[]): number {
  const index = picked.indexOf(decade);
  return index === -1 ? picked.length : index;
}

/**
 * The generation a sheet hands to the directory: its own decade joins the
 * decades already remembered, so a workshop or a pen opens the board on the
 * two generations it was being read in — never in place of them.
 */
export function decadesWithMemory(decade: number, memoryOpen: string): string {
  const starts = parseDecades(memoryOpen);
  if (starts.includes(decade)) return decadesParam(starts);
  /* The decade of the sheet never gets lost: when two are already remembered,
     the oldest one steps aside, exactly like the menu does. */
  const kept = starts.length >= MAX_DECADES
    ? starts.slice(starts.length - (MAX_DECADES - 1))
    : starts;
  return decadesParam([...kept, decade]);
}

/** What the generation counters read: a year of opening, or a shelf of books. */
export type Genealogy = {
  /** The year the profile started (workshop opening, or the pen's first steps). */
  since: number;
  /** Published books, when the profile carries a shelf. */
  books?: { year: number }[];
};

/**
 * The generation of an author: the decade of their first publication — the
 * earliest book on the shelf, and the year they started when no book is listed
 * yet. Workshops simply answer with their opening year.
 */
export function premierePublication(row: Genealogy): number {
  const years = (row.books ?? []).map((book) => book.year).filter((year) => Number.isFinite(year));
  return years.length > 0 ? Math.min(...years) : row.since;
}