import { useEffect, useRef, useState } from 'react';

/**
 * Le compte de la flèche, dit à voix basse — et seulement quand il change de
 * tournure.
 *
 * La flèche du bas porte un chiffre, et son nom accessible le dit en entier
 * (« encore 7 portes plus bas »). Un lecteur d'écran n'entend pas un nom qui
 * change sous lui : il faut donc une zone de statut. Mais une zone de statut
 * branchée sur le chiffre parlerait à chaque pixel de défilement — 12, puis
 * 11, puis 10 —, et la liste deviendrait un compteur qu'on écoute au lieu
 * d'une liste qu'on parcourt.
 *
 * Trois règles, et elles vont ensemble :
 *
 * 1. **La tournure, pas le chiffre.** Le compte n'est retenu que par sa voix :
 *    zéro, une porte, plusieurs. Un chiffre qui passe de 7 à 6 ne change pas
 *    la phrase — « 6 more doors below » au lieu de « 7 » n'apprend rien à qui
 *    descend la liste —, donc il ne parle pas. Le passage de une à plusieurs,
 *    lui, change le mot : la phrase est dite. Et le zéro parle : quand la
 *    liste ne tient plus rien sous son bord, la flèche et son voile
 *    s'effacent — sans un mot, arriver au bout ressemblerait à une perte. La
 *    phrase du bout (« plus rien en dessous ») vient donc clore le compte au
 *    lieu de le laisser muet.
 * 2. **Le compte posé.** Une phrase n'est dite qu'une fois le compte arrêté :
 *    un défilement rapide traverse dix valeurs en un dixième de seconde, et
 *    seule la voix où il s'immobilise est annoncée. La première mesure d'une
 *    occasion, elle, se tait : le nom de la flèche la porte déjà.
 * 3. **Le repli, lui, parle toujours.** Replier une rubrique retire ses portes
 *    d'un seul geste : la tournure du compte peut rester « plusieurs » alors
 *    que la liste vient d'en perdre quatre, et le lecteur n'entendrait rien.
 *    Un repli annonce donc le compte relu sur la nouvelle géométrie **et** ce
 *    qui vient de disparaître — « encore 3 portes plus bas · 4 portes
 *    repliées ». C'est le seul cas où le chiffre se dit sans changer de voix,
 *    parce que c'est aussi le seul où la liste change sans qu'on ait défilé.
 *
 * @param active La surface est-elle ouverte ?
 * @param count  Les portes qui restent sous le bord visible.
 * @param text   La phrase du compte, déjà traduite et accordée.
 * @param fold   Le dernier repli de rubrique : son occasion, ses portes, sa phrase.
 */
export type CountVoice = 0 | 1 | 2;

/** Zéro, une porte, ou plusieurs : trois voix, trois phrases. */
export function countVoice(count: number): CountVoice {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return count === 1 ? 1 : 2;
}

/** Une rubrique qui s'est repliée, et les portes qu'elle tenait. */
export type CountFold = {
  /** L'occasion : un compteur qui ne recule pas, une par repli. */
  seq: number;
  /** Le nombre de portes que la rubrique tenait. */
  doors: number;
  /** Le mot qui les nomme, déjà accordé. */
  phrase: string;
};

/** Le temps laissé au compte pour se poser avant d'être dit. */
const SETTLE_MS = 420;

