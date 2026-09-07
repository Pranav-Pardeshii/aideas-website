/* Turns the fixed header into a floating "pill" once the page scrolls past
   the top — used on every page. */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (!header) return;

  const THRESHOLD = 40;
  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      header.classList.add('header-floating');
    } else {
      header.classList.remove('header-floating');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
