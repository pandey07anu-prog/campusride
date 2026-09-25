import { useEffect, useRef } from 'react';

export default function useCountUp() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const els = node.querySelectorAll('[data-count]');
    if (!els.length) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    function format(n, prefix, suffix) {
      return (prefix || '') + Math.round(n).toLocaleString() + (suffix || '');
    }

    function run(el) {
      const target = parseFloat(el.getAttribute('data-count')) || 0;
      const prefix = el.getAttribute('data-count-prefix') || '';
      const suffix = el.getAttribute('data-count-suffix') || '';
      const dur = parseInt(el.getAttribute('data-count-duration'), 10) || 900;
      let start = null;

      function step(ts) {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased, prefix, suffix);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => {
        el.textContent = format(
          parseFloat(el.getAttribute('data-count')) || 0,
          el.getAttribute('data-count-prefix') || '',
          el.getAttribute('data-count-suffix') || ''
        );
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return ref;
}
