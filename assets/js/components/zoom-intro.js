/* Zoom Intro — vanilla JS port (Originkit "Infinite Text Passage")
   A full-screen overlay that cycles a few words zooming toward the viewer,
   then fades away to reveal the page underneath. Used as a short intro
   before a page's real content is shown (e.g. achievements.html). */

(function (global) {
  /**
   * initZoomIntro(overlayId, texts, opts)
   * opts.holdMs      — ms each word holds before the next zooms in (default 550)
   * opts.durationMs  — ms of the zoom transition itself (default 750)
   * opts.cycles      — how many words to show before finishing (default: texts.length)
   * opts.onComplete  — called once the intro has fully faded out
   */
  function initZoomIntro(overlayId, texts, opts) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) {
      if (opts && typeof opts.onComplete === "function") opts.onComplete();
      return null;
    }
    const words = Array.isArray(texts) && texts.length ? texts : ["LOADING"];
    const o = Object.assign({ holdMs: 550, durationMs: 750, cycles: words.length }, opts || {});

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const slot0 = document.createElement("span");
    const slot1 = document.createElement("span");
    slot0.className = "zoom-intro-slot";
    slot1.className = "zoom-intro-slot";
    overlay.appendChild(slot0);
    overlay.appendChild(slot1);

    function finish() {
      overlay.classList.add("zoom-intro-out");
      setTimeout(() => {
        overlay.style.display = "none";
        if (typeof o.onComplete === "function") o.onComplete();
      }, 500);
    }

    if (reduceMotion) {
      finish();
      return { skip: finish };
    }

    const slots = [slot0, slot1];
    let active = 0;
    let idx = 0;
    let shown = 0;

    slots[0].textContent = words[0];
    slots[0].style.transform = "scale(1)";
    slots[0].style.opacity = "1";
    slots[1].style.transform = "scale(0.05)";
    slots[1].style.opacity = "0";
    shown = 1;

    function step() {
      if (shown >= o.cycles) {
        finish();
        return;
      }
      setTimeout(() => {
        const incoming = 1 - active;
        const nextIdx = (idx + 1) % words.length;
        slots[incoming].textContent = words[nextIdx];
        slots[incoming].style.transition = "none";
        slots[incoming].style.transform = "scale(0.05)";
        slots[incoming].style.opacity = "0";
        // Force reflow so the transition below actually animates from this state.
        void slots[incoming].offsetWidth;

        slots[incoming].style.transition = `transform ${o.durationMs}ms cubic-bezier(.7,0,.25,1), opacity ${o.durationMs}ms cubic-bezier(.7,0,.25,1)`;
        slots[active].style.transition = `transform ${o.durationMs}ms cubic-bezier(.7,0,.25,1), opacity ${o.durationMs}ms cubic-bezier(.7,0,.25,1)`;
        slots[incoming].style.transform = "scale(1)";
        slots[incoming].style.opacity = "1";
        slots[active].style.transform = "scale(6)";
        slots[active].style.opacity = "0";

        active = incoming;
        idx = nextIdx;
        shown++;
        setTimeout(step, o.durationMs);
      }, o.holdMs);
    }
    setTimeout(step, o.holdMs);

    return { skip: finish };
  }

  global.initZoomIntro = initZoomIntro;
})(window);
