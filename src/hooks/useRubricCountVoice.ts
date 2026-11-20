import { useEffect, useRef, useState } from 'react';

/**
 * Le compte d'une rubrique, dit à voix basse quand un repli le fait changer.
 *
 * La pastille posée à côté de « Le réseau » annonce ce que la rubrique tient.
 * Elle change sous les yeux — souvent de plusieurs unités d'un seul geste —
 * sans que rien ne le dise : un lecteur d'écran n'entend pas un chiffre qui
 * tombe à côté de lui. Replier les huit types d'établissement retirait donc
 * huit portes au réseau en silence, et l'intitulé semblait s'alléger tout seul.
 *
 * Trois règles, et elles vont ensemble :
 *
 * 1. **Un repli, une occasion.** Seul un repli ouvre la parole : un compte qui
 *    bouge pour une autre raison — une recherche, une arrivée — a déjà sa voix
 *    (celle de la flèche, celle de la recherche), et l'entendre deux fois
 *    ferait du menu un compteur qu'on écoute.
 * 2. **La mesure, pas l'arithmétique.** Ce qui est annoncé est le chiffre relu
 *    sur la géométrie après le repli, jamais le compte d'avant moins les portes
 *    repliées : les deux ne tombent pas forcément ensemble, et c'est la mesure
 *    qui a le dernier mot.
 * 3. **Une phrase par rubrique changée**, lues ensemble : quand un repli touche
 *    deux rubriques, l'oreille les entend dans le même souffle.
 *
 * La phrase attend que la mesure soit posée : un menu se replie, puis se
 * remesure ; parler entre les deux dirait un chiffre qui n'existe plus.
 *
 * @param active   La surface est-elle ouverte ?
 * @param rubrics  Les rubriques et leur compte du moment, dans l'ordre du document.
 * @param foldSeq  L'occasion : un compteur qui ne recule pas, une par repli.
 * @param phrase   La phrase d'une rubrique, déjà accordée.
 */

export type RubricDoorCount = {
  /** L'identifiant de la rubrique, stable d'une mesure à l'autre. */
  id: string;
  /** Son nom, déjà traduit — « Le réseau », « Travailler », « Votre compte ». */
  label: string;
  /** Les portes qu'elle tient, relevées sur son bloc à elle. */
  count: number;
};

/** Le temps laissé à la mesure pour se poser après le repli. */
const SETTLE_MS = 760;

/**
 * Le temps au bout duquel un repli qui n'a rien changé se referme : une
 * rubrique sans porte mesurée ne doit pas garder la parole ouverte pour un
 * changement qui viendra plus tard, sans rapport avec elle.
 */
const PENDING_MS = 1600;

export function useRubricCountVoice(
  active: boolean,
  rubrics: RubricDoorCount[],
  foldSeq: number,
  phrase: (label: string, count: number) => string,
): string {
  const [said, setSaid] = useState('');
  /* Les comptes d'avant le repli : c'est la comparaison des deux relevés qui
     dit quelle rubrique a bougé, et de combien. */
  const beforeRef = useRef<Record<string, number> | null>(null);
  /* Le dernier repli pris en charge : un même repli ne se dit qu'une fois. */
  const seqRef = useRef(0);
  /* Un repli attend sa mesure. */
  const pendingRef = useRef(false);
  const settleRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<number | null>(null);
  /* Les deux dernières valeurs sont lues au moment où la phrase se dépose,
     jamais celles d'un rendu plus ancien. */
  const phraseRef = useRef(phrase);
  phraseRef.current = phrase;
  const rubricsRef = useRef(rubrics);
  rubricsRef.current = rubrics;

  /* La mesure entière, réduite à une clé : elle change dès qu'un compte bouge. */
  const key = rubrics.map((rubric) => `${rubric.id}:${rubric.count}`).join('|');

  /* Un repli ouvre l'occasion — et se referme seul s'il n'a rien retiré. */
  useEffect(() => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (!active) {
      pendingRef.current = false;
      return;
    }
    if (foldSeq <= 0 || foldSeq === seqRef.current) return;
    seqRef.current = foldSeq;
    pendingRef.current = true;
    /* La phrase du repli précédent s'efface : la suivante doit pouvoir se dire,
       même si elle se trouve être mot pour mot la même. */
    setSaid('');
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTimerRef.current = null;
      pendingRef.current = false;
    }, PENDING_MS);
  }, [active, foldSeq]);

  /* La mesure est posée : on dit ce que le repli a changé. */
  useEffect(() => {
    const rows = rubricsRef.current;
    if (!active) {
      beforeRef.current = null;
      pendingRef.current = false;
      if (settleRef.current !== null) {
        window.clearTimeout(settleRef.current);
        settleRef.current = null;
      }
      setSaid('');
      return;
    }
    const before = beforeRef.current;
    beforeRef.current = Object.fromEntries(rows.map((row) => [row.id, row.count]));
    /* Rien n'attend, ou pas encore de relevé d'avant : la mesure se contente
       de poser la référence. */
    if (!before || !pendingRef.current) return;
    const changed = rows.filter((row) => (
      before[row.id] !== undefined && before[row.id] !== row.count
    ));
    if (changed.length === 0) return;
    pendingRef.current = false;
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    const text = changed
      .map((row) => phraseRef.current(row.label, row.count))
      .filter(Boolean)
      .join(' · ');
    if (!text) return;
    if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      settleRef.current = null;
      setSaid(text);
    }, SETTLE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key, foldSeq]);

  /* La surface se referme, ou disparaît : les minuteries ne survivent pas. */
  useEffect(() => () => {
    if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    if (pendingTimerRef.current !== null) window.clearTimeout(pendingTimerRef.current);
    settleRef.current = null;
    pendingTimerRef.current = null;
  }, []);

  return said;
}