/* Magnetic Carousel — vanilla JS port (Originkit "Magnetic Carousel")
   A row of thin image bars that magnify toward the cursor, dock-style.
   Click a bar to open it large; click again or the backdrop to close. */

(function (global) {
  const DEFAULTS = {
    collapsedWidth: 90,
    hoverWidth: 170,
    collapsedHeight: 260,
    hoverHeight: 320,
    openSize: 420,
    gap: 16,
    influence: 180,
    blur: 3,
    duration: 0.3,
  };

  /**
   * initMagneticCarousel(containerId, items, opts)
   * items: [{ src, alt }]  (extra fields are ignored by the carousel itself,
   * but are passed back whole to onHoverChange/onOpen/onClose so you can
   * keep title/date/description alongside each image.)
   */
  function initMagneticCarousel(containerId, items, opts) {
    const container = document.getElementById(containerId);
    if (!container || !items || !items.length) return null;

    const cfg = Object.assign({}, DEFAULTS, opts || {});
    const n = items.length;

    container.classList.add("mag-carousel");
    container.innerHTML = "";
    container.style.gap = cfg.gap + "px";
    container.style.minHeight = Math.max(cfg.hoverHeight, cfg.openSize) + "px";

    const backdrop = document.createElement("div");
    backdrop.className = "mag-backdrop";
    container.appendChild(backdrop);

    const bars = items.map((item) => {
      const bar = document.createElement("div");
      bar.className = "mag-bar";
      bar.style.backgroundImage = `url(${item.src})`;
      bar.style.width = cfg.collapsedWidth + "px";
      bar.style.height = cfg.collapsedHeight + "px";
      container.appendChild(bar);
      return bar;
    });

    let open = null;
    let closing = false;
    let closeTimer = null;
    const target = items.map(() => 0);
    const cur = items.map(() => 0);
    let loopId = 0;

    function applySizes() {
      bars.forEach((bar, i) => {
        let w, h;
        if (open != null) {
          if (i === open) { w = cfg.openSize; h = cfg.openSize; }
          else { w = cfg.collapsedWidth; h = cfg.collapsedHeight; }
        } else {
          const f = cur[i] || 0;
          w = cfg.collapsedWidth + (cfg.hoverWidth - cfg.collapsedWidth) * f;
          h = cfg.collapsedHeight + (cfg.hoverHeight - cfg.collapsedHeight) * f;
        }
        const blurred = open != null && i !== open;
        bar.style.width = w + "px";
        bar.style.height = h + "px";
        bar.style.filter = blurred ? `blur(${cfg.blur}px)` : "none";
        bar.style.opacity = blurred ? "0.6" : "1";
        bar.style.zIndex = open === i ? "3" : "2";
        bar.style.transition = (open != null || closing)
          ? `width ${cfg.duration}s ease, height ${cfg.duration}s ease, filter ${cfg.duration}s ease, opacity ${cfg.duration}s ease`
          : "none";
      });
      backdrop.style.pointerEvents = open != null ? "auto" : "none";
    }

    function fireHoverChange() {
      if (typeof cfg.onHoverChange !== "function") return;
      let maxI = -1, maxF = 0.15;
      cur.forEach((f, i) => { if (f > maxF) { maxF = f; maxI = i; } });
      if (maxI >= 0) cfg.onHoverChange(items[maxI], maxI);
    }

    function startLoop() {
      if (loopId) return;
      function step() {
        let moving = false;
        for (let i = 0; i < cur.length; i++) {
          const d = (target[i] || 0) - cur[i];
          if (Math.abs(d) > 0.001) { cur[i] += d * 0.2; moving = true; }
          else cur[i] = target[i] || 0;
        }
        applySizes();
        fireHoverChange();
        loopId = moving ? requestAnimationFrame(step) : 0;
      }
      loopId = requestAnimationFrame(step);
    }

    function setTargetFromCursor(clientX) {
      const rect = container.getBoundingClientRect();
      const cx = clientX - rect.left;
      const totalBase = n * cfg.collapsedWidth + (n - 1) * cfg.gap;
      const startX = (rect.width - totalBase) / 2;
      items.forEach((_, i) => {
        const center = startX + i * (cfg.collapsedWidth + cfg.gap) + cfg.collapsedWidth / 2;
        const dist = Math.abs(cx - center);
        const f = Math.max(0, 1 - dist / cfg.influence);
        target[i] = f * f * (3 - 2 * f);
      });
      startLoop();
    }

    container.addEventListener("mousemove", (e) => {
      if (open != null) return;
      setTargetFromCursor(e.clientX);
    });
    container.addEventListener("mouseleave", () => {
      if (open != null) return;
      items.forEach((_, i) => { target[i] = 0; });
      startLoop();
    });

    function closeOpen() {
      items.forEach((_, i) => { target[i] = 0; cur[i] = 0; });
      closing = true;
      open = null;
      applySizes();
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => { closing = false; applySizes(); }, cfg.duration * 1000);
      if (typeof cfg.onClose === "function") cfg.onClose();
    }

    bars.forEach((bar, i) => {
      bar.addEventListener("click", (e) => {
        e.stopPropagation();
        if (open === i) { closeOpen(); return; }
        open = i;
        applySizes();
        if (typeof cfg.onOpen === "function") cfg.onOpen(items[i], i);
      });
    });
    backdrop.addEventListener("click", closeOpen);

    function openIndex(i) {
      const idx = ((i % n) + n) % n;
      open = idx;
      applySizes();
      if (typeof cfg.onOpen === "function") cfg.onOpen(items[idx], idx);
    }

    applySizes();
    if (typeof cfg.onHoverChange === "function") cfg.onHoverChange(items[0], 0);

    return { close: closeOpen, openIndex };
  }

  global.initMagneticCarousel = initMagneticCarousel;
})(window);
