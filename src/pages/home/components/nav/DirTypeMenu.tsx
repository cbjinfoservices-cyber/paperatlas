import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { DIRECTORY_TRADES, paysDeSlug, slugDeTrade, slugPays } from '@/lib/tradePages';
import { paysParTrade, regionsParTrade } from '@/lib/tradeCountries';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { entreprises } from '@/mocks/entreprises';
import NavDoorList, { type NavDoorItem } from './NavDoorList';

/**
 * Combien de fiches chaque type porte : le menu annonce un chiffre réel, lu
 * sur les fiches elles-mêmes, et non un total écrit à la main.
 */
function useTradeCounts(): Record<string, number> {
  return useMemo(() => {
    const counts: Record<string, number> = {};
    entreprises.forEach((e) => {
      counts[e.trade] = (counts[e.trade] ?? 0) + 1;
    });
    return counts;
  }, []);
}

/** « 24 fiches », « aucune fiche » : la ligne sous chaque type. */
function filesLine(t: (key: string) => string, count: number): string {
  if (count <= 0) return t('navm.dirFilesNone');
  return t('navm.dirFiles').replace('{n}', String(count));
}

/** Le segment de type lu dans l'adresse — /annuaire/imprimeries → « imprimeries ». */
function slugCourant(pathname: string): string {
  if (!pathname.startsWith('/annuaire')) return '';
  return (pathname.split('/')[2] ?? '').toLowerCase();
}

/**
 * Le périmètre déjà lu — le pays et la région — repris dans les adresses du
 * menu : ouvrir « Fournisseurs » depuis « Imprimeries en Algérie » mène aux
 * fournisseurs de ce même pays, au lieu de rendre le monde arabe entier.
 */
function useDirScope() {
  const { pathname, search } = useLocation();
  return useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const params = new URLSearchParams(search);
    const fromPath = parts[0] === 'annuaire' && parts[2] ? paysDeSlug(parts[2]) : '';
    const code = params.get('pays') || fromPath;
    const countrySlug = code ? slugPays(code) : '';
    const wilaya = params.get('wilaya') ?? '';
    const query = wilaya ? `?wilaya=${encodeURIComponent(wilaya)}` : '';
    const typeHref = (slug: string) => `/annuaire/${slug}${countrySlug ? `/${countrySlug}` : ''}${query}`;
    /* L'adresse d'un pays, dans un type : la région déjà lue n'y suit que si
       c'est le pays qu'elle habite — une région ne se transporte pas d'un pays
       à l'autre. */
    const paysHref = (slug: string, paysCode: string) => {
      const garde = wilaya && paysCode === code ? `?wilaya=${encodeURIComponent(wilaya)}` : '';
      return `/annuaire/${slug}/${slugPays(paysCode)}${garde}`;
    };
    const allParams = new URLSearchParams();
    if (code) allParams.set('pays', code);
    if (wilaya) allParams.set('wilaya', wilaya);
    const allQuery = allParams.toString();
    return {
      pays: code,
      wilaya,
      typeHref,
      paysHref,
      allHref: allQuery ? `/annuaire?${allQuery}` : '/annuaire',
    };
  }, [pathname, search]);
}

/**
 * Les huit pastilles de type, telles qu'elles se lisent dans le panneau
 * « Plus » (entre 1024 et 1299 px) et dans la feuille du téléphone : les
 * mêmes portes que le menu du rang, la même adresse, le même compte. Chacune
 * ouvre l'annuaire déjà filtré sur son type.
 */
