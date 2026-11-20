/**
 * The addresses the inbox hands over: one month of the twelve-month table, one
 * request of the list, or the duel of two months picked on the correction bars.
 *
 * Kept apart from the share button so the CSV export can build the very same
 * addresses — a reference written in a spreadsheet must open the same screen as
 * the small dotted link of the fiche, or the sheet would carry a second truth.
 */

/** The current address, stripped of every parameter it already carries. */
function baseUrl(): URL | null {
  try {
    const url = new URL(window.location.href);
    url.search = '';
    return url;
  } catch {
    return null;
  }
}

/**
 * The address that reopens one month of the twelve-month table: the inbox cut
 * on its closures, the table open behind it, and the reading language kept — so
 * the screen a colleague opens is the screen that was shared.
 */
export function b2bMonthHref(monthKey: string, lang: string): string {
  const url = baseUrl();
  if (!url) return '';
  url.searchParams.set('b2b', 'mois');
  url.searchParams.set('b2bMonth', monthKey);
  url.searchParams.set('lang', lang);
  url.hash = 'demandes-b2b';
  return url.toString();
}

/**
 * The address of the duel: two months picked on the correction bars, already
 * standing when a colleague opens the page — same order, same figures, no two
 * thin bars to hunt down again.
 */
export function b2bDuelHref(months: string[], lang: string): string {
  const keys = months.filter((key) => /^\d{4}-\d{2}$/.test(key)).slice(-2);
  if (keys.length < 2) return '';
  const url = baseUrl();
  if (!url) return '';
  url.searchParams.set('b2b', 'duel');
  url.searchParams.set('b2bMonths', keys.join(','));
  url.searchParams.set('lang', lang);
  url.hash = 'demandes-b2b';
  return url.toString();
}

/**
 * The address of the quote list, already narrowed to the files no grouped recap
 * has ever carried: the workbook closes on it, so a line read months later still
 * leads to the files it counts — no hunting the filters.
 */
export function devisNeverHref(lang: string): string {
  return devisReadingHref('jamais', lang);
}

/**
 * The address of the very same list, narrowed the other way round: only the
 * files a grouped recap has already carried. The strip on « Offres » and the
 * B2B workbook both lead there, so the two faces of the same count never open
 * two different screens.
 */
export function devisGroupHref(lang: string): string {
  return devisReadingHref('groupe', lang);
}

/**
 * The very same reading, but always written on « Mon compte »: the strip of
 * « Offres » does not sit on the account page, so it hands over the address of
 * the page that holds the list instead of its own — a colleague still lands on
 * the filtered rows, never on the offers page.
 */
export function devisAccountHref(
  reading: 'jamais' | 'groupe',
  lang: string,
  recent = false,
  count = 0,
): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  /* L'ordre « partagé récemment » part avec l'adresse : la bande et la liste
     s'ouvrent alors dans le même sens. */
  const order = recent ? '&tri=recents' : '';
  /* Le compteur du tri voyage aussi, et il est propre à la lecture emportée :
     « jamais repris » et « déjà partagés » annoncent chacun leur nombre, que
     l'appelant a compté sur ses propres dossiers — celui qui ouvre l'adresse
     lit ce nombre-là, même s'il n'a jamais partagé ces dossiers lui-même. */
  const tally = count > 0 ? `&triN=${Math.round(count)}` : '';
  return `${base}/compte?devis=${reading}${order}${tally}&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * The address of a single dossier, always written on « Mon compte »: the list
 * opens narrowed to that very reference, with the shared-link line above it
 * saying so. The workbook writes it beside each line, so a sheet read months
 * later can reopen one dossier without hunting the filters — and the strip of
 * « Offres » hands the very same address over, to send one file on its own.
 */
export function devisRowHref(reference: string, lang: string): string {
  const ref = reference.trim();
  if (!ref) return '';
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?ref=${encodeURIComponent(ref)}&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de suivi d'un seul dossier, toujours écrite en entier : la bulle
 * des dossiers rendus la copie depuis sa propre ligne, pour qu'un collègue
 * ouvre exactement la page de suivi que la ligne ouvre — sans passer par la
 * liste. Même forme que le lien posé sur la référence d'une ligne.
 */
export function suiviRefHref(reference: string, lang: string): string {
  const ref = reference.trim();
  if (!ref) return '';
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/suivi?ref=${encodeURIComponent(ref)}&lang=${encodeURIComponent(lang)}`;
}