export function useQuietCount(
  active: boolean,
  count: number,
  text: string,
  fold?: CountFold,
): string {
  const [said, setSaid] = useState('');
  const voice = countVoice(count);
  /* Les deux phrases sont lues au moment où le compte se pose, jamais celles
     d'un rendu plus ancien : un défilement lent peut changer le chiffre, un
     repli peut relancer la mesure, pendant l'attente. */
  const textRef = useRef(text);
  textRef.current = text;
  const foldRef = useRef<CountFold | undefined>(fold);
  foldRef.current = fold;
  /* Le compte du moment, relu à l'instant où la phrase se dépose : un repli a
     déjà relancé la mesure, c'est ce chiffre-là qui compte. */
  const countRef = useRef(count);
  countRef.current = count;
  /* La dernière voix connue de l'occasion, et la dernière voix déjà dite.
     « Rien de dit » est un état à part entière — un zéro dit n'est pas un zéro
     tu —, d'où la mémoire vide au départ plutôt qu'un zéro compté comme dit. */
  const knownRef = useRef<CountVoice | null>(null);
  const saidRef = useRef<CountVoice | null>(null);
  /* Le dernier repli déjà pris en charge : un même repli ne se dit qu'une fois. */
  const foldSeqRef = useRef(0);
  const foldTimerRef = useRef<number | null>(null);

  /* Un repli attend d'être dit : la voix se tait à ce moment-là. Deux zones de
     statut ne parlent pas ensemble — le repli porte la phrase entière, compte
     compris, et la voix la redirait aussitôt après. */
  const foldPending = Boolean(
    active && fold && fold.seq > 0 && fold.seq !== foldSeqRef.current,
  );

  useEffect(() => {
    if (!active) {
      /* Refermé : la visite suivante repart d'une mémoire neuve. */
      knownRef.current = null;
      saidRef.current = null;
      setSaid('');
      return undefined;
    }
    /* Le zéro est une mesure comme une autre : c'est la voix qui dit que la
       liste ne tient plus rien. Simplement, la première mesure d'une ouverture
       se tait encore (voir plus bas) : un panneau dont tout tient à l'écran
       n'a rien à annoncer, son nom porte déjà le total. */
    if (knownRef.current === voice) return undefined;
    const first = knownRef.current === null;
    knownRef.current = voice;
    /* Première mesure de l'occasion : le nom de la flèche le dit déjà. */
    if (first) return undefined;
    /* Un repli vient d'avoir lieu : c'est lui qui parle, avec le compte. */
    if (foldPending) return undefined;
    /* Déjà dit dans cette voix : un compte qui repasse par la même tournure ne
       se répète pas. */
    if (saidRef.current === voice) return undefined;
    const settling = voice;
    const timer = window.setTimeout(() => {
      const phrase = textRef.current;
      /* Une phrase vide n'est pas un silence à retenir : sans elle, la voix
         reste libre de se dire à la prochaine mesure. */
      if (!phrase) return;
      saidRef.current = settling;
      setSaid(phrase);
    }, SETTLE_MS);
    /* Le compte a rebougé avant de s'être posé : la phrase en attente est
       retirée, et c'est la nouvelle voix qui décidera. */
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, voice]);

  /* Le repli d'une rubrique : la phrase attend que la géométrie ait été relue,
     puis dit le compte restant et ce que la liste vient de perdre. Lampe
     allumée en même temps que le nettoyage de l'occasion, dans cet ordre, pour
     qu'un repli ne soit jamais avalé par le repli suivant. */
  useEffect(() => {
    if (!active || !fold || fold.seq <= 0) return undefined;
    if (fold.seq === foldSeqRef.current) return undefined;
    foldSeqRef.current = fold.seq;
    if (foldTimerRef.current !== null) {
      window.clearTimeout(foldTimerRef.current);
      foldTimerRef.current = null;
    }
    const seq = fold.seq;
    foldTimerRef.current = window.setTimeout(() => {
      foldTimerRef.current = null;
      if (foldSeqRef.current !== seq) return;
      const lost = foldRef.current?.phrase ?? '';
      const phrase = [textRef.current, lost].filter(Boolean).join(' · ');
      if (!phrase) return;
      /* Le compte a été dit : la voix ne le redit pas dans la même tournure. */
      saidRef.current = countVoice(countRef.current);
      setSaid(phrase);
    }, SETTLE_MS);
    return () => {
      if (foldTimerRef.current !== null) {
        window.clearTimeout(foldTimerRef.current);
        foldTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, fold?.seq]);

  return said;
}