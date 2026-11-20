import { entreprises, type Entreprise, type Trade } from '@/mocks/entreprises';

/**
 * Le second niveau de précision d'un type d'établissement : « impression
 * offset », « impression numérique », « sérigraphie »… Chaque spécialité est
 * écrite `métier.spécialité`, telle qu'elle circule dans l'adresse, dans la
 * mémoire du répertoire et dans le menu de la barre de filtres.
 */
export type Specialite = string;

type Def = { key: Specialite; mots: string[] };

/**
 * Ce que chaque famille d'établissement sait préciser. L'ordre est celui du
 * menu ; les compteurs du périmètre le réordonnent ensuite du plus représenté
 * au moins représenté, sans jamais masquer une entrée.
 *
 * Les mots sont cherchés dans le vocabulaire déjà publié sur les fiches —
 * savoir-faire, capacité, présentation, catalogue — dans les trois langues.
 * Aucune fiche n'a donc été réécrite pour ce second niveau : il lit ce que les
 * ateliers déclarent déjà.
 */
const DEFS: Record<Trade, Def[]> = {
  impression: [
    { key: 'impression.offset', mots: ['offset', 'أوفست', 'heatset'] },
    {
      key: 'impression.numerique',
      mots: ['numerique', 'digital', 'toner', 'jet d\'encre', 'رقمي', 'ليزر', 'ليزري'],
    },
    { key: 'impression.serigraphie', mots: ['serigraphie', 'screen print', 'سيريغراف', 'سلكية'] },
    {
      key: 'impression.grandFormat',
      mots: ['grand format', 'bache', 'signaletique', 'enseigne', 'vitrophanie', 'لافتة', 'قماش مشمع'],
    },
    { key: 'impression.reliure', mots: ['reliure', 'dos colle', 'piqûre', 'piqure', 'تجليد'] },
  ],
  edition: [
    {
      key: 'edition.litterature',
      mots: ['roman', 'litterature', 'littérature', 'poesie', 'poésie', 'essai', 'رواية', 'أدب', 'شعر'],
    },
    { key: 'edition.scolaire', mots: ['scolaire', 'manuel', 'universitaire', 'pedagogique', 'مدرسي', 'جامعي'] },
    { key: 'edition.jeunesse', mots: ['jeunesse', 'album', 'enfants', 'أطفال', 'طفولة', 'شباب'] },
    { key: 'edition.beauxLivres', mots: ['beau livre', 'beaux livres', 'patrimoine', 'photographie', 'فني', 'تراث'] },
    { key: 'edition.traduction', mots: ['traduction', 'traduit', 'ترجمة'] },
  ],
  librairie: [
    { key: 'librairie.universitaire', mots: ['universitaire', 'fonds universitaire', 'academique', 'جامعي'] },
    { key: 'librairie.jeunesse', mots: ['jeunesse', 'scolaire', 'enfants', 'أطفال', 'مدرسي'] },
    { key: 'librairie.litterature', mots: ['litterature', 'littérature', 'roman', 'أدب', 'رواية'] },
    { key: 'librairie.papeterie', mots: ['papeterie', 'fourniture', 'قرطاسية', 'أدوات مكتبية'] },
  ],
  faconnage: [
    { key: 'faconnage.reliure', mots: ['reliure', 'dos colle', 'dos carre', 'piqûre', 'piqure', 'تجليد'] },
    { key: 'faconnage.dorure', mots: ['dorure', 'gaufrage', 'foil', 'تذهيب', 'كبس'] },
    { key: 'faconnage.pelliculage', mots: ['pelliculage', 'laminage', 'vernis', 'تغليف', 'ورنيش'] },
    { key: 'faconnage.decoupe', mots: ['decoupe', 'pliage', 'massicot', 'قص', 'طي'] },
  ],
  communication: [
    { key: 'communication.identite', mots: ['identite', 'logo', 'charte', 'packaging', 'هوية', 'شعار'] },
    { key: 'communication.web', mots: ['web', 'site', 'numerique', 'رقمي', 'موقع'] },
    { key: 'communication.campagnes', mots: ['campagne', 'strategie', 'print', 'حملة', 'استراتيجية'] },
    { key: 'communication.photo', mots: ['photo', 'video', 'reportage', 'تصوير', 'فيديو'] },
  ],
  fournisseurs: [
    { key: 'fournisseurs.papier', mots: ['papier', 'carton', 'couché', 'ورق', 'كرتون'] },
    { key: 'fournisseurs.encres', mots: ['encre', 'أحبار', 'حبر'] },
    { key: 'fournisseurs.consommables', mots: ['consommable', 'plaque', 'ctp', 'مستهلكات', 'ألواح'] },
    { key: 'fournisseurs.machines', mots: ['machine', 'presse', 'آلة', 'ماكينة'] },
  ],
  bibliotheque: [
    {
      key: 'bibliotheque.patrimoine',
      mots: ['patrimonial', 'patrimoine', 'manuscrit', 'manuscrits', 'presse ancienne', 'تراث', 'مخطوط'] ,
    },
    {
      key: 'bibliotheque.universitaire',
      mots: ['universitaire', 'these', 'thèses', 'recherche', 'academique', 'جامعي', 'أطروحات', 'بحث'],
    },
    { key: 'bibliotheque.jeunesse', mots: ['jeunesse', 'enfants', 'scolaire', 'lecture jeunesse', 'أطفال', 'مدرسي', 'شباب'] },
    {
      key: 'bibliotheque.numerique',
      mots: ['numerique', 'numérisation', 'numerisation', 'bases en ligne', 'liseuse', 'رقمي', 'رقمنة', 'قواعد'],
    },
  ],
  ecrivain: [
    {
      key: 'ecrivain.biographie',
      mots: ['recit de vie', 'récit de vie', 'biographie', 'memoires', 'mémoires', 'famille', 'سيرة', 'ذاكرة', 'مذكرات'],
    },
    {
      key: 'ecrivain.ghostwriting',
      mots: ['plume', 'preter-plume', 'prête-plume', 'redaction', 'rédaction', 'reeducation', 'manuscrit', 'كتابة', 'مخطوط'],
    },
    {
      key: 'ecrivain.ateliers',
      mots: ['atelier', 'ateliers', 'formation', 'enseignants', 'ecriture creative', 'écriture créative', 'ورشة', 'ورشات', 'تكوين'],
    },
    {
      key: 'ecrivain.scenario',
      mots: ['scenario', 'scénario', 'documentaire', 'podcast', 'discours', 'fiction', 'سيناريو', 'وثائقي', 'بودكاست'],
    },
  ],
};

