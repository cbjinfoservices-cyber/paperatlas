import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { annonces, annonceCats } from '@/mocks/annonces';
import { emplois, contracts } from '@/mocks/emplois';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';
import { nomPays, paysDe, tallyPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { readDoorMemory, saveDoorMemory } from '@/lib/navDoorMemory';
import { readBoardSort, saveBoardSort, type BoardSort } from '@/lib/boardSortMemory';
import { phraseFamilleDepassee, phrasePortesTrouvees } from '@/lib/navDoorsLeft';

/** Une porte de second niveau : un pays, une rubrique, une famille. */
export type NavDoorSub = {
  id: string;
  label: string;
  href: string;
  count?: number;
  /** Le petit mot après le compte : « 12 rég. ». */
  hint?: string;
  /** L'icône du bloc qu'elle ouvre au cran suivant. */
  panelIcon?: string;
  /** Un cran de plus : les régions d'un pays, les rubriques d'un pays. */
  subs?: NavDoorSub[];
  /** La porte du pays entier : elle rend la région sans rendre le pays. */
  allHref?: string;
  /** Les lignes que le pays entier tient, tous crans confondus : le chiffre
      se lit sur la porte avant de l'ouvrir, pour choisir en connaissance. */
  allCount?: number;
  /** C'est déjà la région que le tableau lit : la pastille se marque. */
  current?: boolean;
};

/** Un tri à deux positions, posé en tête du dépliant. */
export type NavDoorSort = {
  label: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onPick: (id: string) => void;
};

/** Une porte de premier niveau, et ce qu'elle déplie. */
export type NavDoorItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  hint?: string;
  current?: boolean;
  /** Rien dans le périmètre lu : le trait passe en pointillés. */
  zero?: boolean;
  /** Comment lire la suite : par rubrique, ou pays par pays. */
  sort?: NavDoorSort;
  /** Le menu s'ouvre sur beaucoup de portes : la recherche paraît d'office,
      sans attendre que la liste des portes ait elle-même grandi. */
  searchOnOpen?: boolean;
  subs: NavDoorSub[];
};

