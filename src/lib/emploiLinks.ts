/**
 * The address a recruiter hands to a candidate: the offer itself, its reference
 * written in clear, and the reading language kept — so the sheet a candidate
 * opens is the one that was shared, with the reference already in the header.
 *
 * Kept apart from the copy button so any screen can build the very same address.
 */
export function emploiRefHref(offreId: string, reference: string, lang: string): string {
  if (!offreId) return '';
  const base = __BASE_PATH__.replace(/\/$/, '');
  const params = new URLSearchParams();
  if (reference) params.set('ref', reference);
  params.set('lang', lang);
  return `${window.location.origin}${base}/emplois/${encodeURIComponent(offreId)}?${params.toString()}`;
}

/** Copies an address, with the hidden-field fallback used by the other share doors. */
export async function copyEmploiAddress(href: string): Promise<boolean> {
  if (!href) return false;
  let ok = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(href);
      ok = true;
    }
  } catch {
    ok = false;
  }
  if (!ok) {
    try {
      const field = document.createElement('textarea');
      field.value = href;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.top = '-1000px';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      ok = document.execCommand('copy');
      document.body.removeChild(field);
    } catch {
      ok = false;
    }
  }
  return ok;
}