/** Accent-blind, case-blind form, so « Sérigraphie » and « serigraphie » meet. */
function plat(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Le vocabulaire publié par une fiche, dans les trois langues. */
function texteDe(e: Entreprise): string {
  const parts: string[] = [
    e.capacity.fr, e.capacity.ar, e.capacity.en ?? '',
    e.blurb.fr, e.blurb.ar, e.blurb.en ?? '',
  ];
  e.services.forEach((s) => parts.push(s.fr, s.ar, s.en ?? ''));
  e.catalogue.forEach((c) => parts.push(c.title.fr, c.title.ar, c.title.en ?? '', c.spec));
  return plat(parts.join(' '));
}

const PAR_ENTREPRISE = new Map<string, Specialite[]>();
let computed = false;

function compute() {
  entreprises.forEach((e) => {
    const texte = texteDe(e);
    const trouvees = (DEFS[e.trade] ?? [])
      .filter((def) => def.mots.some((mot) => mot.length >= 3 && texte.includes(plat(mot))))
      .map((def) => def.key);
    PAR_ENTREPRISE.set(e.id, trouvees);
  });
  computed = true;
}

/** Les spécialités qu'une fiche déclare vraiment, dans l'ordre du menu. */
export function specialitesDe(e: Entreprise): Specialite[] {
  if (!computed) compute();
  return PAR_ENTREPRISE.get(e.id) ?? [];
}

/** Les spécialités d'un type, dans l'ordre où le menu les ouvre. */
export function specialitesParTrade(trade: Trade | string): Specialite[] {
  const defs = DEFS[trade as Trade];
  return defs ? defs.map((def) => def.key) : [];
}

/** Le type auquel une spécialité appartient, "" quand la clé est inconnue. */
export function tradeDeSpecialite(spec: Specialite): string {
  return spec.includes('.') ? spec.split('.')[0] : '';
}