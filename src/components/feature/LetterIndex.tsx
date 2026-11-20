import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { LetterEntry } from '@/lib/letterIndex';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Les lettres de la liste rangée, dans l'ordre où elles se présentent. */
  entries: LetterEntry[];
  /** Le libellé de la bande — « Aller à une lettre ». */
  label: string;
  /** Le mot que la lettre tient — « candidats », « annonces », « offres ». */
  countWord: string;
  /** La lettre allumée : celle d'où l'on vient, ou celle qu'on vient de lire. */
  picked: string;
  /** Rejoindre une lettre : la ligne visée et sa position dans la liste. */
  onPick: (letter: string, index: number) => void;
};

/** La lecture va-t-elle de droite à gauche ? Les flèches s'y retournent. */
const readsRightToLeft = () =>
  typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

/**
 * L'index des lettres, sous les cartes rangées par nom — un seul geste pour
 * sauter au point cherché d'une longue liste, et la lettre choisie reste
 * allumée pour dire où l'on se tient.
 *
 * Deux flèches l'encadrent : elles passent d'une lettre à la suivante sans
 * viser une pastille à la souris, et bouclent d'un bout à l'autre — la
 * dernière mène à la première. Sans lettre allumée, la flèche de droite
 * ouvre la première, celle de gauche la dernière.
 *
 * Une fois l'index au clavier — une pastille, une flèche, un passage par Tab —
 * les flèches gauche et droite du clavier font le même chemin, sans quitter la
 * bande. En arabe, la lecture allant de droite à gauche, c'est la flèche de
 * gauche qui avance. Début et Fin sautent d'un seul geste aux deux bords de la
 * bande : la première lettre, la dernière — sans traverser tout l'alphabet.
 *
 * Sous la bande, un compteur garde la trace des lettres parcourues ainsi : il
 * dit combien de points ont été traversés, et rouvre le dernier d'un clic —
 * on revient là où la lecture s'était arrêtée, sans retrouver sa place à la
 * main dans une longue liste.
 *
 * Il ne paraît qu'à partir de deux lettres : une seule ne mènerait nulle part.
 *
 * Ce que l'œil voit — la pastille qui s'allume — n'est pas ce qu'un lecteur
 * d'écran perçoit : il n'y a pas de focus déplacé d'une lettre à l'autre. La
 * lettre atteinte est donc dite à voix basse, dans une zone discrète de la
 * page, à chaque saut des flèches ou des deux bords.
 */