export function DirTypeLinks({
  variant,
  onNavigate,
  highlight,
}: {
  variant: 'panel' | 'sheet';
  onNavigate?: () => void;
  /** Les types que la recherche vient de nommer : la pastille s'accuse, sans
      que les sept autres quittent la famille où elles se lisent. */
  highlight?: string[];
}) {
  const { t } = useLang();
  const counts = useTradeCounts();
  const { pathname } = useLocation();
  const courant = slugCourant(pathname);
  const { typeHref } = useDirScope();

  return (
    <div className={`nav-dir-types nav-dir-types--${variant}`}>
      {DIRECTORY_TRADES.map(({ trade, icon }) => {
        const slug = slugDeTrade(trade);
        const label = t(`tradePlural.${trade}`);
        const count = counts[trade] ?? 0;
        return (
          <Link
            key={trade}
            to={typeHref(slug)}
            className={[
              'nav-dir-type',
              courant === slug ? 'is-current' : '',
              highlight?.includes(slug) ? 'is-hit' : '',
            ].filter(Boolean).join(' ')}
            aria-current={courant === slug ? 'page' : undefined}
            title={`${label} — ${filesLine(t, count)}`}
            onClick={onNavigate}
          >
            <i className={icon} aria-hidden="true"></i>
            <span>{label}</span>
            <span className="nav-sub-count">{count}</span>
          </Link>
        );
      })}
    </div>
  );
}

type Props = {
  /** L'annuaire est la page sous les pieds : la porte prend l'accent. */
  current: boolean;
  /** La pastille « Lu · Annuaire » quand la page vient d'être lue. */
  tick?: ReactNode;
  /** Un autre panneau de la barre est ouvert : celui-ci se referme. */
  suspended: boolean;
  /** Ce menu s'ouvre : les autres panneaux de la barre se referment. */
  onOpen: () => void;
};

/**
 * La porte « Annuaire » du rang, et son menu.
 *
 * Elle ne mène plus d'un seul geste à l'annuaire entier : elle déplie les
 * huit types d'établissement, et chacune de ces lignes ouvre la page du type
 * — l'annuaire déjà filtré. « Tout l'annuaire » reste la première ligne, pour
 * que la liste complète ne coûte jamais plus qu'un clic.
 *
 * Le menu s'ouvre au survol (après un court temps d'arrêt, comme « Plus »),
 * au clic, et au clavier par la flèche bas ; il se referme sur Échap, sur un
 * clic ailleurs, au défilement de la page et au changement d'adresse.
 */
