/**
 * Les pays dont la feuille a déjà été emportée : la carte s'en souvient sur
 * l'appareil, sans rien écrire au compte — un export CSV est une feuille
 * téléchargée, pas une donnée du répertoire.
 */
const KEY = 'paperatlas:cmaps:csvExport';

/** L'heure du dernier départ de feuille, gardée à côté des codes : la carte
 *  peut alors dire depuis combien de temps rien n'a été emporté. */
const AT_KEY = 'paperatlas:cmaps:csvExportAt';

/** L'heure de départ de chaque pays, en millisecondes : la carte s'en sert pour
 *  ne garder que les feuilles parties aujourd'hui. */
const AT_BY_CODE_KEY = 'paperatlas:cmaps:csvExportAtByCode';

/** Combien de feuilles ont été copiées plutôt que téléchargées : le compteur
 *  de la carte peut alors distinguer un export emporté d'un export recopié
 *  pour un collègue. */
const COPY_KEY = 'paperatlas:cmaps:csvCopied';

/** Le même jour, à l'heure locale de l'appareil. */
function memeJour(a: number, b: number): boolean {
  const left = new Date(a);
  const right = new Date(b);
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

/** Codes des pays déjà exportés, dans l'ordre où ils ont été emportés. */
export function readExportedCodes(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((code): code is string => typeof code === 'string' && code.length > 0);
  } catch {
    return [];
  }
}

/**
 * L'heure de départ de chaque pays, en millisecondes : la carte s'en sert pour
 * ne garder que les feuilles parties aujourd'hui.
 */
export function readExportedAt(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(AT_BY_CODE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    Object.entries(parsed as Record<string, unknown>).forEach(([code, value]) => {
      const stamp = Number(value);
      if (!code || !Number.isFinite(stamp) || stamp <= 0) return;
      out[code] = stamp;
    });
    return out;
  } catch {
    return {};
  }
}

/**
 * Les pays dont la feuille est partie aujourd'hui, à l'heure locale de
 * l'appareil : la carte s'ouvre sur le départ du jour, pas sur celui d'hier.
 */
export function readExportedToday(now = Date.now()): string[] {
  return Object.entries(readExportedAt())
    .filter(([, stamp]) => memeJour(stamp, now))
    .map(([code]) => code);
}

/**
 * Le lundi 00:00 de la semaine en cours, à l'heure locale de l'appareil : un
 * export du dimanche soir appartient à la semaine qui s'achève, pas à celle
 * qui commence.
 */
function debutSemaine(now: number): number {
  const jour = new Date(now);
  jour.setHours(0, 0, 0, 0);
  const depuisLundi = (jour.getDay() + 6) % 7;
  jour.setDate(jour.getDate() - depuisLundi);
  return jour.getTime();
}

/**
 * Les pays dont la feuille est partie cette semaine — depuis lundi, à l'heure
 * locale de l'appareil : la ligne du panneau dit le départ de la semaine, pas
 * seulement celui du jour.
 */
export function readExportedWeek(now = Date.now()): string[] {
  const depuis = debutSemaine(now);
  return Object.entries(readExportedAt())
    .filter(([, stamp]) => stamp >= depuis)
    .map(([code]) => code);
}

/**
 * Combien de feuilles ont été copiées : chaque copie de la liste — du jour ou
 * entière — compte une fois. Le chiffre se lit à côté du total, pour ne pas
 * confondre ce qui a été téléchargé avec ce qui a été recopié.
 */
export function readCopiedCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(COPY_KEY);
    if (!raw) return 0;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

/**
 * Une feuille vient d'être copiée : le compte avance d'un cran et la nouvelle
 * valeur est rendue, pour que le compteur se relise sans recharger la page.
 */
export function markCopiedSheet(): number {
  const next = readCopiedCount() + 1;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COPY_KEY, String(next));
    } catch {
      /* storage unavailable — the counter simply starts over next visit */
    }
  }
  return next;
}

/**
 * Repartir de zéro : la mémoire des feuilles emportées s'efface, et le compteur
 * de la carte avec elle. Les fichiers déjà téléchargés restent sur l'appareil —
 * une feuille partie reste partie, la carte cesse seulement de la compter.
 */
export function clearExportedCodes(): string[] {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(KEY);
      window.localStorage.removeItem(AT_KEY);
      window.localStorage.removeItem(AT_BY_CODE_KEY);
      window.localStorage.removeItem(COPY_KEY);
    } catch {
      /* storage unavailable — nothing was ever written to erase */
    }
  }
  return [];
}

/**
 * Une feuille vient de partir : ses pays entrent dans la mémoire, chacun une
 * seule fois. Rend la liste à jour, pour que le compteur se relise sans
 * attendre un rechargement.
 */
export function markExportedCodes(codes: string[]): string[] {
  const current = readExportedCodes();
  const next = [...current];
  codes.forEach((code) => {
    if (!code || next.includes(code)) return;
    next.push(code);
  });
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      /* Une feuille vient de partir : l'heure du départ est notée, même quand
         ses pays étaient déjà comptés — le dernier export est un geste, pas
         un nouveau pays. */
      const stamp = Date.now();
      window.localStorage.setItem(AT_KEY, String(stamp));
      /* Et chaque pays emporté garde sa propre heure : la carte peut alors
         garder les seules feuilles parties aujourd'hui, sans confondre un
         export d'hier avec celui du matin. */
      const parPays = readExportedAt();
      codes.forEach((code) => {
        if (code) parPays[code] = stamp;
      });
      window.localStorage.setItem(AT_BY_CODE_KEY, JSON.stringify(parPays));
    } catch {
      /* storage unavailable — the counter simply starts over next visit */
    }
  }
  return next;
}

/**
 * L'heure du dernier export, en millisecondes, ou null quand aucune feuille
 * n'est jamais partie — la carte n'écrit alors aucun temps écoulé plutôt
 * qu'un « il y a 0 minute » qui ne voudrait rien dire.
 */
export function readLastExportAt(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AT_KEY);
    if (!raw) return null;
    const stamp = Number(raw);
    if (!Number.isFinite(stamp) || stamp <= 0) return null;
    return stamp;
  } catch {
    return null;
  }
}