/* Scroll-reveal for any element with [data-reveal] — used on every page. */
document.addEventListener('DOMContentLoaded', () => {
  // Auto-tag every heading with the "zoom" reveal variant, so headings get a
  // consistent zoom-in entrance without needing [data-reveal] hand-added to
  // each one across every page. Skips anything already carrying the
  // attribute (e.g. the hero <h1>, which is tagged explicitly with its own
  // stagger delay).
  document.querySelectorAll('h1, .section-head h2, .page-banner h1').forEach(el => {
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'zoom');
  });

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => io.observe(el));
});
