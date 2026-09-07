/* Mobile nav toggle — used on every page. */
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const navlinks = document.getElementById('navlinks');
  if (!burger || !navlinks) return;

  burger.addEventListener('click', () => navlinks.classList.toggle('open'));
  navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navlinks.classList.remove('open');
  }));
});
