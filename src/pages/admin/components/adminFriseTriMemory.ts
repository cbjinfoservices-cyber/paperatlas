/**
 * L'ordre des deux portes de copie de la tête de frise : celle de la tranche la
 * plus ancienne encore ouverte, ou celle de la plus récemment touchée.
 *
 * Le choix vit sur l'appareil seulement : c'est une commodité de lecture, pas un
 * fait du dossier. Un stockage refusé ramène simplement la plus ancienne en
 * tête, l'ordre où les deux portes ont toujours été écrites.
 */
export type TriPortesCopie = 'ancienne' | 'recente';

const CLE = 'paperatlas:admin-frise-portes-tri';

/**
 * L'ordre retenu à la dernière visite : la plus ancienne d'abord, sauf quand
 * l'appareil a gardé l'autre sens.
 */
export function readTriPortesCopie(): TriPortesCopie {
  if (typeof window === 'undefined') return 'ancienne';
  try {
    return window.localStorage.getItem(CLE) === 'recente' ? 'recente' : 'ancienne';
  } catch {
    return 'ancienne';
  }
}

/** Retient l'ordre des portes, pour la prochaine ouverture de la console. */
export function saveTriPortesCopie(value: TriPortesCopie): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, value === 'recente' ? 'recente' : 'ancienne');
  } catch {
    /* Stockage refusé : l'ordre reste vrai le temps de la visite. */
  }
}

/* ---- l'ordre des tranches encore ouvertes, dans la tête de frise ---- */

/**
 * L'ordre des tranches encore ouvertes : celui du plan — de la première à la
 * dernière —, ou celui qui rapproche de la fin — la tranche la plus avancée
 * dans le plan d'abord, celle qui ferme les trente écrans en tête.
 *
 * C'est une commodité de lecture, comme l'ordre des deux portes de copie : le
 * choix vit sur l'appareil et ne dit rien du dossier.
 */
export type TriTranchesOuvertes = 'plan' | 'fin';

const CLE_OUVERTES = 'paperatlas:admin-frise-tranches-tri';
/* L'instant où la fin a été mise en tête : la gomme s'en sert pour dater le
   geste, et non pour recomposer l'ordre. */
const CLE_OUVERTES_DEPUIS = 'paperatlas:admin-frise-tranches-tri-depuis';

/**
 * L'ordre retenu à la dernière visite : celui du plan, sauf quand l'appareil a
 * gardé l'autre sens — la fin d'abord.
 */
export function readTriTranchesOuvertes(): TriTranchesOuvertes {
  if (typeof window === 'undefined') return 'plan';
  try {
    return window.localStorage.getItem(CLE_OUVERTES) === 'fin' ? 'fin' : 'plan';
  } catch {
    return 'plan';
  }
}

/**
 * Depuis quand l'ordre « Fin d'abord » est tenu sur cet appareil, ou `null`
 * quand l'ordre du plan est en vigueur — ou quand aucun instant n'a été noté.
 *
 * La gomme s'en sert pour dater le geste qu'elle défait : un ordre tenu depuis
 * trois jours ne se lit pas comme un ordre essayé à l'instant.
 */
export function readTriTranchesOuvertesDepuis(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const brut = window.localStorage.getItem(CLE_OUVERTES_DEPUIS);
    if (!brut || Number.isNaN(new Date(brut).getTime())) return null;
    return brut;
  } catch {
    return null;
  }
}

/**
 * Retient l'ordre des tranches ouvertes, pour la prochaine ouverture — et, la
 * première fois que la fin est mise en tête, l'instant de ce choix.
 *
 * L'instant ne se réécrit pas tant que l'ordre tient : choisir deux fois la
 * fin ne recule pas la date du geste. Revenir à l'ordre du plan l'efface.
 */
export function saveTriTranchesOuvertes(value: TriTranchesOuvertes): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE_OUVERTES, value === 'fin' ? 'fin' : 'plan');
    if (value === 'fin') {
      if (!readTriTranchesOuvertesDepuis()) {
        window.localStorage.setItem(CLE_OUVERTES_DEPUIS, new Date().toISOString());
      }
    } else {
      window.localStorage.removeItem(CLE_OUVERTES_DEPUIS);
    }
  } catch {
    /* Stockage refusé : l'ordre reste vrai le temps de la visite. */
  }
}