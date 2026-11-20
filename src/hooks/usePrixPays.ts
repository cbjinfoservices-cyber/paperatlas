import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { memoriserPays, paysDevine, paysTrouve } from '@/lib/pays';

/** The address parameter that carries the market a link was made for. */
const PARAM = 'pays';

/**
 * The country written in the address, when a colleague shared a pricing link.
 * It opens on that market instead of the one this device remembered, so the
 * figures someone sends are the figures the reader sees.
 */
function paysDansAdresse(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = new URL(window.location.href).searchParams.get(PARAM);
    if (!raw) return null;
    const code = raw.toUpperCase();
    return paysTrouve(code) ? code : null;
  } catch {
    return null;
  }
}

const depuisAdresse = paysDansAdresse();

/**
 * The last address already honoured, so the very same link is not replayed when
 * a page mounts again — a market picked by hand is never undone by a stale
 * address left in the navigation history.
 */
let adresseHonoree: string | null = depuisAdresse;

/**
 * The country whose money the prices are read in. It starts on the country a
 * shared link names, then the one the visitor's browser points at — time zone,
 * then language — and every change a reader makes is remembered like the country
 * of a form, so the next page and the next visit open on the same money.
 */
let paysCourant = depuisAdresse ?? paysDevine();
if (depuisAdresse) memoriserPays(depuisAdresse);

const abonnes = new Set<(code: string) => void>();

/** The country read right now, for code outside a component. */
export function paysDuPrix(): string {
  return paysCourant;
}

/** Writes the market in the address, so the link on screen always says the same. */
export function ecrirePaysDansAdresse(code: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (!code) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, code);
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    /* the address bar is not essential to the price */
  }
}

/**
 * The address to hand someone, already opened on one market (and one reading
 * language when asked): « …/offres?pays=EG », so the same tariff table is read
 * on both sides of the message.
 */
export function lienPrix(code: string, lang?: string): string {
  if (typeof window === 'undefined') return `?pays=${code}`;
  try {
    const url = new URL(window.location.href);
    url.hash = '';
    url.searchParams.set(PARAM, code);
    if (lang) url.searchParams.set('lang', lang);
    return url.toString();
  } catch {
    return window.location.href;
  }
}

/**
 * L'adresse d'une ligne de la feuille des tarifs : le marché, puis l'ancre de sa
 * ligne. Une lecture copiée depuis la feuille emmène donc l'adresse de chaque
 * marché cité, et le collègue ouvre directement cette ligne-là.
 */
export function lienPrixLigne(code: string, lang?: string): string {
  const base = lienPrix(code, lang);
  try {
    const url = new URL(base);
    url.hash = `of-pays-${code}`;
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * L'adresse de la feuille elle-même, ouverte sur le marché lu : une relance
 * envoyée à un marché oublié ne le laisse pas au hasard du catalogue, elle
 * rouvre la feuille déjà posée sur son pays.
 */
export function lienFeuillePrix(code: string, lang?: string): string {
  const base = lienPrix(code, lang);
  try {
    const url = new URL(base);
    url.hash = 'of-pays-sheet';
    return url.toString();
  } catch {
    return base;
  }
}

/** Changes the country of the prices, remembers it, and keeps it in the address. */
export function changerPaysDuPrix(code: string): void {
  if (!paysTrouve(code) || code === paysCourant) return;
  memoriserPays(code);
  paysCourant = code;
  ecrirePaysDansAdresse(code);
  abonnes.forEach((fn) => fn(code));
}

/** One country shared by every price on screen, so no two figures disagree. */
export function usePrixPays() {
  const [pays, setPays] = useState(paysCourant);
  /* The address can hand a market over at any moment, not only when the site is
     first loaded: « voir la carte » from « Mon compte », the institution band or
     a shared tariff address all open on their own country. */
  const { search } = useLocation();

  useEffect(() => {
    const asked = new URLSearchParams(search).get(PARAM)?.toUpperCase();
    if (!asked || !paysTrouve(asked) || asked === adresseHonoree) return;
    adresseHonoree = asked;
    if (asked === paysCourant) return;
    memoriserPays(asked);
    paysCourant = asked;
    abonnes.forEach((fn) => fn(asked));
  }, [search]);

  useEffect(() => {
    const sync = (code: string) => setPays(code);
    abonnes.add(sync);
    setPays(paysCourant);
    return () => {
      abonnes.delete(sync);
    };
  }, []);

  const choisir = useCallback((code: string) => changerPaysDuPrix(code), []);

  return { pays, choisir };
}