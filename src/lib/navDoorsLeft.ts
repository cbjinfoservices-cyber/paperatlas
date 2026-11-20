/**
 * Combien de portes attendent encore sous le bord d'une liste ?
 *
 * Les deux surfaces du menu — le panneau « Plus » et la feuille du téléphone —
 * disent qu'il reste des portes par un voile et une flèche. La flèche porte
 * maintenant leur compte : elle ne dit plus seulement « il y en a », elle dit
 * combien. Le compte se lit sur la géométrie réelle, jamais sur un total
 * mémorisé : une rubrique ouverte, une recherche, une ligne qui se replie en
 * arabe, et le chiffre suit.
 */

/** Les portes du panneau : chaque entrée du menu, moins la flèche elle-même,
    moins la sortie de compte — elle appartient au plancher, pas à la liste —
    et moins la flèche qui ouvre une suite (elle ouvre un pliant, elle ne mène
    pas à une page).

    Les huit pastilles de type y entrent aussi. Elles n'ont pas la voix d'une
    entrée de menu — le panneau les rend en pastilles, sans `role` —, mais ce
    sont des portes : tant que le compte les ignorait, replier la rubrique
    annonçait « 8 portes repliées » alors que le chiffre n'en avait jamais
    tenu une seule, et le repère de fin nommait un total trop court. La feuille
    du téléphone les comptait déjà ; le panneau lit maintenant la même
    géométrie qu'elle. */
export const PANEL_DOOR_SELECTOR = [
  '[role="menuitem"]:not(.nav-more-more):not(.nav-more-foot-out):not(.nav-door-toggle)',
  'a.nav-dir-type',
].join(', ');

/** Les portes de la feuille : ses lignes vivent dans plusieurs rubriques et
    plusieurs formes — la porte simple, la porte comptée, la sous-ligne du
    guichet, le second accès, la pastille d'un type, la marque de lecture. La
    liste nomme ces formes une à une, plutôt que de compter tout ce qui se
    clique : une croix de recherche n'est pas une porte. */
export const SHEET_DOOR_SELECTOR = [
  'a.nav-mobile-item',
  'a.nav-mobile-plain',
  'a.nav-sheet-subline',
  'a.nav-mobile-sub',
  'a.nav-mobile-read',
  'a.nav-mobile-late',
  /* La porte du candidat, dans la rubrique du travail : c'est une ligne qui
     mène à une page, au même titre que la porte de conversion qui la suit.
     Tant que le compte l'ignorait, l'intitulé de la rubrique annonçait une
     porte de moins que ce qu'on pouvait réellement ouvrir. */
  'a.nav-mobile-cand',
  'a.nav-dir-type',
  'a.nav-door-chip',
  'a.nav-sheet-member-link',
].join(', ');

/**
 * Compte les portes dont le haut est encore sous `visibleBottom` — le bord
 * réellement visible de la liste, plancher déduit. Une porte repliée ne compte
 * pas : elle n'est pas dans le flux, et l'annoncer ferait mentir la flèche.
 */
export function doorsLeftIn(
  root: HTMLElement | null,
  selector: string,
  visibleBottom: number,
): number {
  if (!root) return 0;
  let left = 0;
  root.querySelectorAll<HTMLElement>(selector).forEach((door) => {
    /* Replié (display: none) : aucune boîte, donc rien à annoncer. */
    if (!door.getClientRects().length) return;
    const box = door.getBoundingClientRect();
    if (box.height <= 0) return;
    /* Une porte qui commence sous le bord n'a pas encore été vue. Une porte à
       cheval sur le bord a été rencontrée : elle ne compte plus. */
    if (box.top > visibleBottom - 2) left += 1;
  });
  return left;
}

/**
 * Le repère de fin est-il entré dans la bande visible de la liste ?
 *
 * Tant qu'il ne l'est pas, des portes attendent sous le filet du plancher :
 * le voile et la flèche ont quelque chose à annoncer. Dès qu'il paraît, tout
 * ce qui le précède est au-dessus du bord — donc plus rien n'est caché — et
 * les deux doivent s'effacer. Le contrôle se fait sur le repère lui-même, et
 * non sur une distance au fond : la hauteur du pied peut changer — deux
 * lignes en anglais ou en arabe —, la règle n'a pas à en connaître.
 */
export function endInSightIn(root: HTMLElement | null, visibleBottom: number): boolean {
  const mark = root?.querySelector<HTMLElement>('.nav-more-end');
  if (!root || !mark) return false;
  /* Replié : aucune boîte, donc rien à lire. */
  if (!mark.getClientRects().length) return false;
  const box = mark.getBoundingClientRect();
  if (box.height <= 0) return false;
  return box.top < visibleBottom - 2;
}

