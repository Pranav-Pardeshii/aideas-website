/* Typewriter effect for the hero "Empowering ___" line — home page only. */
function initTypewriter(targetId, words, opts) {  const el = document.getElementById(targetId);
  if (!el) return;

  const o = Object.assign({
    typeSpeed: 55,    // ms per character while typing
    deleteSpeed: 30,  // ms per character while deleting
    holdTime: 1400,   // ms to pause on a fully-typed word
    gapTime: 400,     // ms to pause on an empty string before typing the next word
  }, opts || {});

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    el.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const word = words[wordIndex % words.length];

    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        setTimeout(tick, o.holdTime);
        return;
      }
      setTimeout(tick, o.typeSpeed);
    } else {
      charIndex--;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex++;
        setTimeout(tick, o.gapTime);
        return;
      }
      setTimeout(tick, o.deleteSpeed);
    }
  }

  tick();
}

/* Types a single multi-line string out once, then stops (cursor hides on
   done). Use for a headline that should type in on page load, as opposed to
   initTypewriter's endless word-cycling. */
function initTypewriterOnce(targetId, cursorId, text, opts) {
  const el = document.getElementById(targetId);
  const cursorEl = document.getElementById(cursorId);
  if (!el) return;

  const o = Object.assign({ speed: 38, startDelay: 600 }, opts || {});

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    el.textContent = text;
    if (cursorEl) cursorEl.style.display = 'none';
    return;
  }

  let i = 0;
  function tick() {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }
    setTimeout(tick, o.speed);
  }
  setTimeout(tick, o.startDelay);
}