/** Accent-blind, case-blind : « Émirats » et « emirats » se rencontrent. */
export function plat(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Le souvenir d'un menu est rangé sous ses portes : deux menus différents ne
    se volent pas leur dépliant. */
function memoryKeyOf(items: NavDoorItem[]): string {
  return `pa.navDoor.${items.map((item) => item.id).join('.')}`;
}

type Props = {
  items: NavDoorItem[];
  variant?: 'row' | 'panel' | 'sheet';
  /** Au-delà de ce nombre de portes, la recherche paraît dans le menu. */
  searchFrom?: number;
  /** Le mot du champ, quand le menu ne parle pas de « types » mais de
      rubriques ou de contrats. */
  searchPlaceholder?: string;
  /** Une porte d'entrée posée avant la liste : « Tout l'annuaire ». */
  lead?: { label: string; hint: string; href: string; current?: boolean };
  onNavigate?: () => void;
  /** Une rubrique vient de se replier : le nombre de portes qu'elle tenait.
      La flèche du bas s'en sert pour dire ce que la liste vient de perdre,
      au lieu de laisser le compte tomber sans explication. */
  onFold?: (doors: number) => void;
};

/**
 * Le menu à trois crans de la barre : une liste de portes, chacune ouvrant
 * ses pays ou ses rubriques, et chaque pays ouvrant à son tour ses régions.
 *
 * Sous un type d'établissement : le pays, puis ses régions — on choisit donc
 * là où le métier bat avant d'ouvrir la page. Sous une rubrique d'annonce ou
 * un contrat d'emploi, le pays ; et quand le tableau se lit pays par pays,
 * chaque pays ouvre ses rubriques. Un seul mécanisme sert les trois menus :
 * la barre ne parle pas deux langues.
 *
 * Le chemin déplié est retenu pendant la visite : un aller-retour vers une
 * fiche retrouve le même type ouvert, le même pays, la même région.
 *
 * La recherche lit les trois crans — taper « maroc » ouvre les types qui
 * tiennent ce pays, taper « librairie » garde le type, taper « oran » atteint
 * la région.
 */
export default function NavDoorList({
  items,
  variant = 'panel',
  searchFrom = 5,
  searchPlaceholder,
  lead,
  onNavigate,
  onFold,
}: Props) {
  const { t } = useLang();
  const memoryKey = memoryKeyOf(items);
  /* Le dépliant est lu au premier rendu, puis écrit à chaque geste : le menu
     s'ouvre sur ce qu'il montrait la dernière fois. */
  const [openId, setOpenId] = useState<string | null>(() => readDoorMemory(memoryKey).door || null);
  const [openPath, setOpenPath] = useState<string[]>(() => {
    const memory = readDoorMemory(memoryKey);
    return [memory.sub, memory.deep].filter(Boolean);
  });
  const [query, setQuery] = useState('');
  const base = useId();
  /* Le dépliant de chaque porte, gardé pour pouvoir compter ses portes à
     l'instant où il se referme : elles quittent la liste d'un seul geste. */
  const subsRef = useRef<Record<string, HTMLDivElement | null>>({});
  /* La liste elle-même : pendant une recherche, c'est sur elle que se compte
     ce qui se tient au-delà du premier filet de famille — le chiffre se relève
     sur les portes réellement rendues, jamais sur une addition écrite à la
     main. */
  const listRef = useRef<HTMLDivElement | null>(null);
  const [beyondSaid, setBeyondSaid] = useState('');

  useEffect(() => {
    saveDoorMemory(memoryKey, openId ?? '', openPath[0] ?? '', openPath[1] ?? '');
  }, [memoryKey, openId, openPath]);

  /* Une porte ou une suite disparue — le menu a changé de nature — ne garde
     pas son souvenir d'ouverture. */
  useEffect(() => {
    if (!openId) return;
    const item = items.find((row) => row.id === openId);
    if (!item) {
      setOpenId(null);
      setOpenPath([]);
      return;
    }
    if (openPath[0] && !item.subs.some((sub) => sub.id === openPath[0])) setOpenPath([]);
  }, [items, openId, openPath]);

  const needle = plat(query.trim());
  const searching = needle.length > 0;
  const sheet = variant === 'sheet';

  /** La recherche garde le type quand son nom répond, et le réduit à ses
      pays ou régions quand ce sont eux qui répondent. */
  const shown = useMemo(() => {
    if (!needle) return items;
    const filtrer = (subs: NavDoorSub[]): NavDoorSub[] => subs.reduce<NavDoorSub[]>((acc, sub) => {
      if (plat(sub.label).includes(needle)) {
        acc.push(sub);
        return acc;
      }
      const deep = sub.subs ? filtrer(sub.subs) : [];
      if (deep.length) acc.push({ ...sub, subs: deep });
      return acc;
    }, []);
    return items.reduce<NavDoorItem[]>((acc, item) => {
      if (plat(item.label).includes(needle)) {
        acc.push(item);
        return acc;
      }
      const subs = filtrer(item.subs);
      if (subs.length) acc.push({ ...item, subs });
      return acc;
    }, []);
  }, [items, needle]);

  /* La famille qui vit au-delà du filet : la seconde lue, celle que le mot de
     couture introduit et dont les pastilles se tiennent après lui. C'est elle
     que la feuille nomme quand la recherche franchit son filet — la voix
     basse du panneau nomme donc la même, à la même source, pour que les deux
     surfaces ne disent pas deux familles à la fois. Une seule famille
     répondante n'a pas de filet à franchir : la voix dit alors le total (voir
     plus bas), jamais un nom. */
  const seamFamily = shown.length > 1 ? shown[1].label : '';
  /* Combien de familles répondent : une seule, ou plusieurs. C'est ce nombre
     qui décide de la voix basse — au-delà du premier filet, ou sur toute la
     liste trouvée. */
  const seamFamilies = shown.length;

  /* La recherche paraît sur la longueur du menu — mais aussi d'office quand
     une porte s'ouvre sur beaucoup de pays : c'est là qu'on cherche, avant
     même que la liste des portes ait eu le temps de s'allonger. */
  const showSearch = items.some((item) => item.searchOnOpen) || items.length > searchFrom;
  const searchWord = searchPlaceholder ?? t('navm.dirSearch');
  const rowCls = sheet ? 'nav-mobile-item' : 'nav-more-item';

  /* Pendant une recherche, les deux tableaux se lisent l'un après l'autre :
     un mot de couture nomme la famille de ce qui suit, si bien qu'un pays
     trouvé ne flotte plus entre deux familles. Une voix basse dit en plus
     combien de portes trouvées se tiennent au-delà du premier filet ; elle
     attend que la frappe se pose, ne dit rien à zéro, et se relit sur la liste
     rendue au lieu d'une soustraction.

     Quand une seule famille répond, il n'y a pas de filet à nommer — et la
     voix se taisait donc tout à fait, alors que la recherche avait bien trouvé
     quelque chose. Elle dit maintenant le total des portes trouvées, du même
     mot que la feuille (« 3 portes trouvées »), relevé sur les portes
     réellement rendues. La pastille « Tout » n'entre dans aucun des deux
     comptes : elle n'est pas un résultat, mais une sortie. */
  useEffect(() => {
    if (!searching) {
      setBeyondSaid('');
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const root = listRef.current;
      const beyond = root
        ? root.querySelectorAll('[data-beyond="1"] a:not(.nav-door-chip.is-all)').length
        : 0;
      if (beyond > 0) {
        setBeyondSaid(phraseFamilleDepassee(seamFamily, beyond, t));
        return;
      }
      if (seamFamilies === 1) {
        const total = root
          ? root.querySelectorAll('.nav-door-items a:not(.nav-door-chip.is-all)').length
          : 0;
        setBeyondSaid(total > 0 ? phrasePortesTrouvees(total, t) : '');
        return;
      }
      setBeyondSaid('');
    }, 420);
    return () => window.clearTimeout(timer);
  }, [searching, needle, seamFamily, seamFamilies, t]);

  const toggleItem = (id: string) => {
    if (openId === id) {
      /* Avant de replier : les portes que la rubrique tenait encore. Le compte
         des portes restantes va tomber de leur nombre, et c'est ce chiffre-là
         que la flèche annoncera — elle explique ainsi ce qu'elle a perdu. */
      const panel = subsRef.current[id];
      const doors = panel ? panel.querySelectorAll('a').length : 0;
      setOpenId(null);
      setOpenPath([]);
      if (doors > 0) onFold?.(doors);
      return;
    }
    setOpenId(id);
    setOpenPath([]);
  };

  /** Un cran de plus : le pays ou la rubrique s'ouvre sur sa suite. */
  const toggleSub = (subId: string) => {
    setOpenPath((prev) => (prev[0] === subId ? [] : [subId]));
  };

  /** Le cran d'après : les régions d'un pays, les rubriques d'un pays. */
  const toggleDeep = (deepId: string) => {
    setOpenPath((prev) => {
      if (!prev[0]) return prev;
      return prev[1] === deepId ? [prev[0]] : [prev[0], deepId];
    });
  };

  return (
    <div className={`nav-doorlist nav-doorlist--${variant}`} ref={listRef}>
      {showSearch && (
        <div className="nav-door-search">
          <i className="ri-search-line" aria-hidden="true"></i>
          <input
            type="search"
            className="text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchWord}
            aria-label={searchWord}
            autoComplete="off"
          />
          {searching && (
            <button
              type="button"
              className="nav-door-clear"
              onClick={() => setQuery('')}
              aria-label={t('navm.dirSearchClear')}
              title={t('navm.dirSearchClear')}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          )}
        </div>
      )}

      {lead && !searching && (
        <Link
          to={lead.href}
          role={sheet ? undefined : 'menuitem'}
          className={`${rowCls}${lead.current ? ' is-current' : ''}`}
          aria-current={lead.current ? 'page' : undefined}
          onClick={onNavigate}
        >
          <i className="ri-building-4-line" aria-hidden="true"></i>
          <span className="nav-more-txt">
            <span className="nav-more-label">{lead.label}</span>
            <small>{lead.hint}</small>
          </span>
        </Link>
      )}

      {searching && shown.length === 0 && (
        <p className="nav-door-empty">
          <i className="ri-search-eye-line" aria-hidden="true"></i>
          {t('navm.dirSearchEmpty')} « {query.trim()} »
        </p>
      )}

      <div className="nav-door-items">
        {shown.map((item, index) => {
          /* Pendant une recherche, ce qui répond s'ouvre de lui-même : la
             question posée est déjà la réponse. */
          const open = searching ? item.subs.length > 0 : openId === item.id;
          const panelId = `${base}-${item.id}`;
          const openedSub = open
            ? (searching
              ? item.subs.find((sub) => Boolean(sub.subs && sub.subs.length)) ?? null
              : item.subs.find((sub) => sub.id === openPath[0]) ?? null)
            : null;
          const openedDeep = openedSub && openedSub.subs
            ? (searching
              ? openedSub.subs.find((deep) => Boolean(deep.subs && deep.subs.length)) ?? null
              : openedSub.subs.find((deep) => deep.id === openPath[1]) ?? null)
            : null;
          const deepPanelId = openedSub ? `${panelId}-${openedSub.id}` : '';
          return (
            <div
              className="nav-door-item"
              key={item.id}
              /* Ce qui suit le premier filet : la famille dont les portes
                 trouvées vivent au-delà de la couture. Sert au compte annoncé
                 à voix basse, et posé sur la liste rendue. */
              data-beyond={searching && index > 0 ? '1' : undefined}
            >
              {searching ? (
                /* Le mot de couture, repris de ses trois autres surfaces : la
                   famille qui suit est nommée au même joint, du côté où la
                   lecture commence, et ce n'est pas une porte. Chaque famille
                   trouvée porte donc son nom, la première comprise : une
                   recherche qui répond dans les deux tableaux se lit famille
                   par famille, et le pays trouvé ne flotte plus entre deux. */
                <span className={`nav-door-seam nav-door-seam--${variant}`}>{item.label}</span>
              ) : (
              <div className="nav-door-head">
                <Link
                  to={item.href}
                  role={sheet ? undefined : 'menuitem'}
                  className={[
                    rowCls,
                    item.current ? 'is-current' : '',
                    item.zero ? 'is-zero' : '',
                  ].filter(Boolean).join(' ')}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  <span className="nav-more-txt">
                    <span className="nav-more-label">{item.label}</span>
                    {item.hint && <small>{item.hint}</small>}
                  </span>
                </Link>
                {item.subs.length > 0 && !searching && (
                  <button
                    type="button"
                    role={sheet ? undefined : 'menuitem'}
                    className={`nav-door-toggle${open ? ' is-open' : ''}`}
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={`${item.label} — ${open ? t('navm.subClose') : t('navm.subOpen')}`}
                    title={open ? t('navm.subClose') : t('navm.subOpen')}
                    onClick={() => toggleItem(item.id)}
                  >
                    <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} aria-hidden="true"></i>
                  </button>
                )}
              </div>
              )}
              {open && (
                <div
                  className="nav-door-subs"
                  id={panelId}
                  ref={(node) => {
                    subsRef.current[item.id] = node;
                  }}
                >
                  {item.sort && (
                    <div className="nav-door-sort" role="group" aria-label={item.sort.label}>
                      <span className="nav-door-sort-lab">{item.sort.label}</span>
                      {item.sort.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={item.sort && option.id === item.sort.value ? 'is-on' : ''}
                          aria-pressed={option.id === item.sort?.value}
                          onClick={() => item.sort?.onPick(option.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                      {/* Une petite croix au bout du tri : l'ordre habituel
                          revient d'un seul geste, sans avoir à retrouver la
                          position de départ dans la rangée. */}
                      <button
                        type="button"
                        className="nav-door-sort-clear"
                        disabled={item.sort.value === item.sort.options[0]?.id}
                        aria-label={t('navm.sortClear')}
                        title={t('navm.sortClear')}
                        onClick={() => item.sort?.onPick(item.sort?.options[0]?.id ?? '')}
                      >
                        <i className="ri-close-line" aria-hidden="true"></i>
                      </button>
                    </div>
                  )}
                  <Link
                    to={item.href}
                    role={sheet ? undefined : 'menuitem'}
                    className="nav-door-chip is-all"
                    onClick={onNavigate}
                  >
                    <i className="ri-apps-2-line" aria-hidden="true"></i>
                    {t('navm.dirSubAll')}
                  </Link>
                  {item.subs.map((sub) => {
                    const hasDeep = Boolean(sub.subs && sub.subs.length > 0);
                    const subOpen = openedSub?.id === sub.id;
                    return (
                      <span className="nav-door-subitem" key={sub.id}>
                        <Link
                          to={sub.href}
                          role={sheet ? undefined : 'menuitem'}
                          className={`nav-door-chip${subOpen ? ' is-open' : ''}`}
                          onClick={onNavigate}
                        >
                          <span>{sub.label}</span>
                          {typeof sub.count === 'number' && (
                            <b className="nav-door-chip-n">{sub.count}</b>
                          )}
                          {sub.hint && <small className="nav-door-chip-reg">{sub.hint}</small>}
                        </Link>
                        {hasDeep && !searching && (
                          <button
                            type="button"
                            className={`nav-door-more${subOpen ? ' is-open' : ''}`}
                            aria-expanded={subOpen}
                            aria-controls={`${panelId}-${sub.id}`}
                            aria-label={`${sub.label} — ${subOpen ? t('navm.subClose') : t('navm.subOpenSuite')}`}
                            title={subOpen ? t('navm.subClose') : t('navm.subOpenSuite')}
                            onClick={() => toggleSub(sub.id)}
                          >
                            <i className={subOpen ? 'ri-subtract-line' : 'ri-add-line'} aria-hidden="true"></i>
                          </button>
                        )}
                      </span>
                    );
                  })}
                  {openedSub && openedSub.subs && openedSub.subs.length > 0 && (
                    <div className="nav-door-countries" id={deepPanelId}>
                      <span className="nav-door-countries-lab">
                        <i className={openedSub.panelIcon ?? 'ri-earth-line'} aria-hidden="true"></i>
                        {openedSub.label}
                      </span>
                      {openedSub.subs.map((deep) => {
                        const hasMore = Boolean(deep.subs && deep.subs.length > 0);
                        const deepOpen = openedDeep?.id === deep.id;
                        return (
                          <span className="nav-door-subitem" key={deep.id}>
                            <Link
                              to={deep.href}
                              role={sheet ? undefined : 'menuitem'}
                              className={`nav-door-chip is-country${deepOpen ? ' is-open' : ''}`}
                              onClick={onNavigate}
                            >
                              <span>{deep.label}</span>
                              {typeof deep.count === 'number' && (
                                <b className="nav-door-chip-n">{deep.count}</b>
                              )}
                              {deep.hint && <small className="nav-door-chip-reg">{deep.hint}</small>}
                            </Link>
                            {hasMore && !searching && (
                              <button
                                type="button"
                                className={`nav-door-more${deepOpen ? ' is-open' : ''}`}
                                aria-expanded={deepOpen}
                                aria-controls={`${deepPanelId}-${deep.id}`}
                                aria-label={`${deep.label} — ${deepOpen ? t('navm.subClose') : t('navm.subOpenSuite')}`}
                                title={deepOpen ? t('navm.subClose') : t('navm.subOpenSuite')}
                                onClick={() => toggleDeep(deep.id)}
                              >
                                <i className={deepOpen ? 'ri-subtract-line' : 'ri-add-line'} aria-hidden="true"></i>
                              </button>
                            )}
                          </span>
                        );
                      })}
                      {openedDeep && openedDeep.subs && (
                        <div className="nav-door-regions" id={`${deepPanelId}-${openedDeep.id}`}>
                          <span className="nav-door-countries-lab">
                            <i className="ri-map-pin-line" aria-hidden="true"></i>
                            {openedDeep.label}
                          </span>
                          {/* La porte du pays entier : les régions se lisent
                              d'abord, et celle-ci sort de la région sans
                              sortir du pays. */}
                          {openedDeep.allHref && (
                            <Link
                              to={openedDeep.allHref}
                              role={sheet ? undefined : 'menuitem'}
                              className="nav-door-chip is-all is-country"
                              onClick={onNavigate}
                            >
                              <i className="ri-map-2-line" aria-hidden="true"></i>
                              {t('tradePage.allCountry')}
                              {typeof openedDeep.allCount === 'number' && (
                                <b className="nav-door-chip-n">{openedDeep.allCount}</b>
                              )}
                            </Link>
                          )}
                          {openedDeep.subs.map((region) => (
                            <Link
                              key={region.id}
                              to={region.href}
                              role={sheet ? undefined : 'menuitem'}
                              className={`nav-door-chip is-country${region.current ? ' is-current' : ''}`}
                              aria-current={region.current ? 'true' : undefined}
                              onClick={onNavigate}
                            >
                              <span>{region.label}</span>
                              {typeof region.count === 'number' && (
                                <b className="nav-door-chip-n">{region.count}</b>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* La voix basse des portes trouvées au-delà du premier filet : une
          zone de statut présente mais vide quand rien ne la mérite. */}
      <p className="nav-end-said" role="status" aria-live="polite">{beyondSaid}</p>
    </div>
  );
}

/** Un tableau compte comme « nombreux » à partir de ce nombre de pays : la
    recherche paraît alors d'elle-même dans son menu. */
const MANY_PAYS = 4;

type Board = 'annonces' | 'emplois';

/**
 * Les deux tableaux de la barre, avec leurs rubriques : « Annonces » déplie le
 * matériel, le papier, les services et les recherches ; « Emplois » déplie les
 * quatre contrats. Chaque rubrique est l'adresse du tableau déjà filtré, et le
 * pays — comme la région — déjà lu reste dans le lien.
 *
 * Sous chaque rubrique, ses pays s'ouvrent à leur tour. Et les deux tableaux
 * peuvent se lire dans l'autre sens : pays par pays, chaque pays ouvrant alors
 * ses rubriques. Le tri n'est qu'un ordre de lecture des mêmes lignes — les
 * deux chemins mènent au même tableau filtré.
 *
 * Ce choix « lire par » est retenu sur l'appareil, comme la rubrique lue :
 * le menu des annonces se rouvre dans l'ordre où il a été laissé.
 */
export function useBoardMenuItems(hints: {
  annonces: string;
  emplois: string;
  zeroAnnonces?: boolean;
  zeroEmplois?: boolean;
}): NavDoorItem[] {
  const { t, lang } = useLang();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const onAnnonces = pathname.startsWith('/annonces');
  const onEmplois = pathname.startsWith('/emplois');
  const params = new URLSearchParams(search);
  /* Le pays et la région ne sont repris que du tableau où l'on se tient :
     ailleurs, ils ne diraient rien du tableau qu'on ouvre. */
  const pays = onAnnonces || onEmplois ? params.get('pays') ?? '' : '';
  const wilaya = onAnnonces || onEmplois ? params.get('wilaya') ?? '' : '';
  const cat = onAnnonces ? params.get('cat') ?? '' : '';
  const contrat = onEmplois ? params.get('contrat') ?? '' : '';

  /* L'ordre de lecture retenu pour chaque tableau, sur l'appareil : il suit
     la visite suivante, comme la rubrique lue revient d'elle-même. */
  const [pref, setPref] = useState<Record<Board, BoardSort>>(() => ({
    annonces: readBoardSort('annonces'),
    emplois: readBoardSort('emplois'),
  }));

  /* Une adresse qui dit l'ordre l'emporte sur la mémoire — et l'écrit à son
     tour, pour que le menu la reprenne en quittant le tableau. Un `?sort=`
     absent ne dit rien : il ne doit pas effacer le souvenir. */
  const sortFromUrl = (board: Board, onBoard: boolean): BoardSort | null => {
    if (!onBoard || !params.has('sort')) return null;
    return params.get('sort') === 'pays' ? 'pays' : 'rubrique';
  };
  const urlAnnonces = sortFromUrl('annonces', onAnnonces);
  const urlEmplois = sortFromUrl('emplois', onEmplois);

  useEffect(() => {
    if (!urlAnnonces) return;
    saveBoardSort('annonces', urlAnnonces);
    setPref((prev) => (prev.annonces === urlAnnonces ? prev : { ...prev, annonces: urlAnnonces }));
  }, [urlAnnonces]);

  useEffect(() => {
    if (!urlEmplois) return;
    saveBoardSort('emplois', urlEmplois);
    setPref((prev) => (prev.emplois === urlEmplois ? prev : { ...prev, emplois: urlEmplois }));
  }, [urlEmplois]);

  const annoncesByPays = (urlAnnonces ?? pref.annonces) === 'pays';
  const emploisByPays = (urlEmplois ?? pref.emplois) === 'pays';

  /** L'ordre de lecture d'un tableau : celui de l'adresse, ou celui retenu. */
  const byPaysOf = (board: Board) => (board === 'annonces' ? annoncesByPays : emploisByPays);

  const href = (board: Board, key: string, value: string) => {
    const next = new URLSearchParams();
    if (byPaysOf(board)) next.set('sort', 'pays');
    if (pays) next.set('pays', pays);
    if (wilaya) next.set('wilaya', wilaya);
    if (value) next.set(key, value);
    const query = next.toString();
    return query ? `/${board}?${query}` : `/${board}`;
  };

  /* Un pays choisi dans la liste est explicite : il est choisi, pas hérité.
     La région, elle, ne suit que le pays qu'elle habite — jamais un homonyme
     ailleurs. */
  const paysHref = (board: Board, key: string, value: string, code: string) => {
    const next = new URLSearchParams();
    if (byPaysOf(board)) next.set('sort', 'pays');
    next.set(key, value);
    if (code) next.set('pays', code);
    if (wilaya && code && code === pays) next.set('wilaya', wilaya);
    return `/${board}?${next.toString()}`;
  };

  /** L'adresse du pays entier : la rubrique lue et l'ordre de lecture
      restent, la région est rendue. C'est la porte qui permet de sortir
      d'Oran sans sortir d'Algérie, quand le pays, lui, garde la région. */
  const paysSeulHref = (board: Board, key: string, value: string, code: string): string => {
    const next = new URLSearchParams();
    if (byPaysOf(board)) next.set('sort', 'pays');
    next.set('pays', code);
    if (value) next.set(key, value);
    return `/${board}?${next.toString()}`;
  };

  /** L'adresse d'une région dans le tableau : le pays qu'elle habite, la
      rubrique lue, et l'ordre de lecture choisi. Une région ne se transporte
      jamais d'un pays à l'autre. */
  const regionHref = (
    board: Board,
    code: string,
    key: string,
    value: string,
    region: string,
  ): string => {
    const next = new URLSearchParams();
    if (byPaysOf(board)) next.set('sort', 'pays');
    next.set('pays', code);
    if (value) next.set(key, value);
    next.set('wilaya', region);
    return `/${board}?${next.toString()}`;
  };

  /** Les régions d'un pays du tableau, comptées sur les lignes déjà lues — le
      pays, et la rubrique quand le cran au-dessus en pose une. La plus fournie
      d'abord, comme dans l'annuaire : on choisit là où le métier bat avant
      d'ouvrir la page, au lieu d'y arriver et de reposer le filtre. */
  const regionsDe = (
    rows: readonly { pays?: string | null; wilaya: string }[],
    code: string,
    hrefOf: (wilaya: string) => string,
  ): NavDoorSub[] => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      if (paysDe(row) !== code) return;
      const where = row.wilaya.trim();
      if (!where) return;
      counts.set(where, (counts.get(where) ?? 0) + 1);
    });
    return Array.from(counts, ([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count || a.region.localeCompare(b.region, 'fr'))
      .map(({ region, count }) => ({
        id: region,
        label: nomRegion(region, lang),
        href: hrefOf(region),
        count,
        /* La région que le tableau lit déjà, dans le pays où elle est lue :
           la pastille se pose comme une porte courante. */
        current: Boolean(wilaya) && code === pays && region === wilaya,
      }));
  };

  /** Les pays d'une rubrique, le plus fourni d'abord — jamais un pays seul.
      Sous chaque pays, un cran de plus : ses régions comptées, dans les deux
      tableaux, pour qu'ils se lisent de la même façon. */
  const paysDeRubrique = (
    board: Board,
    key: string,
    value: string,
    rows: readonly { pays?: string | null; wilaya: string }[],
    totals: Map<string, number>,
  ): NavDoorSub[] | undefined => {
    const counts = tallyPays(rows);
    if (counts.length < 2) return undefined;
    return counts.map((row) => {
      const regions = regionsDe(rows, row.code, (wilaya) => regionHref(board, row.code, key, value, wilaya));
      return {
        id: row.code,
        label: nomPays(row.code, lang),
        href: paysHref(board, key, value, row.code),
        count: row.count,
        hint: regions.length
          ? t('navm.regionShort').replace('{n}', String(regions.length))
          : undefined,
        panelIcon: regions.length ? 'ri-map-pin-line' : 'ri-earth-line',
        /* Le pays que le tableau lit déjà se marque parmi ses voisins, comme
           la région lue sous lui — jamais pour un pays qui n'est pas ouvert. */
        current: Boolean(pays) && row.code === pays,
        /* La pastille du pays garde la région lue ; cette porte-ci la rend,
           sans rendre le pays ni la rubrique. Elle annonce le compte du pays
           entier, toutes rubriques confondues. */
        allHref: regions.length ? paysSeulHref(board, key, value, row.code) : undefined,
        allCount: regions.length ? totals.get(row.code) ?? row.count : undefined,
        subs: regions.length ? regions : undefined,
      };
    });
  };

  /** Le tableau lu pays par pays : chaque pays ouvre ses rubriques comptées,
      et chacune mène au tableau filtré deux fois — le pays, la rubrique.
      Sous chaque rubrique, un cran de plus : les régions de ce pays. */
  const parPays = <T extends { pays?: string | null; wilaya: string }>(
    board: Board,
    rows: readonly T[],
    entries: readonly string[],
    keyOf: (row: T) => string,
    labelOf: (entry: string) => string,
    panelIcon: string,
    totals: Map<string, number>,
  ): NavDoorSub[] => tallyPays(rows).map((row) => {
    const ofCountry = rows.filter((item) => paysDe(item) === row.code);
    const rubriques = entries
      .map((entry) => ({ entry, count: ofCountry.filter((item) => keyOf(item) === entry).length }))
      .filter((line) => line.count > 0);
    const field = board === 'annonces' ? 'cat' : 'contrat';
    return {
      id: row.code,
      label: nomPays(row.code, lang),
      href: `/${board}?sort=pays&pays=${row.code}`,
      count: row.count,
      panelIcon,
      /* Le pays lu pays par pays se marque lui aussi, du même point : la liste
         des pays se lit comme celle des régions. */
      current: Boolean(pays) && row.code === pays,
      subs: rubriques.map((line) => {
        const regions = regionsDe(ofCountry, row.code, (wilaya) => regionHref(board, row.code, field, line.entry, wilaya));
        return {
          id: line.entry,
          label: labelOf(line.entry),
          href: `/${board}?sort=pays&pays=${row.code}&${field}=${line.entry}`,
          count: line.count,
          /* Ici le pays se lit rubrique par rubrique : la porte rend la région
             et la rubrique, pour rouvrir le pays entier — et dit d'avance
             combien de lignes ce pays tient au total. */
          allHref: regions.length ? `/${board}?sort=pays&pays=${row.code}` : undefined,
          allCount: regions.length ? totals.get(row.code) ?? row.count : undefined,
          subs: regions.length ? regions : undefined,
        };
      }),
    };
  });

  /** Le tri ne change pas les lignes, seulement l'ordre où on les lit : la
      mémoire prend le choix, et le tableau sous les yeux le suit. */
  const setSort = (board: Board, mode: BoardSort) => {
    setPref((prev) => (prev[board] === mode ? prev : { ...prev, [board]: mode }));
    saveBoardSort(board, mode);
    const onBoard = board === 'annonces' ? onAnnonces : onEmplois;
    /* Ailleurs, le menu seul change d'ordre : les liens qu'il donne le diront. */
    if (!onBoard) return;
    const current = byPaysOf(board);
    if ((mode === 'pays') === current) return;
    const next = new URLSearchParams();
    if (mode === 'pays') next.set('sort', 'pays');
    if (pays) next.set('pays', pays);
    if (wilaya) next.set('wilaya', wilaya);
    const rubrique = board === 'annonces' ? cat : contrat;
    if (rubrique) next.set(board === 'annonces' ? 'cat' : 'contrat', rubrique);
    const query = next.toString();
    navigate(query ? `/${board}?${query}` : `/${board}`, { replace: true });
  };

  const catCounts = new Map<string, number>();
  annonces.forEach((a) => catCounts.set(a.cat, (catCounts.get(a.cat) ?? 0) + 1));
  const contractCounts = new Map<string, number>();
  emplois.forEach((j) => contractCounts.set(j.contract, (contractCounts.get(j.contract) ?? 0) + 1));

  /* Le nombre de pays que chaque tableau tient : c'est lui qui décide si la
     recherche du menu paraît d'office, sans attendre que la liste des portes
     s'allonge. */
  const annoncesPays = tallyPays(annonces);
  const emploisPays = tallyPays(emplois);
  /* Le compte de chaque pays, lu sur tout le tableau : c'est lui que porte
     la porte « Tout ce pays », au-delà de la rubrique ou de la région lue. */
  const annoncesTotals = new Map(annoncesPays.map((row) => [row.code, row.count] as const));
  const emploisTotals = new Map(emploisPays.map((row) => [row.code, row.count] as const));

  return [
    {
      id: 'annonces',
      label: t('nav.annonces'),
      icon: 'ri-megaphone-line',
      href: href('annonces', 'cat', ''),
      hint: hints.annonces,
      current: onAnnonces,
      zero: hints.zeroAnnonces,
      searchOnOpen: annoncesByPays && annoncesPays.length >= MANY_PAYS,
      sort: {
        label: t('navm.sortLabel'),
        value: annoncesByPays ? 'pays' : 'rubrique',
        options: [
          { id: 'rubrique', label: t('navm.sortRubrique') },
          { id: 'pays', label: t('navm.sortPays') },
        ],
        onPick: (mode) => setSort('annonces', mode === 'pays' ? 'pays' : 'rubrique'),
      },
      subs: annoncesByPays
        ? parPays(
          'annonces',
          annonces,
          annonceCats,
          (a) => a.cat,
          (rubrique) => t(CAT_KEY[rubrique]),
          'ri-price-tag-3-line',
          annoncesTotals,
        )
        : annonceCats.map((rubrique) => ({
          id: rubrique,
          label: t(CAT_KEY[rubrique]),
          href: href('annonces', 'cat', rubrique),
          count: catCounts.get(rubrique) ?? 0,
          panelIcon: 'ri-earth-line',
          subs: paysDeRubrique(
            'annonces',
            'cat',
            rubrique,
            annonces.filter((a) => a.cat === rubrique),
            annoncesTotals,
          ),
        })),
    },
    {
      id: 'emplois',
      label: t('nav.emplois'),
      icon: 'ri-briefcase-line',
      href: href('emplois', 'contrat', ''),
      hint: hints.emplois,
      current: onEmplois,
      zero: hints.zeroEmplois,
      searchOnOpen: emploisByPays && emploisPays.length >= MANY_PAYS,
      sort: {
        label: t('navm.sortLabel'),
        value: emploisByPays ? 'pays' : 'rubrique',
        options: [
          { id: 'rubrique', label: t('navm.sortContrats') },
          { id: 'pays', label: t('navm.sortPays') },
        ],
        onPick: (mode) => setSort('emplois', mode === 'pays' ? 'pays' : 'rubrique'),
      },
      subs: emploisByPays
        ? parPays(
          'emplois',
          emplois,
          contracts,
          (j) => j.contract,
          (c) => t(CONTRACT_KEY[c]),
          'ri-file-list-3-line',
          emploisTotals,
        )
        : contracts.map((contract) => ({
          id: contract,
          label: t(CONTRACT_KEY[contract]),
          href: href('emplois', 'contrat', contract),
          count: contractCounts.get(contract) ?? 0,
          panelIcon: 'ri-earth-line',
          subs: paysDeRubrique(
            'emplois',
            'contrat',
            contract,
            emplois.filter((j) => j.contract === contract),
            emploisTotals,
          ),
        })),
    },
  ];
}