/**
 * Toutes les portes que la liste tient — repliées exclues.
 *
 * Le repère de fin ne disait que « c'est le bout » ; il nomme maintenant le
 * nombre total de portes de la liste, pour que le chiffre de la flèche — ce
 * qu'il reste — se lise à côté de ce qu'il y avait au départ. Le total est
 * relevé sur la même géométrie que le reste : une rubrique repliée retire ses
 * portes du total comme du compte, et les deux chiffres ne peuvent pas se
 * contredire.
 */
export function doorsIn(root: HTMLElement | null, selector: string): number {
  if (!root) return 0;
  let total = 0;
  root.querySelectorAll<HTMLElement>(selector).forEach((door) => {
    if (!door.getClientRects().length) return;
    if (door.getBoundingClientRect().height <= 0) return;
    total += 1;
  });
  return total;
}

/**
 * Le compte d'une rubrique, posé à côté de son intitulé.
 *
 * La rubrique du travail annonçait son nom sans dire ce qu'elle tenait : il
 * fallait l'ouvrir pour savoir si elle menait à quatre portes ou à sept. Le
 * chiffre se lit maintenant à côté du mot, relevé sur la géométrie réelle —
 * une porte de plus, un rappel en retard qui paraît, et il suit. Une seule
 * tournure par langue, accordée au singulier comme au pluriel, lue par la
 * feuille comme par le panneau.
 */
export function phrasePortesRubrique(
  portes: number,
  t: (cle: string) => string,
): string {
  if (portes <= 0) return '';
  return portes === 1
    ? t('navm.grpDoorsOne')
    : t('navm.grpDoors').replace('{n}', String(portes));
}

/**
 * Le nombre total de portes, dit avec son accord.
 *
 * Une porte ne se dit pas comme plusieurs, et le total suit la même règle que
 * le compte restant : une seule tournure par langue, lue par le panneau comme
 * par la feuille, pour que les deux surfaces ne puissent pas se contredire.
 */
export function phrasePortesTotales(
  total: number,
  t: (cle: string) => string,
): string {
  if (total <= 0) return '';
  return total === 1
    ? t('navm.listEndDoorsOne')
    : t('navm.listEndDoors').replace('{n}', String(total));
}

/**
 * Les portes d'un bloc, dites avec leur part du tout.
 *
 * Le bouton du pied de page ne dit plus seulement combien de colonnes sont
 * ouvertes : quand une seule l'est, il annonce les portes qu'elle découvre
 * sur celles que le pied de page tient en tout — « 17 portes sur 23 ». Le mot
 * suit le nombre, comme partout ailleurs, et une seule tournure par langue
 * sert les deux comptes, le visible comme le total.
 */
export function phrasePortesSur(
  portes: number,
  total: number,
  t: (cle: string) => string,
): string {
  if (portes <= 0 || total <= 0) return '';
  if (portes === 1) return t('foot.doorsOfOne').replace('{total}', String(total));
  return t('foot.doorsOf')
    .replace('{open}', String(portes))
    .replace('{total}', String(total));
}

/**
 * Le compte des portes restantes, dit avec son accord.
 *
 * La flèche portait un chiffre et une phrase au pluriel : à une porte du
 * plancher, elle annonçait encore « 1 portes ». Le nombre commande donc le
 * mot, comme partout ailleurs dans la barre — une tournure par langue, lue
 * par la feuille et le panneau à la même source, pour qu'ils ne puissent pas
 * se contredire. Aucune porte restante : plus de phrase ici — la flèche
 * s'efface de toute façon avec le voile —, la phrase du bout de liste prenant
 * alors le relais à voix basse (voir phrasePortesAucune).
 */
export function phrasePortesRestantes(
  restantes: number,
  t: (cle: string) => string,
): string {
  if (restantes <= 0) return '';
  return restantes === 1
    ? t('navm.doorsLeftOne')
    : t('navm.doorsLeft').replace('{n}', String(restantes));
}

/**
 * Les portes qu'une rubrique qui se replie vient de retirer à la liste.
 *
 * Le compte des portes restantes se tait tant que sa tournure ne change pas :
 * replier une rubrique faisait donc tomber le chiffre de sept à trois sans que
 * rien ne soit dit, et la liste semblait perdre des portes par accident. La
 * phrase du repli nomme ce qui vient de disparaître, à côté du compte relu sur
 * la nouvelle géométrie — le compte explique ainsi ce qu'il vient de perdre.
 */
