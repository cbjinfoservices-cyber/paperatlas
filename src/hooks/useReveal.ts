import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => {
      const siblings = el.parentElement
        ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal'))
        : [];
      el.style.setProperty('--i', String(siblings.indexOf(el)));
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}