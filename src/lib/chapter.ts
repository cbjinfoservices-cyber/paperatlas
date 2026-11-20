/**
 * The home chapter, seen from the bar.
 *
 * These three beats are the only ones that own a door somewhere in the bar:
 * « Demandes » in the row, « Devis » and « Suivi » in « Plus ». Keeping their
 * ids, their travel and their labels in one place means the panel, the sheet
 * and the progress line all read the very same numbers.
 */

export const SECTION_BEATS = ['besoin', 'devis', 'livraison'];

/* Where each section begins in the chapter's travel. A click on the progress
   line walks there exactly the way a door in the row does. */
export const SECTION_START: Record<string, number> = {
  besoin: 0.1429,
  devis: 0.4286,
  livraison: 0.7143,
};

/* The label each section carries in the bar. */
export const SECTION_LABEL: Record<string, string> = {
  besoin: 'nav.demandes',
  devis: 'nav.devis',
  livraison: 'nav.suivi',
};

/**
 * The bar carries three more places that can be « read », without being beats
 * of the chapter: the offers wall of the home page, the directory itself, and
 * the subcontracting section — a place of the page that owns a door in « Plus ».
 * They get the same named pill, but they never enter the 3/3 count: a place of
 * the page is not a section of the film.
 */
export const PLACE_DOORS = ['offres', 'annuaire', 'soustraitance'];

/* The label each of those places carries in the row. */
export const PLACE_LABEL: Record<string, string> = {
  offres: 'nav.offres',
  annuaire: 'nav.annuaire',
  soustraitance: 'foot.sub',
};

/* Fallback memory on the device: the row answers instantly on arrival, before
   the account has replied, and still works for a signed-out visitor. */
const PLACES_KEY = 'paperatlas:places-read';

/** Only the two places the row actually owns are ever kept. */
export function sanitizePlaces(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const list = value as unknown[];
  return PLACE_DOORS.filter((place) => list.includes(place));
}

export function loadLocalPlaces(): string[] {
  try {
    const raw = window.localStorage.getItem(PLACES_KEY);
    if (!raw) return [];
    return sanitizePlaces(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveLocalPlaces(places: string[]) {
  try {
    window.localStorage.setItem(PLACES_KEY, JSON.stringify(places));
  } catch {
    /* Private mode or a full box: the mark simply does not survive here. */
  }
}

/* Fallback memory on the device: the count shows instantly on arrival, before
   the account has answered, and still works for a signed-out visitor. */
const READ_KEY = 'paperatlas:chapter-read';

/** Only the three beats of this chapter are ever kept; anything else is stale. */
export function sanitizeChapter(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const list = value as unknown[];
  return SECTION_BEATS.filter((beat) => list.includes(beat));
}

export function loadLocalChapter(): string[] {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return [];
    return sanitizeChapter(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveLocalChapter(sections: string[]) {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify(sections));
  } catch {
    /* Private mode or a full box: the count simply does not survive here. */
  }
}

/** The next section the chapter has not shown yet — and the first one again
    once the whole chapter has been read, so the door never goes dead. */
export function nextChapterSection(read: string[], current: string | null): string {
  return SECTION_BEATS.find((s) => !read.includes(s))
    || SECTION_BEATS.find((s) => s !== current)
    || SECTION_BEATS[0];
}