/**
 * The address of the list opened on the dossiers already handed to a colleague.
 * The strip of « Offres » hands it over without opening the list first, so the
 * reader who receives it lands on what circulates, not on every quote.
 */
export function devisSharedHref(lang: string, recent = false, count = 0): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  /* L'adresse emporte l'ordre quand il est choisi : celui qui l'ouvre lit les
     mêmes dossiers dans le même sens. */
  const order = recent ? '&tri=recents' : '';
  /* Elle emporte aussi le compteur du tri : le collègue lit le même nombre,
     même si son propre navigateur ne connaît aucune de ces marques. */
  const tally = count > 0 ? `&triN=${Math.round(count)}` : '';
  return `${base}/compte?partages=1${order}${tally}&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de la liste ouverte sur les dossiers revenus après un retrait. La
 * bande des Offres la pose sous le rappel des rétablissements, pour qu'un
 * collègue ouvre exactement les dossiers revenus — avec leur jour de retour.
 */
export function devisRestoredHref(lang: string): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?restaures=1&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de la liste ouverte sur les dossiers seulement adressés : munis de
 * leur adresse mais jamais transmis à un collègue, donc ni partagés ni rendus.
 * La bande des Offres la copie depuis la troisième pastille de sa ventilation,
 * pour que le collègue ouvre exactement les lignes que le compteur annonce.
 */
export function devisAddressedHref(lang: string): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?adresses=1&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de la liste ouverte sur les dossiers endormis : seulement adressés,
 * jamais transmis, et qui attendent depuis plus d'une semaine. La Synthèse du
 * classeur la pose sur sa propre ligne, et la pastille de l'en-tête la copie
 * sans ouvrir la liste — le collègue tombe sur ces seuls dossiers.
 */
export function devisDormantHref(lang: string): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?endormis=1&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de la liste ouverte sur les endormis confirmés : les dossiers qui
 * dorment alors que leur devis est déjà confirmé — le devis est prêt, il n'a
 * simplement jamais circulé. La Synthèse du classeur la pose sur sa propre
 * ligne, juste sous celle des endormis, pour que le collègue ouvre ces seuls
 * dossiers sans refaire un filtre.
 */
export function devisDormantConfirmedHref(lang: string): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?endormisConfirmes=1&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de la liste ouverte sur les dossiers dont la durée manque : les
 * dossiers ouverts avant que la durée retenue soit conservée. Le compteur de la
 * bande des Offres est une porte, il ouvre exactement ces lignes-là.
 */
export function devisNoDureeHref(lang: string): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?sansDuree=1&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/**
 * L'adresse de la liste ouverte sur les dossiers dont la durée vient d'un
 * réglage plus ancien : ceux dont la durée écrite ne correspond pas au rythme
 * retenu sur cet appareil. Le compteur des durées héritées, dans la bande des
 * Offres, est une porte à son tour — un clic ouvre ces seules lignes.
 */
export function devisRythmeHeriteHref(lang: string): string {
  const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
  return `${base}/compte?rythmeHerite=1&lang=${encodeURIComponent(lang)}#mes-devis`;
}

/** One address builder for both readings: `jamais` or `groupe`, nothing else. */
export function devisReadingHref(reading: 'jamais' | 'groupe', lang: string): string {
  const url = baseUrl();
  if (!url) return '';
  url.searchParams.set('devis', reading);
  url.searchParams.set('lang', lang);
  url.hash = 'mes-devis';
  return url.toString();
}

/**
 * The address of one request, reference included: the inbox comes back whole,
 * with that very fiche ringed — no hunting the list, no retelling the reference.
 */
export function b2bRequestHref(reference: string, lang: string): string {
  const url = baseUrl();
  if (!url) return '';
  url.searchParams.set('b2b', 'demande');
  url.searchParams.set('b2bRef', reference);
  url.searchParams.set('lang', lang);
  url.hash = 'demandes-b2b';
  return url.toString();
}