/**
 * La liste ne tient plus rien sous son bord.
 *
 * Le compte se taisait à zéro : la flèche disparaissait et rien n'était dit,
 * si bien qu'arriver au bout ressemblait à une perte. La voix basse a
 * désormais une phrase pour ce moment-là — elle ne remplace pas le compte,
 * elle le termine : « plus rien en dessous ». Le mot s'écrit une seule fois,
 * lu par le panneau comme par la feuille. La première mesure d'une ouverture
 * se tait toujours : un panneau dont la liste tient tout entière n'a rien à
 * annoncer, son nom porte déjà le total.
 */
export function phrasePortesAucune(t: (cle: string) => string): string {
  return t('navm.doorsNone');
}

/**
 * Les portes qu'une recherche laisse dans la liste.
 *
 * La flèche du bas disait, à voix basse, ce qui restait sous son bord — mais
 * pendant une recherche, elle parlait d'une liste que la question venait de
 * changer, et son chiffre ne répondait pas à ce qu'on venait de demander. La
 * recherche a donc sa propre voix : combien de portes elle laisse. Rien ne se
 * dit à zéro : la feuille affiche alors sa ligne « aucune porte ne répond »,
 * qui est déjà une zone de statut, et la même chose ne se dit pas deux fois.
 * Une seule tournure par langue, accordée au singulier comme au pluriel.
 */
export function phrasePortesTrouvees(
  trouvees: number,
  t: (cle: string) => string,
): string {
  if (trouvees <= 0) return '';
  return trouvees === 1
    ? t('navm.searchDoorsOne')
    : t('navm.searchDoors').replace('{n}', String(trouvees));
}

/**
 * Les portes trouvées au-delà du filet de famille.
 *
 * La recherche des deux tableaux rend ses résultats famille par famille, sous
 * un mot de couture qui nomme celle qui suit. Une voix basse dit alors combien
 * de portes trouvées se tiennent au-delà du premier filet — le chiffre se
 * relève sur les portes réellement rendues, jamais sur une addition écrite à
 * la main, et il ne se dit pas à zéro : la ligne « aucune porte ne répond »
 * est déjà une zone de statut. Une seule tournure par langue, accordée au
 * singulier comme au pluriel.
 */
export function phrasePortesAuDela(
  trouvees: number,
  t: (cle: string) => string,
): string {
  if (trouvees <= 0) return '';
  return trouvees === 1
    ? t('navm.seamBeyondOne')
    : t('navm.seamBeyond').replace('{n}', String(trouvees));
}

/**
 * La famille dont la recherche vient de dépasser le filet.
 *
 * Dans la feuille, les résultats d'une recherche se rangent sous l'intitulé de
 * leur rubrique, et le mot de couture y sépare deux suites de la même famille.
 * La voix basse ne dit donc plus seulement combien de portes se tiennent
 * au-delà du filet : elle nomme d'abord la famille dont le filet est franchi —
 * « Le réseau · 2 portes trouvées au-delà du filet de famille » —, si bien
 * qu'un chiffre seul ne flotte plus sans dire de quelle famille il parle.
 * Le nom de la famille vient de l'intitulé que la feuille affiche déjà : il
 * n'est jamais écrit une seconde fois. À zéro porte au-delà, rien n'est dit.
 */
export function phraseFamilleDepassee(
  famille: string,
  trouvees: number,
  t: (cle: string) => string,
): string {
  const portes = phrasePortesAuDela(trouvees, t);
  if (!famille || !portes) return '';
  return t('navm.seamFamilySaid')
    .replace('{family}', famille)
    .replace('{doors}', portes);
}

export function phrasePortesRepliees(
  portes: number,
  t: (cle: string) => string,
): string {
  if (portes <= 0) return '';
  return portes === 1
    ? t('navm.foldedDoorsOne')
    : t('navm.foldedDoors').replace('{n}', String(portes));
}

/* ── La profondeur du voile ────────────────────────────────────────────────
   Le voile est une profondeur fixe — 56 px —, écrite une fois et lue par les
   deux surfaces. Sur une liste haute, c'est peu ; sur une bande visible
   courte — un écran de faible hauteur, le clavier du téléphone ouvert, un pied
   anglais replié sur deux lignes —, ces 56 px mangeraient le repère de fin et
   la dernière porte. Le voile ne prend donc jamais plus d'un peu moins de la
   moitié de la bande : au-delà, il n'éclaire plus la fin de la liste, il la
   cache. */
export const VEIL_MAX = 56;
export const VEIL_MIN = 24;

/** La profondeur du voile pour une bande visible donnée, en pixels. */
export function veilHeightIn(band: number): number {
  if (!Number.isFinite(band) || band <= 0) return VEIL_MAX;
  return Math.round(Math.min(VEIL_MAX, Math.max(VEIL_MIN, band * 0.4)));
}