export default function LetterIndex({ entries, label, countWord, picked, onPick }: Props) {
  const { t } = useLang();
  /* Le chemin parcouru d'une flèche à l'autre : les lettres vues, et la
     dernière d'entre elles — celle que le compteur rouvre. */
  const [walk, setWalk] = useState<{ seen: string[]; last: string }>({ seen: [], last: '' });
  /* La phrase que les lecteurs d'écran prononcent : elle se vide avant d'être
     réécrite, pour qu'une même lettre atteinte deux fois soit dite deux fois. */
  const [said, setSaid] = useState('');
  const sayTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(sayTimer.current), []);
  if (entries.length < 2) return null;

  const at = entries.findIndex((row) => row.letter === picked);

  /** Une lettre rejointe : le même geste pour la pastille, les flèches et les
      deux bords du clavier — et le compteur la retient une seule fois. */
  const pick = (entry: LetterEntry) => {
    onPick(entry.letter, entry.index);
    /* Le compteur ne retient que ce qui mène quelque part : une lettre
       disparue d'une liste resserrée n'est pas comptée deux fois. */
    setWalk((prev) => ({
      seen: prev.seen.includes(entry.letter) ? prev.seen : [...prev.seen, entry.letter],
      last: entry.letter,
    }));
    /* La lettre atteinte est annoncée : sans elle, le saut resterait muet
       pour qui ne voit pas la pastille s'allumer. */
    const message = t('candlist.letterSaid')
      .replace('{letter}', entry.letter)
      .replace('{count}', String(entry.count))
      .replace('{word}', countWord);
    setSaid('');
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => setSaid(message), 80);
  };

  /** La lettre voisine : on boucle, pour que le geste n'ait jamais de mur. */
  const step = (delta: number) => {
    const from = at < 0 ? (delta > 0 ? -1 : 0) : at;
    const next = ((from + delta) % entries.length + entries.length) % entries.length;
    pick(entries[next]);
  };

  /* Les flèches du clavier, tant que le focus se tient dans la bande. */
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    /* Début et Fin : les deux bords de la bande, sans traverser l'alphabet. */
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const edge = event.key === 'Home' ? entries[0] : entries[entries.length - 1];
      if (edge) pick(edge);
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const forward = readsRightToLeft()
      ? event.key === 'ArrowLeft'
      : event.key === 'ArrowRight';
    step(forward ? 1 : -1);
  };

  /* La dernière lettre visitée doit encore exister dans la liste ouverte :
     après un filtre, elle peut s'être retirée, et le compteur s'efface. */
  const lastEntry = walk.last ? entries.find((row) => row.letter === walk.last) : undefined;

  /**
   * Rouvrir la dernière lettre visitée : le même geste que les flèches, pour
   * que la lettre reprise soit dite à voix basse et non seulement rallumée.
   */
  const reopenLast = (entry: LetterEntry) => {
    pick(entry);
  };

  /**
   * La petite gomme du carnet : elle n'efface que les lettres parcourues au
   * clavier, et laisse la liste où elle est. Le compteur disparaît, la phrase
   * le dit à qui ne voit pas la ligne s'effacer.
   */
  const clearLetters = () => {
    setWalk({ seen: [], last: '' });
    setSaid('');
    window.clearTimeout(sayTimer.current);
    sayTimer.current = window.setTimeout(() => setSaid(t('candlist.letterWiped')), 60);
  };

  return (
    <nav className="board-letters" aria-label={label} onKeyDown={onKeyDown}>
      <span className="board-letters-label">
        <i className="ri-list-ordered" aria-hidden="true"></i>
        {label}
      </span>
      <div className="board-letters-track">
        <button
          type="button"
          className="board-letter-step"
          onClick={() => step(-1)}
          title={t('candlist.letterPrev')}
          aria-label={t('candlist.letterPrev')}
        >
          <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
        </button>
        <div className="board-letters-list">
          {entries.map(({ letter, index, count }) => (
            <button
              key={letter}
              type="button"
              className={`board-letter${picked === letter ? ' is-on' : ''}`}
              onClick={() => onPick(letter, index)}
              title={`${letter} · ${count} ${countWord}`}
              aria-label={`${letter} · ${count} ${countWord}`}
              aria-pressed={picked === letter}
            >
              {letter}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="board-letter-step"
          onClick={() => step(1)}
          title={t('candlist.letterNext')}
          aria-label={t('candlist.letterNext')}
        >
          <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
        </button>
      </div>
      {/* Le geste se dit là où il se fait : la bande, au clavier. */}
      <span className="board-letters-hint">
        <i className="ri-keyboard-line" aria-hidden="true"></i>
        {t('candlist.letterKeys')}
      </span>
      {/* La lettre atteinte, dite sans être vue : les flèches du clavier ne
          déplacent pas le focus, la pastille allumée suffit à l'œil seul. */}
      <p className="board-letters-said" role="status" aria-live="polite" aria-atomic="true">
        {said}
      </p>
      {/* Le chemin parcouru : combien de lettres ont été traversées, et la
          porte qui rouvre la dernière d'entre elles. */}
      {lastEntry && walk.seen.length >= 2 && (
        <p className="board-letters-walk">
          <i className="ri-route-line" aria-hidden="true"></i>
          <span>{t('candlist.letterWalk').replace('{n}', String(walk.seen.length))}</span>
          <button
            type="button"
            className="board-letters-walk-go"
            onClick={() => reopenLast(lastEntry)}
            title={t('candlist.letterWalkBack').replace('{letter}', lastEntry.letter)}
          >
            <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {t('candlist.letterWalkBack').replace('{letter}', lastEntry.letter)}
            </span>
          </button>
          {/* La gomme du carnet : elle n'efface que les lettres parcourues. */}
          <button
            type="button"
            className="board-letters-wipe"
            onClick={clearLetters}
            title={t('candlist.letterWipe')}
          >
            <i className="ri-eraser-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('candlist.letterWipe')}</span>
          </button>
        </p>
      )}
    </nav>
  );
}