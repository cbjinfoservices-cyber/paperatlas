import { useEffect } from 'react';

/**
 * Injects one JSON-LD block into the head and keeps it up to date.
 * The script is removed when the page unmounts or the payload changes, so a
 * detail page never leaves a stale JobPosting behind for the next route.
 */
export function useJsonLd(id: string, data: unknown) {
  const json = JSON.stringify(data);

  useEffect(() => {
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = json;

    return () => {
      const stale = document.getElementById(id);
      if (stale) stale.remove();
    };
  }, [id, json]);
}