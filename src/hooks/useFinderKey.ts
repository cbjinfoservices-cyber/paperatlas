import { useEffect, type RefObject } from 'react';

/**
 * La touche « / » ouvre la recherche par nom depuis n'importe où sur la page :
 * un visiteur qui connaît l'atelier ou la plume n'a pas à viser le champ à la
 * souris. Les touches tapées dans un champ, un menu ou une zone de texte
 * gardent leur sens habituel — le raccourci ne vole jamais une frappe.
 */
export default function useFinderKey(inputRef: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName ? target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) return;
      }
      const field = inputRef.current;
      if (!field) return;
      event.preventDefault();
      field.focus();
      field.select();
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inputRef]);
}