export default function DirTypeMenu({ current, tick, suspended, onOpen }: Props) {
  const { t, lang } = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hoverOpenTimer = useRef<number | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);
  const openedByHover = useRef(false);
  const focusOnOpen = useRef(false);
  const counts = useTradeCounts();
  const courant = slugCourant(pathname);
  const { pays, typeHref, allHref, paysHref } = useDirScope();

  /* Chaque type déplie ses pays : « Imprimeries › Algérie, Maroc… ». Les
     pays sont lus sur les fiches elles-mêmes, le plus fourni d'abord, et
     chacun mène à la page du type dans ce pays — l'annuaire déjà filtré deux
     fois. Le premier niveau reste la page du type, sans pays.

     Et chaque pays annonce, sous lui, ses régions : « Algérie 41 · 12 rég. ».
     C'est là qu'on choisit où le métier bat — Oran plutôt qu'Alger — avant
     d'ouvrir la page, au lieu d'y arriver et de reposer le filtre. */
  const items = useMemo<NavDoorItem[]>(() => DIRECTORY_TRADES.map(({ trade, icon }) => {
    const slug = slugDeTrade(trade);
    const paysListe = paysParTrade(trade);
    return {
      id: trade,
      label: t(`tradePlural.${trade}`),
      icon,
      href: typeHref(slug),
      hint: filesLine(t, counts[trade] ?? 0),
      current: courant === slug,
      subs: paysListe.slice(0, 6).map((row) => {
        const regions = regionsParTrade(trade, row.code).slice(0, 6);
        return {
          id: row.code,
          label: nomPays(row.code, lang),
          href: paysHref(slug, row.code),
          count: row.count,
          hint: regions.length
            ? t('navm.regionShort').replace('{n}', String(regions.length))
            : undefined,
          /* Le pays déjà lu se marque parmi ses voisins, du même point que la
             région lue dessous : on retrouve où l'on se tient d'un coup d'œil. */
          current: Boolean(pays) && row.code === pays,
          panelIcon: 'ri-map-pin-line',
          subs: regions.length > 0
            ? regions.map((region) => ({
              id: region.wilaya,
              label: nomRegion(region.wilaya, lang),
              href: `/annuaire/${slug}/${slugPays(row.code)}?wilaya=${encodeURIComponent(region.wilaya)}`,
              count: region.count,
            }))
            : undefined,
        };
      }),
    };
  }), [t, lang, counts, typeHref, paysHref, courant, pays]);

  const clearHoverTimers = () => {
    if (hoverOpenTimer.current !== null) {
      window.clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };

  const close = () => {
    openedByHover.current = false;
    setOpen(false);
  };

  const show = () => {
    clearHoverTimers();
    onOpen();
    setOpen(true);
  };

  /* Un autre panneau de la barre prend la main : celui-ci se referme. */
  useEffect(() => {
    if (suspended) close();
  }, [suspended]);

  /* Changer de page referme le menu : la porte ne reste pas ouverte sur une
     liste qu'on vient de quitter. */
  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (e: MouseEvent) => {
      const node = e.target as Node;
      if (wrapRef.current?.contains(node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      btnRef.current?.focus();
    };
    /* Le premier pixel de défilement referme : le menu ne flotte pas au-dessus
       d'une page qui voyage. */
    const onScroll = () => close();
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  useEffect(() => () => clearHoverTimers(), []);

  const menuItems = () => Array.from(
    menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [],
  );

  const focusItem = (index: number) => {
    const list = menuItems();
    if (!list.length) return;
    const next = ((index % list.length) + list.length) % list.length;
    list[next]?.focus();
  };

  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    focusItem(1);
  }, [open]);

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = menuItems();
    const at = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem(at + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem(at - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(list.length - 1);
    }
  };

  const onPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (hoverCloseTimer.current !== null) {
      window.clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
    if (e.pointerType !== 'mouse' || open) return;
    if (window.innerWidth < 1024) return;
    hoverOpenTimer.current = window.setTimeout(() => {
      hoverOpenTimer.current = null;
      openedByHover.current = true;
      show();
    }, 300);
  };

  const onPointerLeave = () => {
    if (hoverOpenTimer.current !== null) {
      window.clearTimeout(hoverOpenTimer.current);
      hoverOpenTimer.current = null;
    }
    if (!openedByHover.current) return;
    hoverCloseTimer.current = window.setTimeout(() => {
      hoverCloseTimer.current = null;
      close();
    }, 240);
  };

  return (
    <div
      className="nav-dir"
      ref={wrapRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        ref={btnRef}
        className={[
          'nav-more-btn',
          'nav-dir-btn',
          open ? 'is-open' : '',
          current ? 'is-current' : '',
          tick ? 'nav-link-tick-host' : '',
        ].filter(Boolean).join(' ')}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t('nav.annuaire')} — ${t('navm.dirOpen')}`}
        onClick={() => {
          clearHoverTimers();
          if (open) {
            close();
            return;
          }
          openedByHover.current = false;
          show();
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          focusOnOpen.current = true;
          show();
        }}
      >
        <i className="ri-building-4-line" aria-hidden="true"></i>
        {t('nav.annuaire')}
        {tick}
        <i className="ri-arrow-down-s-line nav-more-caret" aria-hidden="true"></i>
      </button>

      {open && (
        <div
          className="nav-more-menu nav-dir-menu"
          role="menu"
          aria-label={`${t('nav.annuaire')} — ${t('navm.dirTypes')}`}
          ref={menuRef}
          onKeyDown={onMenuKey}
        >
          <p className="nav-more-head">{t('navm.dirTypes')}</p>
          <NavDoorList
            items={items}
            variant="row"
            onNavigate={close}
            lead={{
              label: t('navm.dirAll'),
              hint: t('navm.dirAllHint'),
              href: allHref,
              current: current && !courant,
            }}
          />
        </div>
      )}
    </div>
  );
}