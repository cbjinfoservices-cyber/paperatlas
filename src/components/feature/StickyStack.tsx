import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useStuck } from '@/hooks/useStuck';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  children: ReactNode;
  /** Une classe en plus, quand le tableau a sa propre teinte de pile. */
  className?: string;
};

/** La clé de mémoire : une position par tableau, sur l'appareil. Elle survit
    désormais à la fermeture de l'onglet : on retrouve la rangée là où on
    l'avait laissée, visite après visite. */
const STORE = 'boardSlide:';

/** Les quatre tableaux publics : leur racine, pour reconnaître un changement. */
const BOARD_ROOTS = ['/annuaire', '/annonces', '/emplois', '/candidats'];

/** Les rubriques déjà dites pendant cette visite : le filet ne parle qu'une
    fois par tableau, au premier allumage. */
const spokenThreads = new Set<string>();

/** La position retenue pour une rangée. */
function readSlide(key: string): number {
  try {
    return Number(window.localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

/** Retenir la position d'une rangée. */
function writeSlide(key: string, value: string | number): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* la mémoire n'est pas essentielle */
  }
}

/** Le tableau dont une adresse dépend, fiche de détail comprise. */
function boardRoot(pathname: string): string {
  return BOARD_ROOTS.find((root) => pathname === root || pathname.startsWith(`${root}/`)) ?? '';
}

/** Le nom lisible d'un champ : son étiquette, ou à défaut son intitulé d'accès.
    Dans la rangée du téléphone les étiquettes sont visuellement masquées mais
    restent dans la page : leur texte est donc toujours disponible ici. */
function fieldName(fld: HTMLElement): string {
  const label = fld.querySelector('label');
  const text = label?.textContent?.replace(/\s+/g, ' ').trim();
  if (text) return text;
  const control = fld.querySelector<HTMLElement>('input, select, textarea');
  const aria = control?.getAttribute('aria-label')?.trim();
  if (aria) return aria;
  const placeholder = control?.getAttribute('placeholder')?.trim();
  if (placeholder) return placeholder;
  return '';
}

/** Les filtres réellement posés sur la pile : une liste déroulante sortie de
    son premier choix, un champ de recherche rempli, une pastille enfoncée, un
    menu de génération ouvert. C'est ce que la remise à zéro rend d'un coup. */
function engagedCount(root: HTMLElement): number {
  let total = 0;
  root.querySelectorAll('button[aria-pressed="true"]').forEach((btn) => {
    /* Les options d'un menu déroulant comptent pour le menu, pas pour elles. */
    if (btn.closest('.decade-menu-panel')) return;
    total += 1;
  });
  root.querySelectorAll('select').forEach((node) => {
    const select = node as HTMLSelectElement;
    /* Un tableau peut partir sur un choix qui n'est pas le premier de la liste
       — le vivier des candidats part sur « plus récent », et sur « plus ancien »
       dès qu'un métier est choisi. `data-default` dit ce point de départ : ce
       qui compte comme posé, c'est ce qui s'en écarte. Sans l'attribut, la
       première option reste la référence. */
    const depart = select.dataset.default;
    if (depart !== undefined) {
      if (select.value !== depart) total += 1;
    } else if (select.selectedIndex > 0) {
      total += 1;
    }
  });
  root.querySelectorAll('input').forEach((node) => {
    const input = node as HTMLInputElement;
    if ((input.type === 'search' || input.type === 'text') && input.value.trim()) total += 1;
  });
  root.querySelectorAll('.decade-menu-btn.is-on').forEach(() => { total += 1; });
  return total;
}

/**
 * La pile haute des tableaux : la barre de filtres et la rangée de pastilles
 * restent ensemble sous la navigation pendant la descente dans les résultats.
 *
 * Sur téléphone la barre tient sur une seule rangée qui glisse latéralement.
 * Deux flèches épinglées sur les arêtes permettent d'avancer ou de reculer
 * d'un champ sans glisser au doigt : celle du bord de départ recule, celle du
 * bord d'arrivée avance. Chacune porte le petit chiffre des filtres encore
 * cachés de son côté, et s'efface quand il n'y a plus rien à voir.
 *
 * Les deux mêmes gestes existent au clavier : dans le champ de recherche,
 * la flèche qui bute sur le bout du texte déplace la rangée d'un champ.
 *
 * La position de la rangée est retenue sur l'appareil, tableau par tableau :
 * elle survit à l'ouverture d'une fiche comme à la fermeture de l'onglet. Elle
 * revient au début quand on remet tous les filtres à zéro.
 */
export default function StickyStack({ children, className = '' }: Props) {
  const { ref, stuck } = useStuck();
  const { pathname } = useLocation();
  const { t } = useLang();
  const [bar, setBar] = useState<HTMLElement | null>(null);
  const [slide, setSlide] = useState(false);
  const [slid, setSlid] = useState(false);
  const [ahead, setAhead] = useState(0);
  const [behind, setBehind] = useState(0);
  /* Le champ que la rangée vient d'atteindre, annoncé aux lecteurs d'écran. */
  const [said, setSaid] = useState('');
  /* Les champs réellement restés hors de vue, de chaque côté : c'est sur eux
     que la rangée se pose quand on clique leur petit chiffre. */
  const aheadKids = useRef<HTMLElement[]>([]);
  const behindKids = useRef<HTMLElement[]>([]);
  /* Le repère visuel du champ atteint : l'anneau et sa minuterie. */
  const reachedEl = useRef<HTMLElement | null>(null);
  const markTimer = useRef(0);
  /* La pastille de rubrique du tableau : elle porte le repère du haut de la
     pile dès que la rangée quitte son début. */
  const rubricEl = useRef<HTMLElement | null>(null);
  const key = `${STORE}${pathname}`;
  const keyRef = useRef(key);
  keyRef.current = key;

  /* La barre de filtres est le seul enfant qui glisse : c'est elle qu'on
     écoute, mesure et déplace. Elle est relue à chaque rendu, au cas où la
     page la remplacerait (une barre qui n'arrive qu'une fois les données
     chargées, par exemple). */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const found = node.querySelector('.filters, .board-filters') as HTMLElement | null;
    if (found && found !== bar) setBar(found);
  });

  /** Les champs de la rangée, dans l'ordre où elle les présente. */
  const fields = useCallback((): HTMLElement[] => {
    if (!bar) return [];
    return Array.from(bar.children)
      .filter((child) => child.classList.contains('fld')) as HTMLElement[];
  }, [bar]);

  /** L'arête de départ de la rangée, marge intérieure déduite : le champ posé
      là est celui qu'on lit en premier. */
  const startEdge = useCallback((rtl: boolean) => {
    if (!bar) return 0;
    const box = bar.getBoundingClientRect();
    const style = getComputedStyle(bar);
    const pad = Number.parseFloat(rtl ? style.paddingRight : style.paddingLeft) || 0;
    return rtl ? box.right - pad : box.left + pad;
  }, [bar]);

  /** Le champ qui occupe l'arête de départ. */
  const leadIndex = useCallback((kids: HTMLElement[], rtl: boolean) => {
    const ref = startEdge(rtl);
    let best = 0;
    let gap = Number.POSITIVE_INFINITY;
    kids.forEach((kid, index) => {
      const rect = kid.getBoundingClientRect();
      const distance = Math.abs((rtl ? rect.right : rect.left) - ref);
      if (distance < gap) {
        gap = distance;
        best = index;
      }
    });
    return best;
  }, [startEdge]);

  /** Poser un repère discret sur le champ atteint : un anneau qui s'allume puis
      s'éteint. Rien ne bouge, rien ne prend de place. */
  const mark = useCallback((fld: HTMLElement) => {
    if (reachedEl.current && reachedEl.current !== fld) {
      reachedEl.current.classList.remove('is-reached');
    }
    reachedEl.current = fld;
    fld.classList.remove('is-reached');
    /* Une lecture de mise en page relance l'animation même sur le même champ. */
    void fld.offsetWidth;
    fld.classList.add('is-reached');
    if (markTimer.current) window.clearTimeout(markTimer.current);
    markTimer.current = window.setTimeout(() => {
      fld.classList.remove('is-reached');
      if (reachedEl.current === fld) reachedEl.current = null;
    }, 1700);
  }, []);

  /** Annoncer, pour les lecteurs d'écran, le champ que la rangée atteint, le
      nombre de filtres qui restent encore de ce côté-là, et le nom du champ
      que le geste suivant atteindrait : la phrase prépare l'appui d'après. */
  const announce = useCallback((
    fld: HTMLElement | null,
    rest: number,
    next?: HTMLElement | null,
  ) => {
    const name = fld ? fieldName(fld) : '';
    if (!name) {
      setSaid('');
      return;
    }
    const restText = rest <= 0
      ? t('board.nudgeRestNone')
      : rest === 1
        ? t('board.nudgeRestOne')
        : t('board.nudgeRestMany').replace('{n}', String(rest));
    const nextName = next ? fieldName(next) : '';
    const nextText = nextName
      ? ` — ${t('board.nudgeNextName').replace('{name}', nextName)}`
      : '';
    const line = `${t('board.nudgeReached').replace('{name}', name)} — ${restText}${nextText}`;
    /* Deux appuis qui tombent sur la même phrase doivent quand même être dits :
       l'espace invisible qui alterne relance l'annonce sans rien afficher. */
    setSaid((prev) => (prev === line ? `${line}\u200B` : line));
  }, [t]);

  /* La pile quitte la page : le repère s'efface avec elle, sans laisser
     d'anneau allumé derrière. */
  useEffect(() => () => {
    if (markTimer.current) window.clearTimeout(markTimer.current);
    if (reachedEl.current) reachedEl.current.classList.remove('is-reached');
    if (rubricEl.current) rubricEl.current.classList.remove('is-rubric');
  }, []);

  /* Le repère continu du haut jusqu'au champ : dès que la rangée quitte son
     début, la pastille de rubrique du tableau reçoit le même anneau que le
     champ. Selon la page, ce sont les puces de rubrique posées au-dessus de
     la barre (Annonces, Emplois) ou les pastilles de filtre de l'Annuaire :
     la pastille active, celle qui nomme le tableau lu. L'anneau s'éteint
     quand la rangée revient à son début. */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const row = node.querySelector<HTMLElement>('.board-cats, .fresh-row');
    const pill = row
      ? row.querySelector<HTMLElement>('button.is-on') ?? row.querySelector<HTMLElement>('button')
      : null;
    if (rubricEl.current && rubricEl.current !== pill) {
      rubricEl.current.classList.remove('is-rubric');
    }
    rubricEl.current = pill;
    if (!pill) return;
    pill.classList.toggle('is-rubric', slid);
  });

  /* Le filet parle. La première fois qu'il s'allume pendant une visite, il
     rappelle à voix basse quelle rubrique est ouverte : celui qui arrive sur
     une rangée déjà entamée sait aussitôt quel tableau il lit. Une seule fois
     par tableau — ensuite le repère est connu, et la parole reviendrait à
     chaque geste. La phrase passe par la même zone discrète que les annonces
     de la rangée : rien ne s'affiche, tout se lit. */
  useEffect(() => {
    if (!slid) return;
    const root = boardRoot(pathname) || pathname;
    if (spokenThreads.has(root)) return;
    /* La rubrique lue : la pastille allumée du tableau, ou, sur un tableau sans
       pastille (le vivier des candidats), l'en-tête de la page — son tampon
       d'abord, court et net, puis son titre. `innerText` garde les retours à la
       ligne du titre, là où `textContent` collerait deux mots ensemble. */
    const pill = rubricEl.current?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const stamp = document.querySelector<HTMLElement>('main .stamp')?.innerText
      ?.replace(/\s+/g, ' ').trim() ?? '';
    const head = document.querySelector<HTMLElement>('main .page-h1')?.innerText
      ?.replace(/\s+/g, ' ').trim() ?? '';
    const name = pill || stamp || head;
    if (!name) return;
    spokenThreads.add(root);
    const line = t('board.threadSpeaks').replace('{name}', name);
    setSaid((prev) => (prev === line ? `${line}\u200B` : line));
  }, [slid, pathname, t]);

  /** Un champ à la fois : la rangée cale le champ suivant sur son arête de
      départ, et son nom est annoncé — le geste se lit sans voir. */
  const nudge = useCallback((direction: 1 | -1) => {
    if (!bar) return;
    /* Une rangée qui tient en entier n'a rien à faire glisser : les flèches y
       restent donc rendues au curseur du champ. */
    if (bar.scrollWidth - bar.clientWidth <= 2) return;
    const kids = fields();
    if (kids.length === 0) return;
    const rtl = getComputedStyle(bar).direction === 'rtl';
    const ref = startEdge(rtl);
    const lead = leadIndex(kids, rtl);
    const target = Math.max(0, Math.min(kids.length - 1, lead + direction));
    const rect = kids[target].getBoundingClientRect();
    const delta = (rtl ? rect.right : rect.left) - ref;
    if (Math.abs(delta) > 0.5) bar.scrollBy({ left: delta, behavior: 'smooth' });
    mark(kids[target]);
    /* Ce qui reste à voir de ce côté, une fois le champ atteint, et le champ
       que l'appui suivant rejoindrait dans le même sens. */
    const after = target + direction;
    announce(
      kids[target],
      direction > 0 ? kids.length - 1 - target : target,
      after >= 0 && after < kids.length ? kids[after] : null,
    );
  }, [bar, fields, startEdge, leadIndex, mark, announce]);

  /** Le chiffre cliqué : la rangée se pose d'un coup sur les champs restés hors
      de vue de ce côté-là, et le champ atteint est annoncé. */
  const jump = useCallback((direction: 1 | -1) => {
    if (!bar) return;
    const pool = direction > 0 ? aheadKids.current : behindKids.current;
    if (pool.length === 0) return;
    const rtl = getComputedStyle(bar).direction === 'rtl';
    const ref = startEdge(rtl);
    const edge = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rtl ? rect.right : rect.left;
    };
    const nearest = pool.reduce(
      (best, el) => (Math.abs(edge(el) - ref) < Math.abs(edge(best) - ref) ? el : best),
      pool[0],
    );
    bar.scrollBy({ left: edge(nearest) - ref, behavior: 'smooth' });
    mark(nearest);
    const kids = fields();
    const index = kids.indexOf(nearest);
    const after = index + direction;
    announce(
      nearest,
      index < 0 ? 0 : direction > 0 ? kids.length - 1 - index : index,
      index >= 0 && after >= 0 && after < kids.length ? kids[after] : null,
    );
  }, [bar, fields, startEdge, mark, announce]);

  /** Le retour au début est dit, pour ceux qui écoutent la page : la remise à
      zéro des filtres replace la rangée, et la phrase dit combien de filtres
      elle vient de rendre d'un coup. */
  const sayReturn = useCallback((removed: number) => {
    const count = removed <= 0
      ? t('board.resetNone')
      : removed === 1
        ? t('board.resetOne')
        : t('board.resetMany').replace('{n}', String(removed));
    const line = `${t('board.rowBackStart')} — ${count}`;
    /* La même phrase redite après une seconde remise à zéro est relancée par
       l'espace invisible, sans rien afficher de plus. */
    setSaid((prev) => (prev === line ? `${line}\u200B` : line));
  }, [t]);

  /** La rangée revient à son début, dans le sens de lecture courant. */
  const backToStart = useCallback((smooth = false) => {
    if (!bar) return;
    writeSlide(keyRef.current, 0);
    if (smooth) bar.scrollTo({ left: 0, behavior: 'smooth' });
    else bar.scrollLeft = 0;
  }, [bar]);

  useEffect(() => {
    if (!bar) return undefined;
    let frame = 0;
    let saveTimer = 0;

    const read = () => {
      frame = 0;
      const box = bar.getBoundingClientRect();
      const rtl = getComputedStyle(bar).direction === 'rtl';
      const kids = Array.from(bar.children)
        .filter((child) => child.classList.contains('fld')) as HTMLElement[];

      /* Ce qui reste caché de chaque côté, mesuré sur les champs eux-mêmes.
         Les champs sont retenus, pas seulement comptés : le clic sur le petit
         chiffre doit pouvoir poser la rangée dessus. */
      const forward: HTMLElement[] = [];
      const back: HTMLElement[] = [];
      kids.forEach((kid) => {
        const r = kid.getBoundingClientRect();
        if (rtl ? r.left < box.left - 2 : r.right > box.right + 2) forward.push(kid);
        if (rtl ? r.right > box.right + 2 : r.left < box.left - 2) back.push(kid);
      });
      aheadKids.current = forward;
      behindKids.current = back;

      const hidden = bar.scrollWidth - bar.clientWidth > 2;
      /* `Math.abs` : en arabe la rangée part de la droite, la position de
         défilement y est négative dans plusieurs navigateurs. */
      const travelled = Math.abs(bar.scrollLeft);
      const atEnd = travelled + bar.clientWidth >= bar.scrollWidth - 2;

      setSlid(travelled > 2);
      setSlide(hidden && !atEnd);
      setAhead(forward.length);
      setBehind(back.length);

      /* La remise à zéro garde sa largeur réelle : la flèche d'avance s'épingle
         juste devant elle, sans jamais la recouvrir. */
      const reset = bar.querySelector<HTMLElement>('.filters-reset');
      if (reset) bar.style.setProperty('--reset-w', `${reset.offsetWidth}px`);

      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        writeSlide(keyRef.current, bar.scrollLeft);
      }, 160);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    read();
    bar.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      bar.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
      if (saveTimer) window.clearTimeout(saveTimer);
      /* La fiche s'ouvre : la position retenue est celle qu'on quitte. */
      writeSlide(keyRef.current, bar.scrollLeft);
      bar.style.removeProperty('--reset-w');
    };
  }, [bar]);

  /* La rangée retrouve sa place — celle de la dernière visite, ou celle qu'on
     vient de quitter en ouvrant une fiche. La position est bornée à ce que la
     barre peut réellement parcourir : une barre devenue plus courte ne se
     retrouve pas poussée dans le vide. */
  useEffect(() => {
    if (!bar) return undefined;
    const saved = readSlide(key);
    const id = window.requestAnimationFrame(() => {
      /* En arabe la rangée part de la droite et la position de défilement y est
         négative dans la plupart des navigateurs : on garde son signe, lui seul
         dit de quel côté la rangée est entamée. */
      const max = Math.max(bar.scrollWidth - bar.clientWidth, 0);
      const value = Math.abs(saved) > 1
        ? Math.sign(saved) * Math.min(Math.abs(saved), max)
        : 0;
      bar.scrollLeft = value;
    });
    return () => window.cancelAnimationFrame(id);
  }, [bar, key]);

  /* Remettre tous les filtres à zéro remet aussi la rangée à son début : la
     liste repart d'un tableau neuf, pas d'une rangée entamée. */
  useEffect(() => {
    if (!bar) return undefined;
    const onClick = (event: MouseEvent) => {
      const node = event.target as Element | null;
      if (!node || typeof node.closest !== 'function') return;
      if (!node.closest('.filters-reset')) return;
      /* Ce qui est posé au moment du clic. La différence, lue une fois la page
         rendue, dit exactement ce que le geste vient de rendre. */
      const root = ref.current;
      const before = root ? engagedCount(root) : 0;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const after = root ? engagedCount(root) : 0;
          backToStart(true);
          /* La rangée repart de son début : la phrase le dit, au lieu de
             laisser le lecteur d'écran devant un silence. */
          sayReturn(Math.max(before - after, 0));
        });
      });
    };
    bar.addEventListener('click', onClick);
    return () => bar.removeEventListener('click', onClick);
  }, [bar, backToStart, sayReturn]);

  /* Au clavier : dans le champ de recherche, la flèche qui bute sur le bout du
     texte fait glisser la rangée d'un champ. Le curseur garde sa liberté au
     milieu d'une saisie — on écrit avant de parcourir. */
  useEffect(() => {
    if (!bar) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const node = event.target as HTMLElement | null;
      if (!node || node.tagName !== 'INPUT') return;
      if (!node.closest('.filters-search, .fld-inline')) return;
      const input = node as HTMLInputElement;
      if (input.type !== 'search' && input.type !== 'text') return;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const length = (input.value || '').length;
      const rtl = getComputedStyle(bar).direction === 'rtl';
      /* Le bout du texte n'est pas le même selon le sens de lecture : en arabe
         le début du texte est à droite, la fin à gauche. Ce sont donc les
         gestes inversés qui font glisser la rangée. */
      const atStart = start === 0 && end === 0;
      const atEnd = start === length && end === length;
      const back = rtl ? event.key === 'ArrowRight' : event.key === 'ArrowLeft';
      const forth = rtl ? event.key === 'ArrowLeft' : event.key === 'ArrowRight';
      if (back && atStart) {
        event.preventDefault();
        nudge(-1);
      } else if (forth && atEnd) {
        event.preventDefault();
        nudge(1);
      }
    };
    bar.addEventListener('keydown', onKey);
    return () => bar.removeEventListener('keydown', onKey);
  }, [bar, nudge]);

  const prevLabel = behind > 0
    ? `${t('board.nudgePrevHint')} · ${behind}`
    : t('board.nudgePrevHint');
  const nextLabel = ahead > 0
    ? `${t('board.nudgeNextHint')} · ${ahead}`
    : t('board.nudgeNextHint');
  /* Le chiffre de grand écran : les barres qui débordent y disent, d'un seul
     regard, combien de champs restent hors de vue — et de quel côté. */
  const hiddenTotal = ahead + behind;
  /* La barre ouvre-t-elle la pile ? Si les puces de rubrique la précèdent, le
     compteur se pose dessous ; sinon il coiffe la rangée. Dans les deux cas il
     reste collé à elle. */
  const barPrev = bar ? bar.previousElementSibling : null;
  const barIsFirst = !barPrev || barPrev.classList.contains('board-thread');
  const hiddenLabel = hiddenTotal === 1
    ? t('board.hiddenOne')
    : t('board.hiddenMany').replace('{n}', String(hiddenTotal));
  /* Le chiffre est une porte : il dit combien de champs manquent de son côté,
     et le clic pose la rangée droit dessus. */
  const jumpPrevLabel = t('board.jumpPrev').replace('{n}', String(behind));
  const jumpNextLabel = t('board.jumpNext').replace('{n}', String(ahead));

  return (
    <div
      ref={ref}
      className={`board-stick${stuck ? ' is-stuck' : ''}${slide ? ' is-slide' : ''}${slid ? ' is-slid' : ''}${className ? ` ${className}` : ''}`}
    >
      {/* Le filet du haut de la pile : sur téléphone la pastille de rubrique
          sort de l'écran bien avant la barre. Ce trait mince reste collé au
          bord de la pile et s'allume dès que la rangée quitte son début : le
          repère ne disparaît donc jamais tout à fait. */}
      <span className="board-thread" aria-hidden="true" />
      {children}
      {hiddenTotal > 0 && (
        <p className={`board-hidden-count${barIsFirst ? ' is-first' : ''}`}>
          <i className="ri-drag-move-2-line" aria-hidden="true"></i>
          <span>{hiddenLabel}</span>
          <span className="board-hidden-sides">
            {behind > 0 && (
              <button
                type="button"
                className="board-hidden-go"
                onClick={() => jump(-1)}
                aria-label={jumpPrevLabel}
                title={jumpPrevLabel}
              >
                <span className="board-hidden-chev" aria-hidden="true">‹</span>
                <span aria-hidden="true">{behind}</span>
              </button>
            )}
            {ahead > 0 && (
              <button
                type="button"
                className="board-hidden-go"
                onClick={() => jump(1)}
                aria-label={jumpNextLabel}
                title={jumpNextLabel}
              >
                <span aria-hidden="true">{ahead}</span>
                <span className="board-hidden-chev" aria-hidden="true">›</span>
              </button>
            )}
          </span>
        </p>
      )}
      {/* Le nom du filtre atteint, dit à voix basse : rien ne s'affiche, tout
          se lit. */}
      <p className="board-sr-only" role="status" aria-live="polite" aria-atomic="true">{said}</p>
      {bar && createPortal(
        <>
          <button
            type="button"
            className={`board-nudge board-nudge-prev${slid ? ' is-on' : ''}`}
            onClick={() => nudge(-1)}
            aria-label={prevLabel}
            title={prevLabel}
            tabIndex={slid ? 0 : -1}
          >
            <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
            {behind > 0 && <span className="board-nudge-n" aria-hidden="true">{behind}</span>}
          </button>
          <button
            type="button"
            className={`board-nudge board-nudge-next${slide ? ' is-on' : ''}`}
            onClick={() => nudge(1)}
            aria-label={nextLabel}
            title={nextLabel}
            tabIndex={slide ? 0 : -1}
          >
            {ahead > 0 && <span className="board-nudge-n" aria-hidden="true">{ahead}</span>}
            <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
          </button>
        </>,
        bar,
      )}
    </div>
  );
}