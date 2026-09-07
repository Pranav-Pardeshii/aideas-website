/* Theme toggle — dark/light, persisted in localStorage.
   The <head> of every page also has a tiny inline script that applies the
   stored theme before first paint, to avoid a flash of the wrong theme. */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  syncIcon(current);

  if (!btn) return;
  btn.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', now);
    try { localStorage.setItem('aideas-theme', now); } catch (e) {}
    // The animated canvas backgrounds (Kinetic Grid / Paper Fold / Stardust)
    // are dark-theme-only and only start on page load — reload so the right
    // one starts (or none, in light mode) instead of trying to tear down and
    // rebuild a live WebGL/canvas scene in place.
    location.reload();
  });

  function syncIcon(theme) {
    if (!btn) return;
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
});
