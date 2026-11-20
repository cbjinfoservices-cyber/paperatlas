import { useEffect } from 'react';

/**
 * Coming back from a sheet to a board should land where the visitor left,
 * not at the top of the page.
 *
 * The browser does not do it for a single-page app: React Router swaps the
 * route without touching the scroll offset, and the offset of the sheet is
 * what stays behind. So each board keeps its own last position and replays it
 * when the visitor arrives through a back/forward move — never when they walk
 * in from the menu, which would drop them in the middle of a list.
 */

/* Back and forward are the only moves that fire popstate. A flag set at the
   event, read by the board that mounts right after it. */
let cameFromHistory = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    cameFromHistory = true;
    window.setTimeout(() => {
      cameFromHistory = false;
    }, 1200);
  });
}

const storeKey = (key: string) => `board-scroll:${key}`;

export function useScrollRestore(key: string) {
  useEffect(() => {
    const slot = storeKey(key);
    const shouldRestore = cameFromHistory;
    cameFromHistory = false;

    const saved = Number(sessionStorage.getItem(slot) ?? '0');
    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    /* The grid may still be filling in (images, revealed cards), so the very
       first jump can be short: try again a few times before giving up. */
    const restore = () => {
      if (cancelled || !Number.isFinite(saved) || saved <= 0) return;
      window.scrollTo(0, saved);
      if (attempts < 8 && Math.abs(window.scrollY - saved) > 6) {
        attempts += 1;
        timer = window.setTimeout(restore, 110);
      }
    };

    if (shouldRestore) {
      timer = window.setTimeout(restore, 40);
    }

    let frame = 0;
    let touched = false;
    let last = saved;

    const remember = (value: number) => {
      last = value;
      touched = true;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        remember(Math.round(window.scrollY));
        sessionStorage.setItem(slot, String(last));
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      /* Leaving the board: its last real offset is the one to come back to. */
      const left = touched ? last : saved;
      if (Number.isFinite(left) && left > 0) sessionStorage.setItem(slot, String(left));
    };
  }, [key]);
}